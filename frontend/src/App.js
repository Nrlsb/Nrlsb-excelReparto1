// src/App.js
// --- ARCHIVO MODIFICADO para rol de admin en la UI ---
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabaseClient';
import { 
  getRepartos, 
  addReparto as addRepartoAPI, 
  updateReparto as updateRepartoAPI,
  deleteReparto as deleteRepartoAPI,
  clearRepartos as clearRepartosAPI,
  updateProfile
} from './services/api';
import Header from './components/Header';
import RepartoForm from './components/RepartoForm';
import RepartosTable from './components/RepartosTable';
import Auth from './components/Auth';
import Account from './components/Account';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ConfirmationToast = ({ closeToast, onConfirm, message }) => (
  <div>
    <p className="mb-3 text-gray-700">{message}</p>
    <div className="flex justify-end gap-3">
      <button 
        className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75" 
        onClick={() => { onConfirm(); closeToast(); }}>
          Sí
      </button>
      <button 
        className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-200 rounded-lg shadow-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-75" 
        onClick={closeToast}>
          No
      </button>
    </div>
  </div>
);


function App() {
  const [session, setSession] = useState(null);
  const [repartos, setRepartos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);

  // --- NUEVO: Determinar si el usuario es admin ---
  const isAdmin = session?.user?.email === process.env.REACT_APP_ADMIN_EMAIL;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchRepartos();
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchRepartos();
      } else {
        setRepartos([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchRepartos = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getRepartos();
      setRepartos(data);
      setError(null);
    } catch (err) {
      setError('No se pudieron cargar los repartos. Asegúrate de que el backend esté funcionando.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!session) return;

    fetchRepartos();
    
    const channel = supabase
      .channel('repartos_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'repartos' },
        (payload) => {
          console.log('Cambio recibido!', payload);
          toast.info('La lista de repartos ha sido actualizada.');
          fetchRepartos();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session, fetchRepartos]);
  
  const handleUpdateUsername = async (newUsername) => {
    try {
      await updateProfile(newUsername);
      
      const { data, error } = await supabase.auth.refreshSession();
      if (error) throw error;
      if (data.session) setSession(data.session);

      toast.success('¡Nombre de usuario actualizado con éxito!');
      setIsAccountModalOpen(false);
    } catch (err) {
      console.error("Error al actualizar el perfil:", err);
    }
  };

  const handleAddReparto = async (repartoData) => {
    if (!session?.user) {
        toast.error("Debes iniciar sesión para agregar un reparto.");
        return;
    }
    try {
      await addRepartoAPI(repartoData);
      toast.success('Reparto agregado con éxito!');
    } catch (err) {
      setError('Error al agregar el reparto.');
      console.error(err);
    }
  };

  const handleUpdateReparto = async (id, repartoData) => {
    try {
      await updateRepartoAPI(id, repartoData);
      toast.success('Reparto actualizado con éxito!');
    } catch (err) {
      setError('Error al actualizar el reparto.');
      console.error(err);
    }
  };

  const handleDeleteReparto = (id) => {
    const confirmDelete = async () => {
      try {
        await deleteRepartoAPI(id);
        toast.success('Reparto eliminado con éxito.');
      } catch (err) {
        setError('Error al eliminar el reparto.');
        console.error(err);
      }
    };

    toast(<ConfirmationToast onConfirm={confirmDelete} message="¿Eliminar este reparto?" />, {
      autoClose: false, closeOnClick: false, draggable: false,
    });
  };

  const handleClearRepartos = () => {
    const confirmClear = async () => {
      try {
        await clearRepartosAPI();
        toast.success('Todos los repartos han sido eliminados.');
      } catch (err) {
        setError('Error al vaciar los repartos.');
        console.error(err);
      }
    };

    toast(<ConfirmationToast onConfirm={confirmClear} message="¿Estás seguro de que deseas vaciar TODOS los repartos?" />, {
      autoClose: false, closeOnClick: false, draggable: false,
    });
  };


  return (
    <div className="bg-gradient-to-br from-purple-50 to-indigo-100 min-h-screen p-4 sm:p-8">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <div className="max-w-7xl mx-auto bg-white/95 rounded-2xl shadow-xl p-6 sm:p-8 backdrop-blur-sm">
        {!session ? (
          <Auth />
        ) : (
          <>
            <Header session={session} onOpenAccountModal={() => setIsAccountModalOpen(true)} />
            <main>
              <RepartoForm onAddReparto={handleAddReparto} session={session} />
              {error && <p className="text-red-600 bg-red-100 border border-red-600 rounded-lg p-3 my-4">{error}</p>}
              <RepartosTable
                repartos={repartos}
                loading={loading}
                onClearRepartos={handleClearRepartos}
                onUpdateReparto={handleUpdateReparto}
                onDeleteReparto={handleDeleteReparto}
                isAdmin={isAdmin} // Pasamos el booleano de admin
              />
            </main>
            {isAccountModalOpen && (
              <Account
                session={session}
                onClose={() => setIsAccountModalOpen(false)}
                onSave={handleUpdateUsername}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default App;
