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
  const [optimizing, setOptimizing] = useState(false); // Nuevo estado para la optimización
  const [userRole, setUserRole] = useState('user');
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [rutaOptimizada, setRutaOptimizada] = useState(null);

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
      setRepartos(data);
      setRutaOptimizada(null);
    } catch (error) {
      toast.error("Error al cargar los repartos.");
      console.error("Error fetching repartos:", error);
    } finally {
      setLoading(false);
    }
  };
  
  // --- NUEVA FUNCIÓN PARA MANEJAR LA OPTIMIZACIÓN ---
  const handleOptimizeRepartos = async () => {
    if (repartos.length < 2) {
      toast.info('Necesitas al menos 2 repartos para optimizar la ruta.');
      return;
    }
    setOptimizing(true);
    try {
      const { data } = await api.post('/repartos/optimize', { repartos });
      setRepartos(data.repartosOrdenados);
      setRutaOptimizada(data.ruta);
      toast.success('¡Ruta optimizada con éxito!');
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'No se pudo optimizar la ruta.';
      toast.error(errorMessage);
      console.error("Error optimizing repartos:", error);
    } finally {
      setOptimizing(false);
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
              
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mt-8">
                <div className="lg:col-span-3">
                  <RepartosTable
                    repartos={repartos}
                    loading={loading}
                    optimizing={optimizing} // Pasamos el estado de optimización
                    onUpdateReparto={handleUpdateReparto}
                    onDeleteReparto={handleDeleteReparto}
                    onClearRepartos={handleClearRepartos}
                    onOptimizeRepartos={handleOptimizeRepartos} // Pasamos la nueva función
                    isAdmin={hasElevatedPermissions}
                    session={session}
                  />
                </div>
                <div className="lg:col-span-2">
                  <RepartoMap repartos={repartos} rutaOptimizada={rutaOptimizada} />
                </div>
              </div>
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
