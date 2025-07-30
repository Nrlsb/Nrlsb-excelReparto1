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

function App() {
  const [session, setSession] = useState(null);
  const [repartos, setRepartos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);

  // --- Efecto para manejar la sesión del usuario ---
  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      if (session) {
        api.defaults.headers.common['Authorization'] = `Bearer ${session.access_token}`;
        setIsAdmin(session.user.email === process.env.REACT_APP_ADMIN_EMAIL);
        fetchRepartos();
      } else {
        setLoading(false);
      }
    };
    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        api.defaults.headers.common['Authorization'] = `Bearer ${session.access_token}`;
        setIsAdmin(session.user.email === process.env.REACT_APP_ADMIN_EMAIL);
        fetchRepartos();
      } else {
        delete api.defaults.headers.common['Authorization'];
        setRepartos([]);
        setIsAdmin(false);
        setLoading(false);
      }
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
        fetchRepartos(); // Vuelve a cargar los datos para mantener todo sincronizado
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session]);

  // --- Funciones para interactuar con la API ---
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
      // El estado se actualizará automáticamente gracias a la suscripción en tiempo real
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

  const handleDeleteReparto = async (id) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar el reparto #${id}?`)) {
      try {
        await api.delete(`/repartos/${id}`);
        toast.info(`Reparto #${id} eliminado.`);
      } catch (error) {
        toast.error('No se pudo eliminar el reparto.');
        console.error('Error deleting reparto:', error);
      }
    }
  };
  
  const handleClearRepartos = async () => {
    const message = isAdmin 
      ? '¿Estás seguro de que quieres eliminar TODOS los repartos de la base de datos? Esta acción es irreversible.'
      : '¿Estás seguro de que quieres eliminar TODOS TUS repartos?';

    if (window.confirm(message)) {
      try {
        await api.delete('/repartos/all');
        toast.warn('Se han eliminado los repartos.');
      } catch (error) {
        toast.error('No se pudieron eliminar los repartos.');
        console.error('Error clearing repartos:', error);
      }
    }
  };

  const handleUpdateProfile = async (username) => {
    try {
      await api.put('/profile', { username });
      // Refresca la sesión para obtener los nuevos metadatos del usuario
      await supabase.auth.refreshSession();
      toast.success('Perfil actualizado.');
      setShowAccountModal(false);
    } catch (error) {
      toast.error('No se pudo actualizar el perfil.');
      console.error('Error updating profile:', error);
    }
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
                isAdmin={isAdmin}
                session={session} // --- ¡CORRECCIÓN AQUÍ! ---
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
      <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar={false} />
    </>
  );
}

export default App;
