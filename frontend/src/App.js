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
import Map from './components/Map';

function App() {
  const [session, setSession] = useState(null);
  const [repartos, setRepartos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('user');
  const [showAccountModal, setShowAccountModal] = useState(false);
  
  const [mapPolyline, setMapPolyline] = useState(null);
  const [showMap, setShowMap] = useState(false);


  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  useEffect(() => {
    const setupSession = async (session) => {
      setSession(session);
      if (session) {
        api.defaults.headers.common['Authorization'] = `Bearer ${session.access_token}`;
        
        try {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();
          
          if (error && error.code !== 'PGRST116') {
            throw error;
          }

          if (profile) {
            setUserRole(profile.role);
          } else {
            setTimeout(() => setupSession(session), 1500);
            return;
          }
        } catch (e) {
            console.error("Error al obtener el perfil del usuario:", e);
            setUserRole('user');
        }
        
        fetchRepartos();
      } else {
        delete api.defaults.headers.common['Authorization'];
        setRepartos([]);
        setUserRole('user');
        setLoading(false);
        setShowMap(false);
        setMapPolyline(null);
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      setupSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setupSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return;

    const channel = supabase
      .channel('repartos_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'repartos' }, (payload) => {
        console.log('Change received!', payload);
        fetchRepartos();
        setShowMap(false);
        setMapPolyline(null);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session]);

  const fetchRepartos = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/repartos');
      // --- CORRECCIÓN: Asegurarse de que los datos sean un array ---
      if (Array.isArray(data)) {
        setRepartos(data);
      } else {
        // Si la API devuelve algo inesperado, usamos un array vacío para evitar que la app se rompa.
        setRepartos([]);
        console.error("La API no devolvió un array para los repartos:", data);
        toast.error("Formato de datos inesperado del servidor.");
      }
    } catch (error) {
      toast.error("Error al cargar los repartos.");
      console.error("Error fetching repartos:", error);
      setRepartos([]); // Aseguramos que sea un array incluso en caso de error.
    } finally {
      setLoading(false);
    }
  };

  const handleAddReparto = async (newReparto) => {
    try {
      await api.post('/repartos', {
        ...newReparto,
        user_id: session.user.id,
      });
      toast.success('Reparto agregado con éxito.');
    } catch (error) {
      toast.error('No se pudo agregar el reparto.');
      console.error('Error adding reparto:', error);
    }
  };

  const handleUpdateReparto = async (id, updatedData) => {
    try {
      await api.put(`/repartos/${id}`, updatedData);
      toast.success(`Reparto #${id} actualizado.`);
    } catch (error) {
      toast.error('No se pudo actualizar el reparto.');
      console.error('Error updating reparto:', error);
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
          console.error('Error deleting reparto:', error);
        }
        closeConfirmModal();
      },
    });
  };
  
  const hasElevatedPermissions = userRole === 'admin' || userRole === 'especial';

  const handleClearRepartos = () => {
    const message = hasElevatedPermissions
      ? '¿Estás seguro de que quieres eliminar TODOS los repartos de la base de datos? Esta acción es irreversible.'
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
          console.error('Error clearing repartos:', error);
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
      console.error('Error updating profile:', error);
    }
  };

  const closeConfirmModal = () => {
    setConfirmState({ isOpen: false, title: '', message: '', onConfirm: () => {} });
  };

  const handleRouteOptimized = (data) => {
    setRepartos(data.optimizedRepartos);
    setMapPolyline(data.polyline);
    setShowMap(true);
  };

  const toggleMap = () => {
    if (!mapPolyline) {
        toast.info('Primero debes optimizar la ruta para poder ver el mapa.');
        return;
    }
    setShowMap(!showMap);
  }

  return (
    <>
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        {!session ? (
          <Auth />
        ) : (
          <div>
            <Header session={session} onOpenAccountModal={() => setShowAccountModal(true)} />
            <main>
              <RepartoForm onAddReparto={handleAddReparto} session={session} />
              {showMap && <Map repartos={repartos} polyline={mapPolyline} />}
              <RepartosTable
                repartos={repartos}
                loading={loading}
                onUpdateReparto={handleUpdateReparto}
                onDeleteReparto={handleDeleteReparto}
                onClearRepartos={handleClearRepartos}
                isAdmin={hasElevatedPermissions}
                session={session}
                onRouteOptimized={handleRouteOptimized}
                onToggleMap={toggleMap}
                showMap={showMap}
              />
            </main>
          </div>
        )}
      </div>
      {showAccountModal && (
        <Account
          session={session}
          onClose={() => setShowAccountModal(false)}
          onSave={handleUpdateProfile}
        />
      )}
      <ConfirmModal
        isOpen={confirmState.isOpen}
        onClose={closeConfirmModal}
        onConfirm={confirmState.onConfirm}
        title={confirmState.title}
      >
        {confirmState.message}
      </ConfirmModal>
      <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar={false} />
    </>
  );
}

export default App;
