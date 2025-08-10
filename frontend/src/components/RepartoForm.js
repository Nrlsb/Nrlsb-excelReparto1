// frontend/src/components/RepartoForm.js
import React, { useState, useEffect, useCallback } from 'react';
import { createReparto, getPlacePredictions } from '../services/api';
import { supabase } from '../supabaseClient';
import './RepartoForm.css'; // Asegúrate de tener este archivo CSS

const RepartoForm = ({ onRepartoAdded }) => {
  const [destino, setDestino] = useState('');
  const [direccion, setDireccion] = useState('');
  const [horarios, setHorarios] = useState('');
  const [bultos, setBultos] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const getSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const fetchSuggestions = useCallback(async (input) => {
    if (input.length > 2) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            const predictions = await getPlacePredictions(input, session.access_token);
            setSuggestions(predictions || []);
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
    }
  }, []);

  useEffect(() => {
    if (!isTyping) return;

    const handler = setTimeout(() => {
      fetchSuggestions(direccion);
    }, 500); // debounce de 500ms

    return () => {
      clearTimeout(handler);
    };
  }, [direccion, fetchSuggestions, isTyping]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!destino || !direccion || !user) {
      alert('Por favor, completa todos los campos.');
      return;
    }
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const nuevoReparto = {
          destino,
          direccion,
          horarios,
          bultos: parseInt(bultos, 10) || 1,
          agregado_por: user.email,
        };
        const data = await createReparto(nuevoReparto, session.access_token);
        onRepartoAdded(data);
        setDestino('');
        setDireccion('');
        setHorarios('');
        setBultos('');
        setSuggestions([]);
      }
    } catch (error) {
      console.error('Error al crear reparto:', error);
      alert(`Error al crear el reparto: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDireccionChange = (e) => {
    setIsTyping(true);
    setDireccion(e.target.value);
  };

  const handleSuggestionClick = (suggestion) => {
    setDireccion(suggestion.description);
    setSuggestions([]);
    setIsTyping(false);
  };

  return (
    <div className="reparto-form-container">
      <form onSubmit={handleSubmit} className="reparto-form">
        <div className="form-row">
          <input
            type="text"
            placeholder="Destino (Ej: Benitez Lucas)"
            value={destino}
            onChange={(e) => setDestino(e.target.value)}
            required
          />
          <div className="direccion-container">
            <input
              type="text"
              placeholder="Dirección (Ej: Cullen 1988)"
              value={direccion}
              onChange={handleDireccionChange}
              required
              autoComplete="off"
            />
            {suggestions.length > 0 && (
              <ul className="suggestions-list">
                {suggestions.map((suggestion) => (
                  <li
                    key={suggestion.place_id}
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion.description}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div className="form-row">
          <input
            type="text"
            placeholder="Horarios (Ej: 9-18hs)"
            value={horarios}
            onChange={(e) => setHorarios(e.target.value)}
          />
          <input
            type="number"
            placeholder="Bultos"
            value={bultos}
            onChange={(e) => setBultos(e.target.value)}
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Agregando...' : 'Agregar Reparto'}
        </button>
      </form>
    </div>
  );
};

export default RepartoForm;
