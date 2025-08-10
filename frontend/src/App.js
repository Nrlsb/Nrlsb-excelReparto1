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

function App() {
  const [session, setSession] = useState(null);
  const [repartos, setRepartos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('user'); // Estado para el rol del usuario
  const [showAccountModal, setShowAccountModal] = useState(false);

  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // --- Efecto para manejar la sesión y obtener el rol ---
  useEffect(() => {
    // Función para configurar la sesión y obtener datos del usuario
    const setupSession = async (session) => {
      setSession(session);
      if (session) {
        api.defaults.headers.common['Authorization'] = `Bearer ${session.access_token}`;
        
        // Obtenemos el perfil para saber el rol del usuario
        try {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();
          
          if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
            throw error;
          }

          if (profile) {
            setUserRole(profile.role);
          } else {
            // Si el perfil no existe aún (latencia del trigger), reintentamos
            setTimeout(() => setupSession(session), 1500);
            return;
          }
        } catch (e) {
            console.error("Error al obtener el perfil del usuario:", e);
            setUserRole('user'); // Fallback a rol básico por seguridad
        }
        
        fetchRepartos();
      } else {
        // Limpiar estado al cerrar sesión
        delete api.defaults.headers.common['Authorization'];
        setRepartos([]);
        setUserRole('user');
        setLoading(false);
      }
    };

    // Obtener sesión al cargar la app
    supabase.auth.getSession().then(({ data: { session } }) => {
      setupSession(session);
    });

    // Escuchar cambios en la autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setupSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // --- Efecto para la sincronización en tiempo real ---
  useEffect(() => {
    if (!session) return;

    const channel = supabase
      .channel('repartos_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'repartos' }, (payload) => {
        console.log('Change received!', payload);
        // Volvemos a cargar los repartos para reflejar el cambio
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
    } catch (error) {
      toast.error("Error al cargar los repartos.");
      console.error("Error fetching repartos:", error);
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
  
  // Variable para saber si el usuario tiene permisos elevados
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
      // Forzamos la actualización de la sesión para obtener los nuevos metadatos
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
              <RepartosTable
                repartos={repartos}
                loading={loading}
                onUpdateReparto={handleUpdateReparto}
                onDeleteReparto={handleDeleteReparto}
                onClearRepartos={handleClearRepartos}
                isAdmin={hasElevatedPermissions} // Pasamos la nueva variable de permisos
                session={session}
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
