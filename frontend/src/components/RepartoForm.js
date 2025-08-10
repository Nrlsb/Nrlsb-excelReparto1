// src/components/RepartoForm.js
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';

// Hook para debounce (sin cambios)
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

// Ícono para el marcador del mapa (sin cambios)
const customIcon = new Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png', shadowSize: [41, 41],
});

// Componente para el marcador arrastrable (sin cambios)
function DraggableMarker({ position, setPosition }) {
  const markerRef = useRef(null);
  const map = useMap();

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          setPosition(marker.getLatLng());
        }
      },
    }),
    [setPosition],
  );

  useEffect(() => {
    if (position) {
      map.setView(position, 16);
    }
  }, [position, map]);

  return (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={position}
      ref={markerRef}
      icon={customIcon}
    />
  );
}

function RepartoForm({ onAddReparto, session }) {
  const [destino, setDestino] = useState('');
  const [direccion, setDireccion] = useState('');
  const [horarios, setHorarios] = useState('');
  const [bultos, setBultos] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sugerencias, setSugerencias] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const debouncedDireccion = useDebounce(direccion, 400); // Reducimos un poco el delay
  
  const [markerPosition, setMarkerPosition] = useState(null);
  const GOOGLE_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

  // --- CAMBIO: Lógica para buscar sugerencias con Google Places API ---
  useEffect(() => {
    const buscarSugerencias = async () => {
      if (debouncedDireccion.length < 3) {
        setSugerencias([]);
        return;
      }
      if (!GOOGLE_API_KEY) {
        // No mostramos toast para no ser molestos, pero sí un error en consola.
        console.error("La clave de API de Google Maps no está configurada en el frontend.");
        return;
      }
      setIsSearching(true);
      try {
        // Usamos un proxy de CORS para evitar problemas en desarrollo. En producción, la restricción de API Key es suficiente.
        const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
        const apiUrl = `${proxyUrl}https://maps.googleapis.com/maps/api/place/autocomplete/json`;
        
        const response = await axios.get(apiUrl, {
          params: {
            input: debouncedDireccion,
            key: GOOGLE_API_KEY,
            components: 'country:ar', // Limitamos la búsqueda a Argentina
            language: 'es', // Pedimos resultados en español
          }
        });

        if (response.data.status === 'OK') {
          setSugerencias(response.data.predictions);
        } else {
          setSugerencias([]);
          if (response.data.status !== 'ZERO_RESULTS') {
            toast.error(`Error de Google Places: ${response.data.error_message || response.data.status}`);
          }
        }
      } catch (error) {
        toast.warn('No se pudieron obtener sugerencias de dirección.');
      } finally {
        setIsSearching(false);
      }
    };
    buscarSugerencias();
  }, [debouncedDireccion, GOOGLE_API_KEY]);

  // --- CAMBIO: Lógica para obtener coordenadas al hacer clic en una sugerencia ---
  const handleSuggestionClick = async (sugerencia) => {
    // Usamos el texto completo de la sugerencia para el campo de dirección
    setDireccion(sugerencia.description);
    setSugerencias([]); // Ocultamos la lista de sugerencias

    if (!GOOGLE_API_KEY) return;

    try {
      const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
      const apiUrl = `${proxyUrl}https://maps.googleapis.com/maps/api/geocode/json`;

      const response = await axios.get(apiUrl, {
        params: {
          place_id: sugerencia.place_id,
          key: GOOGLE_API_KEY,
        }
      });
      
      if (response.data.status === 'OK' && response.data.results.length > 0) {
        const { lat, lng } = response.data.results[0].geometry.location;
        setMarkerPosition({ lat, lng });
      } else {
        toast.error(`No se pudieron obtener las coordenadas: ${response.data.error_message || response.data.status}`);
      }
    } catch (error) {
      toast.error('Error al buscar coordenadas de la dirección.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!destino || !direccion || !bultos) {
      toast.warn('Por favor, completa los campos obligatorios.');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const agregadoPor = session?.user?.user_metadata?.username || session?.user?.email;
      const newReparto = {
        destino,
        direccion,
        horarios,
        bultos: parseInt(bultos),
        agregado_por: agregadoPor,
      };
      if (markerPosition) {
        newReparto.lat = markerPosition.lat;
        newReparto.lon = markerPosition.lng;
      }

      await onAddReparto(newReparto);
      
      setDestino('');
      setDireccion('');
      setHorarios('');
      setBultos('');
      setSugerencias([]);
      setMarkerPosition(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 p-6 rounded-xl mb-8 shadow-sm border border-gray-200">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input type="text" value={destino} onChange={(e) => setDestino(e.target.value)} placeholder="Destino" required className="w-full p-3 border-2 border-gray-300 rounded-lg"/>
            <div className="relative">
              <input type="text" value={direccion} onChange={(e) => setDireccion(e.target.value)} placeholder="Dirección" required autoComplete="off" className="w-full p-3 border-2 border-gray-300 rounded-lg"/>
              {(isSearching || sugerencias.length > 0) && (
                <ul className="absolute z-20 w-full bg-white border rounded-lg mt-1 max-h-60 overflow-y-auto shadow-lg">
                  {isSearching && <li className="px-4 py-2 text-gray-500">Buscando...</li>}
                  {sugerencias.map((sug) => (
                    <li key={sug.place_id} className="px-4 py-2 cursor-pointer hover:bg-purple-100" onClick={() => handleSuggestionClick(sug)}>
                      {sug.description}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <input type="text" value={horarios} onChange={(e) => setHorarios(e.target.value)} placeholder="Horarios (Ej: 9-18hs)" className="w-full p-3 border-2 border-gray-300 rounded-lg"/>
            <input type="number" value={bultos} onChange={(e) => setBultos(e.target.value)} placeholder="Bultos" required min="1" className="w-full p-3 border-2 border-gray-300 rounded-lg"/>
          </div>
          <div className="h-64 lg:h-auto rounded-lg overflow-hidden z-0">
            {markerPosition ? (
              <MapContainer center={markerPosition} zoom={16} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
                <DraggableMarker position={markerPosition} setPosition={setMarkerPosition} />
              </MapContainer>
            ) : (
              <div className="h-full bg-gray-200 flex items-center justify-center">
                <p className="text-gray-500">Selecciona una dirección para ver el mapa</p>
              </div>
            )}
          </div>
        </div>
        <button type="submit" className="w-full mt-4 p-3 border-none rounded-lg text-base font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:scale-105 disabled:opacity-60" disabled={isSubmitting}>
          {isSubmitting ? 'Agregando...' : 'Agregar Reparto'}
        </button>
      </form>
    </div>
  );
}

export default RepartoForm;
