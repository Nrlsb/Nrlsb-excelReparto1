import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabaseClient';
import { getRepartos, addReparto as addRepartoAPI, clearRepartos as clearRepartosAPI } from './services/api';
import Header from './components/Header';
import RepartoForm from './components/RepartoForm';
import RepartosTable from './components/RepartosTable';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

// Componente para la confirmación personalizada
const ConfirmationToast = ({ closeToast, onConfirm }) => (
  <div>
    <p>¿Estás seguro de que deseas vaciar TODOS los repartos?</p>
    <button className="btn btn-danger btn-small" onClick={() => { onConfirm(); closeToast(); }}>Sí, vaciar</button>
    <button className="btn btn-secondary btn-small" onClick={closeToast}>Cancelar</button>
  </div>
);


function App() {
  const [repartos, setRepartos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Función para cargar los repartos desde la API
  const fetchRepartos = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getRepartos();
      setRepartos(data);
      setError(null);
    } catch (err) {
      // El interceptor de Axios ya maneja la notificación del error
      setError('No se pudieron cargar los repartos. Asegúrate de que el backend esté funcionando.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Efecto para cargar los datos iniciales y suscribirse a los cambios
  useEffect(() => {
    fetchRepartos();

    // Suscripción a Supabase para actualizaciones en tiempo real
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

    // Limpieza: desuscribirse cuando el componente se desmonte
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchRepartos]);

  // Función para agregar un nuevo reparto
  const handleAddReparto = async (repartoData) => {
    try {
      await addRepartoAPI(repartoData);
      toast.success('Reparto agregado con éxito!');
      // La actualización del estado la maneja la suscripción de Supabase
    } catch (err) {
      // El interceptor de Axios ya maneja la notificación del error
      setError('Error al agregar el reparto.');
      console.error(err);
    }
  };

  // Función para vaciar todos los repartos
  const handleClearRepartos = () => {
    const confirmClear = async () => {
      try {
        await clearRepartosAPI();
        toast.success('Todos los repartos han sido eliminados.');
        // La actualización del estado la maneja la suscripción de Supabase
      } catch (err) {
        setError('Error al vaciar los repartos.');
        console.error(err);
      }
    };

    toast(<ConfirmationToast onConfirm={confirmClear} />, {
      autoClose: false,
      closeOnClick: false,
      draggable: false,
    });
  };

  return (
    <div className="container">
      <ToastContainer
        position="top-right"
        autoClose={5000}
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
        />
      </main>
    </div>
  );
}

export default App;
