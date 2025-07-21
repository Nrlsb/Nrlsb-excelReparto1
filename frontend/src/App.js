import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabaseClient';
import { 
  getRepartos, 
  addReparto as addRepartoAPI, 
  updateReparto as updateRepartoAPI,
  deleteReparto as deleteRepartoAPI,
  clearRepartos as clearRepartosAPI 
} from './services/api';
import Header from './components/Header';
import RepartoForm from './components/RepartoForm';
import RepartosTable from './components/RepartosTable';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

// Componente para la confirmación personalizada
const ConfirmationToast = ({ closeToast, onConfirm, message }) => (
  <div className="confirmation-toast">
    <p>{message}</p>
    <div>
      <button className="btn btn-danger btn-small" onClick={() => { onConfirm(); closeToast(); }}>Sí</button>
      <button className="btn btn-secondary btn-small" onClick={closeToast}>No</button>
    </div>
  </div>
);


function App() {
  const [repartos, setRepartos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
  }, [fetchRepartos]);

  const handleAddReparto = async (repartoData) => {
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
      autoClose: false,
      closeOnClick: false,
      draggable: false,
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
      autoClose: false,
      closeOnClick: false,
      draggable: false,
    });
  };

  return (
    <div className="container">
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
      <Header />
      <main>
        <RepartoForm onAddReparto={handleAddReparto} />
        {error && <p className="error-message">{error}</p>}
        <RepartosTable
          repartos={repartos}
          loading={loading}
          onClearRepartos={handleClearRepartos}
          onUpdateReparto={handleUpdateReparto}
          onDeleteReparto={handleDeleteReparto}
        />
      </main>
    </div>
  );
}

export default App;
