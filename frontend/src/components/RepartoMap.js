import React, { useState, useEffect, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker, DirectionsRenderer } from '@react-google-maps/api';
import { optimizeRoute } from '../services/api';

// Estilos para el contenedor del mapa
const containerStyle = {
  width: '100%',
  height: '60vh'
};

// Centro inicial del mapa (se ajustará automáticamente)
const initialCenter = {
  lat: -34.397,
  lng: 150.644
};

function RepartoMap({ repartos, onClose }) {
  const [map, setMap] = useState(null);
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [optimizedRepartos, setOptimizedRepartos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Carga el script de Google Maps de forma asíncrona
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
  });

  // Efecto para llamar a la API de optimización cuando el componente se monta
  useEffect(() => {
    const getOptimizedRoute = async () => {
      const validRepartos = repartos.filter(r => r.lat && r.lng);
      if (validRepartos.length < 2) {
        setError("No hay suficientes repartos con ubicación para mostrar una ruta.");
        setLoading(false);
        return;
      }

      try {
        const response = await optimizeRoute(validRepartos);
        setOptimizedRepartos(response.data.optimizedRepartos);
      } catch (err) {
        setError(err.response?.data?.error || "Error al optimizar la ruta.");
        setLoading(false);
      }
    };
    getOptimizedRoute();
  }, [repartos]);

  // Efecto para calcular y dibujar la ruta una vez que tenemos los repartos optimizados
  useEffect(() => {
    if (optimizedRepartos.length > 0) {
        calculateRoute();
    }
  }, [optimizedRepartos]);


  const calculateRoute = async () => {
    if (optimizedRepartos.length < 2) return;

    const directionsService = new window.google.maps.DirectionsService();
    
    const origin = optimizedRepartos[0];
    const destination = optimizedRepartos[optimizedRepartos.length - 1];
    const waypoints = optimizedRepartos.slice(1, -1).map(r => ({
      location: { lat: r.lat, lng: r.lng },
      stopover: true,
    }));

    const result = await directionsService.route({
      origin: { lat: origin.lat, lng: origin.lng },
      destination: { lat: destination.lat, lng: destination.lng },
      waypoints: waypoints,
      travelMode: window.google.maps.TravelMode.DRIVING,
    });

    setDirectionsResponse(result);
    setLoading(false);
  };

  const onLoad = useCallback(function callback(mapInstance) {
    // Ajusta los límites del mapa para que todos los marcadores sean visibles
    const bounds = new window.google.maps.LatLngBounds();
    repartos.forEach(r => {
      if (r.lat && r.lng) {
        bounds.extend({ lat: r.lat, lng: r.lng });
      }
    });
    mapInstance.fitBounds(bounds);
    setMap(mapInstance);
  }, [repartos]);

  const onUnmount = useCallback(function callback(map) {
    setMap(null);
  }, []);

  if (loadError) return <div>Error al cargar el mapa.</div>;
  if (!isLoaded || loading) return <div>Cargando mapa y optimizando ruta...</div>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Ruta de Reparto Optimizada</h2>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={initialCenter}
        zoom={8}
        onLoad={onLoad}
        onUnmount={onUnmount}
      >
        {/* Dibuja la ruta en el mapa */}
        {directionsResponse && (
          <DirectionsRenderer directions={directionsResponse} />
        )}

        {/* Si no hay ruta, muestra los marcadores individuales */}
        {!directionsResponse && repartos.map((reparto) => (
          reparto.lat && <Marker key={reparto.id} position={{ lat: reparto.lat, lng: reparto.lng }} />
        ))}
      </GoogleMap>

      <div className="mt-4">
        <h3 className="font-semibold">Orden de Visita Sugerido:</h3>
        <ol className="list-decimal list-inside">
          {optimizedRepartos.map((reparto, index) => (
            <li key={reparto.id}>{index + 1}. {reparto.cliente} - {reparto.direccion}</li>
          ))}
        </ol>
      </div>

      <button onClick={onClose} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
        Cerrar Mapa
      </button>
    </div>
  );
}

export default React.memo(RepartoMap);
