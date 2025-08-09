// src/components/RepartoForm.js
import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';

// Hook simple para debounce (retrasar la ejecución de una función)
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};


function RepartoForm({ onAddReparto, session }) {
  const [destino, setDestino] = useState('');
  const [direccion, setDireccion] = useState('');
  const [horarios, setHorarios] = useState('');
  const [bultos, setBultos] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Estados para el autocompletado ---
  const [sugerencias, setSugerencias] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const debouncedDireccion = useDebounce(direccion, 500); // 500ms de retraso

  // Efecto para buscar sugerencias de direcciones
  useEffect(() => {
    const buscarSugerencias = async () => {
      if (debouncedDireccion.length < 3) {
        setSugerencias([]);
        return;
      }
      setIsSearching(true);
      try {
        // Limitamos la búsqueda a Argentina para mayor precisión
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(debouncedDireccion)}&countrycodes=ar`;
        const response = await axios.get(url, {
          headers: { 'User-Agent': 'RepartosApp/1.0' }
        });
        setSugerencias(response.data);
      } catch (error) {
        console.error("Error al buscar sugerencias:", error);
        toast.warn('No se pudieron obtener sugerencias de dirección.');
      } finally {
        setIsSearching(false);
      }
    };

    buscarSugerencias();
  }, [debouncedDireccion]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!destino || !direccion || !bultos) {
      toast.warn('Por favor, completa los campos obligatorios.');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const agregadoPor = session?.user?.user_metadata?.username || session?.user?.email;

      await onAddReparto({
        destino,
        direccion,
        horarios,
        bultos: parseInt(bultos),
        agregado_por: agregadoPor,
      });
      
      // Limpiar formulario
      setDestino('');
      setDireccion('');
      setHorarios('');
      setBultos('');
      setSugerencias([]); // Limpiar sugerencias
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuggestionClick = (sugerencia) => {
    setDireccion(sugerencia.display_name);
    setSugerencias([]);
  };

  return (
    <div className="bg-gray-50 p-6 rounded-xl mb-8 shadow-sm border border-gray-200">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
          <input 
            type="text" 
            value={destino} 
            onChange={(e) => setDestino(e.target.value)} 
            placeholder="Destino" 
            required 
            className="w-full p-3 border-2 border-gray-300 rounded-lg text-base transition duration-300 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
          />
          {/* --- Campo de Dirección con Autocompletado --- */}
          <div className="relative">
            <input 
              type="text" 
              value={direccion} 
              onChange={(e) => setDireccion(e.target.value)} 
              placeholder="Dirección" 
              required 
              autoComplete="off"
              className="w-full p-3 border-2 border-gray-300 rounded-lg text-base transition duration-300 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
            />
            {/* --- Lista de Sugerencias --- */}
            {(isSearching || sugerencias.length > 0) && (
              <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-60 overflow-y-auto shadow-lg">
                {isSearching && <li className="px-4 py-2 text-gray-500">Buscando...</li>}
                {sugerencias.map((sug) => (
                  <li 
                    key={sug.place_id}
                    className="px-4 py-2 cursor-pointer hover:bg-purple-100"
                    onClick={() => handleSuggestionClick(sug)}
                  >
                    {sug.display_name}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <input 
            type="text" 
            value={horarios} 
            onChange={(e) => setHorarios(e.target.value)} 
            placeholder="Horarios (Ej: 9-18hs)" 
            className="w-full p-3 border-2 border-gray-300 rounded-lg text-base transition duration-300 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
          />
          <input 
            type="number" 
            value={bultos} 
            onChange={(e) => setBultos(e.target.value)} 
            placeholder="Bultos" 
            required 
            min="1" 
            className="w-full p-3 border-2 border-gray-300 rounded-lg text-base transition duration-300 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
          />
        </div>
        <button 
          type="submit" 
          className="w-full p-3 border-none rounded-lg text-base font-semibold cursor-pointer transition-transform duration-200 uppercase tracking-wider text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100" 
          disabled={isSubmitting}>
          {isSubmitting ? 'Agregando...' : 'Agregar Reparto'}
        </button>
      </form>
    </div>
  );
}

export default RepartoForm;
