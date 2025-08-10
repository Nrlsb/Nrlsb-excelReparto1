// frontend/src/components/RepartoMap.js
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Icon } from 'leaflet';

// Ícono para los puntos de reparto
const customIcon = new Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  shadowSize: [41, 41],
});

// Ícono para la ubicación del repartidor
const userLocationIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  shadowSize: [41, 41],
});

const FitBounds = ({ bounds }) => {
  const map = useMap(); 
  useEffect(() => {
    if (bounds && bounds.length > 0) {
      if (bounds.length === 1) {
        map.setView(bounds[0], 15);
      } else {
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [bounds, map]);
  return null;
};

const MapPlaceholder = () => (
  <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg">
    <p className="text-gray-500">Cargando mapa...</p>
  </div>
);

function RepartoMap({ repartos, rutaOptimizada, userLocation }) {
  const [markers, setMarkers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bounds, setBounds] = useState(null);

  useEffect(() => {
    const geocodeRepartos = async () => {
      if (!repartos || repartos.length === 0) {
        setMarkers([]);
        return;
      }
      setLoading(true);
      const promises = repartos.map(reparto =>
        // CORRECCIÓN: Se envía solo la dirección para mejorar la precisión.
        axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(reparto.direccion)}`)
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
      } catch (error) {
        toast.error("Hubo un problema al buscar las direcciones.");
      } finally {
        setLoading(false);
      }
    };
    geocodeRepartos();
  }, [repartos]);

  useEffect(() => {
    const allPoints = [...markers.map(m => m.position)];
    if (userLocation) {
      allPoints.push([userLocation.lat, userLocation.lon]);
    }
    
    if (allPoints.length > 0) {
      setBounds(allPoints);
    } else {
      setBounds(null);
    }
  }, [markers, userLocation]);

  return (
    <div className="bg-white rounded-xl shadow-md p-4 h-full relative">
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
          <p className="text-gray-600 font-semibold">Buscando direcciones en el mapa...</p>
        </div>
      )}
      <MapContainer 
        center={userLocation ? [userLocation.lat, userLocation.lon] : [-31.4433, -60.9333]} 
        zoom={13} 
        style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}
        placeholder={<MapPlaceholder />}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lon]} icon={userLocationIcon}>
            <Popup><b>Punto de Partida</b><br />Tu ubicación actual.</Popup>
          </Marker>
        )}

        {markers.map(marker => (
          <Marker key={marker.id} position={marker.position} icon={customIcon}>
            <Popup><div dangerouslySetInnerHTML={{ __html: marker.popup }} /></Popup>
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
