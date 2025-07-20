import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabaseClient';
import { getRepartos, addReparto as addRepartoAPI, clearRepartos as clearRepartosAPI } from './services/api';
import Header from './components/Header';
import RepartoForm from './components/RepartoForm';
import RepartosTable from './components/RepartosTable';
import './App.css';

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
          // Vuelve a cargar todos los datos para mantener la consistencia
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
      // No es necesario actualizar el estado aquí,
      // la suscripción de Supabase lo hará automáticamente.
      await addRepartoAPI(repartoData);
    } catch (err) {
      setError('Error al agregar el reparto.');
      console.error(err);
    }
  };

  // Función para vaciar todos los repartos
  const handleClearRepartos = async () => {
    if (window.confirm('¿Estás seguro de que deseas vaciar TODOS los repartos?')) {
      try {
        await clearRepartosAPI();
        // El cambio también será detectado por Supabase
      } catch (err) {
        setError('Error al vaciar los repartos.');
        console.error(err);
      }
    }
  };

  return (
    <div className="container">
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
