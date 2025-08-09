// frontend/src/components/RepartoMap.js
import React, { useEffect, useState } from 'react';
// CORRECCIÓN: Se importa el hook 'useMap' para acceder a la instancia del mapa.
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import axios from 'axios';
import { toast } from 'react-toastify';

// Componente para el ícono personalizado
import { Icon } from 'leaflet';

// Creación de un ícono personalizado para los marcadores
const customIcon = new Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  shadowSize: [41, 41],
});

// Componente interno para ajustar los límites del mapa dinámicamente
const FitBounds = ({ bounds }) => {
  // CORRECCIÓN: Se utiliza el hook useMap() para obtener la instancia del mapa de forma segura.
  const map = useMap(); 
  useEffect(() => {
    if (bounds && bounds.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [bounds, map]);
  return null;
};


function RepartoMap({ repartos, rutaOptimizada }) {
  const [markers, setMarkers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bounds, setBounds] = useState(null);

  // Efecto para geocodificar las direcciones cuando cambian los repartos
  useEffect(() => {
    const geocodeRepartos = async () => {
      if (!repartos || repartos.length === 0) {
        setMarkers([]);
        setBounds(null);
        return;
      }

      setLoading(true);
      // Usamos Promise.allSettled para manejar errores individuales sin detener todo
      const promises = repartos.map(reparto =>
        axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(reparto.direccion + ', Argentina')}`, {
          headers: { 'User-Agent': 'RepartosApp/1.0' }
        })
      );

      try {
        const results = await Promise.allSettled(promises);
        const newMarkers = results
          .map((result, index) => {
            if (result.status === 'fulfilled' && result.value.data && result.value.data.length > 0) {
              const { lat, lon } = result.value.data[0];
              return {
                position: [parseFloat(lat), parseFloat(lon)],
                popup: `<b>${repartos[index].destino}</b><br>${repartos[index].direccion}`,
                id: repartos[index].id,
              };
            }
            toast.warn(`No se pudo encontrar la dirección: "${repartos[index].direccion}"`);
            return null;
          })
          .filter(marker => marker !== null);

        setMarkers(newMarkers);

        if (newMarkers.length > 0) {
          const markerPositions = newMarkers.map(m => m.position);
          setBounds(markerPositions);
        } else {
          setBounds(null);
        }
      } catch (error) {
        console.error("Error en la geocodificación:", error);
        toast.error("Hubo un problema al buscar las direcciones.");
      } finally {
        setLoading(false);
      }
    };

    geocodeRepartos();
  }, [repartos]);

  return (
    <div className="bg-white rounded-xl shadow-md p-4 h-96 lg:h-full relative">
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
          <p className="text-gray-600 font-semibold">Buscando direcciones en el mapa...</p>
        </div>
      )}
      <MapContainer center={[-34.6037, -58.3816]} zoom={4} style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {markers.map(marker => (
          <Marker key={marker.id} position={marker.position} icon={customIcon}>
            <Popup>
              <div dangerouslySetInnerHTML={{ __html: marker.popup }} />
            </Popup>
          </Marker>
        ))}
        {rutaOptimizada && (
          <Polyline pathOptions={{ color: '#3b82f6', weight: 5 }} positions={rutaOptimizada} />
        )}
        {bounds && <FitBounds bounds={bounds} />}
      </MapContainer>
    </div>
  );
}

export default React.memo(RepartoMap);
