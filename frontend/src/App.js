// frontend/src/App.js
import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import api from './services/api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Auth from './components/Auth';
import Header from './components/Header';
import Account from './components/Account';
import RepartoForm from './components/RepartoForm';
import RepartosTable from './components/RepartosTable';
import ConfirmModal from './components/ConfirmModal';
import RepartoMap from './components/RepartoMap';

function App() {
  const [session, setSession] = useState(null);
  const [repartos, setRepartos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [optimizing, setOptimizing] = useState(false);
  const [userRole, setUserRole] = useState('user');
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [rutaOptimizada, setRutaOptimizada] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [activeView, setActiveView] = useState('lista');

  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const fetchRepartos = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/repartos');
      setRepartos(data);
      setRutaOptimizada(null); // Limpiamos la ruta al recargar los datos
    } catch (error) {
      toast.error("Error al cargar los repartos.");
      console.error("Error fetching repartos:", error);
    } finally {
      setLoading(false);
    }
  };
  
  // Función separada para obtener el perfil del usuario
  const fetchUserProfile = async (user) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }
      if (profile) {
        setUserRole(profile.role);
      }
    } catch (e) {
      console.error("Error al obtener el perfil del usuario:", e);
      setUserRole('user'); // Fallback a rol básico por seguridad
    }
  };

  // --- EFECTO DE SESIÓN REFACTORIZADO ---
  useEffect(() => {
    const handleAuthChange = async (session) => {
      setSession(session);
      if (session) {
        api.defaults.headers.common['Authorization'] = `Bearer ${session.access_token}`;
        // Obtenemos el perfil y los repartos en secuencia
        await fetchUserProfile(session.user);
        await fetchRepartos();
      } else {
        // Limpiar todo al cerrar sesión
        delete api.defaults.headers.common['Authorization'];
        setRepartos([]);
        setUserRole('user');
        setRutaOptimizada(null);
        setUserLocation(null);
        setLoading(false); // Aseguramos que no se quede cargando
      }
    };

    // Verificación inicial de la sesión
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleAuthChange(session);
    });

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleAuthChange(session);
    });

    return () => subscription.unsubscribe();
  }, []); // Este efecto se ejecuta solo una vez al montar el componente

  useEffect(() => {
    if (!session) return;

    const channel = supabase
      .channel('repartos_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'repartos' }, (payload) => {
        console.log('Change received!', payload);
        fetchRepartos();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session]);

  const handleOptimizeRepartos = () => {
    if (repartos.length < 1) {
      toast.info('Necesitas al menos 1 reparto para optimizar la ruta.');
      return;
    }
    setOptimizing(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const startLocation = { lat: latitude, lon: longitude };
        setUserLocation(startLocation);

        try {
          const { data } = await api.post('/repartos/optimize', { repartos, startLocation });
          setRepartos(data.repartosOrdenados);
          setRutaOptimizada(data.ruta);
          toast.success('¡Ruta optimizada desde tu ubicación!');
        } catch (error) {
          const errorMessage = error.response?.data?.error || 'No se pudo optimizar la ruta.';
          toast.error(errorMessage);
        } finally {
          setOptimizing(false);
        }
      },
      (error) => {
        console.error("Error obteniendo la geolocalización:", error);
        toast.error('No se pudo obtener tu ubicación. Por favor, activa los permisos de localización en tu navegador.');
        setOptimizing(false);
      }
    );
  };

  const handleAddReparto = async (newReparto) => {
    try {
      await api.post('/repartos', { ...newReparto, user_id: session.user.id });
      toast.success('Reparto agregado con éxito.');
    } catch (error) {
      toast.error('No se pudo agregar el reparto.');
    }
  };

  const handleUpdateReparto = async (id, updatedData) => {
    try {
      await api.put(`/repartos/${id}`, updatedData);
      toast.success(`Reparto #${id} actualizado.`);
    } catch (error) {
      toast.error('No se pudo actualizar el reparto.');
    }
  };

  const handleDeleteReparto = (id) => {
    setConfirmState({
      isOpen: true,
      title: 'Confirmar Eliminación',
      message: `¿Estás seguro de que quieres eliminar el reparto #${id}?`,
      onConfirm: async () => {
        try {
          await api.delete(`/repartos/${id}`);
          toast.info(`Reparto #${id} eliminado.`);
        } catch (error) {
          toast.error('No se pudo eliminar el reparto.');
        }
        closeConfirmModal();
      },
    });
  };
  
  const hasElevatedPermissions = userRole === 'admin' || userRole === 'especial';

  const handleClearRepartos = () => {
    const message = hasElevatedPermissions
      ? '¿Estás seguro de que quieres eliminar TODOS los repartos? Esta acción es irreversible.'
      : '¿Estás seguro de que quieres eliminar TODOS TUS repartos?';

    setConfirmState({
      isOpen: true,
      title: 'Confirmar Vaciado',
      message: message,
      onConfirm: async () => {
        try {
          await api.delete('/repartos/all');
          toast.warn('Se han eliminado los repartos.');
        } catch (error) {
          toast.error('No se pudieron eliminar los repartos.');
        }
        closeConfirmModal();
      },
    });
  };

  const handleUpdateProfile = async (username) => {
    try {
      await api.put('/profile', { username });
      await supabase.auth.refreshSession();
      toast.success('Perfil actualizado.');
      setShowAccountModal(false);
    } catch (error) {
      toast.error('No se pudo actualizar el perfil.');
    }
  };

  const closeConfirmModal = () => setConfirmState({ isOpen: false });

  const tabBaseClass = "px-4 py-3 font-semibold text-sm rounded-t-lg focus:outline-none transition-colors duration-200";
  const activeTabClass = "bg-white text-purple-600 border-b-2 border-purple-600";
  const inactiveTabClass = "text-gray-500 hover:text-purple-600 bg-gray-50";

  return (
    <>
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        {!session ? <Auth /> : (
          <div>
            <Header session={session} onOpenAccountModal={() => setShowAccountModal(true)} />
            <main>
              <div className="mb-6 border-b border-gray-200">
                <nav className="-mb-px flex space-x-2" aria-label="Tabs">
                  <button onClick={() => setActiveView('lista')} className={`${tabBaseClass} ${activeView === 'lista' ? activeTabClass : inactiveTabClass}`}>
                    📝 Lista de Repartos
                  </button>
                  <button onClick={() => setActiveView('mapa')} className={`${tabBaseClass} ${activeView === 'mapa' ? activeTabClass : inactiveTabClass}`}>
                    🗺️ Mapa y Ruta
                  </button>
                </nav>
              </div>

              {activeView === 'lista' && (
                <div>
                  <RepartoForm onAddReparto={handleAddReparto} session={session} />
                  <div className="mt-8">
                    <RepartosTable
                      repartos={repartos} loading={loading} onUpdateReparto={handleUpdateReparto}
                      onDeleteReparto={handleDeleteReparto} onClearRepartos={handleClearRepartos}
                      isAdmin={hasElevatedPermissions} session={session}
                    />
                  </div>
                </div>
              )}

              {activeView === 'mapa' && (
                <div>
                  <div className="flex flex-wrap gap-4 mb-5">
                    <button 
                      className="px-5 py-2 border-none rounded-lg text-sm font-semibold cursor-pointer transition-transform duration-200 uppercase tracking-wider text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:scale-105 disabled:opacity-60"
                      onClick={handleOptimizeRepartos}
                      disabled={optimizing || repartos.length < 1}
                    >
                      {optimizing ? 'Optimizando...' : '🗺️ Optimizar Ruta desde mi Ubicación'}
                    </button>
                  </div>
                  <div className="h-[75vh] w-full">
                    <RepartoMap repartos={repartos} rutaOptimizada={rutaOptimizada} userLocation={userLocation} />
                  </div>
                </div>
              )}
            </main>
          </div>
        )}
      </div>
      {showAccountModal && <Account session={session} onClose={() => setShowAccountModal(false)} onSave={handleUpdateProfile} />}
      <ConfirmModal isOpen={confirmState.isOpen} onClose={closeConfirmModal} onConfirm={confirmState.onConfirm} title={confirmState.title}>
        {confirmState.message}
      </ConfirmModal>
      <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar={false} />
    </>
  );
}

export default App;
