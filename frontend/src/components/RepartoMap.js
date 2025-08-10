// frontend/src/components/RepartoMap.js
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Icon } from 'leaflet';

// Íconos y componentes auxiliares (sin cambios)
const customIcon = new Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  shadowSize: [41, 41],
});

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
  const GOOGLE_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

  // --- CAMBIO: Lógica para geocodificar direcciones con Google Geocoding API ---
  useEffect(() => {
    const geocodeRepartos = async () => {
      if (!repartos || repartos.length === 0) {
        setMarkers([]);
        return;
      }
      if (!GOOGLE_API_KEY) {
        console.error("La clave de API de Google Maps no está configurada en el frontend.");
        return;
      }

      setLoading(true);
      
      const promises = repartos.map(reparto => {
        // Si ya tenemos latitud y longitud, no hacemos la llamada a la API
        if (reparto.lat && reparto.lon) {
          return Promise.resolve({
            position: [reparto.lat, reparto.lon],
            popup: `<b>${reparto.destino}</b><br>${reparto.direccion}`,
            id: reparto.id,
          });
        }
        
        // Si no, buscamos las coordenadas con Google
        const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
        const apiUrl = `${proxyUrl}https://maps.googleapis.com/maps/api/geocode/json`;
        
        return axios.get(apiUrl, {
          params: {
            address: reparto.direccion,
            key: GOOGLE_API_KEY,
            components: 'country:AR',
          }
        }).then(response => {
          if (response.data.status === 'OK' && response.data.results.length > 0) {
            const { lat, lng } = response.data.results[0].geometry.location;
            return {
              position: [lat, lng],
              popup: `<b>${reparto.destino}</b><br>${reparto.direccion}`,
              id: reparto.id,
            };
          } else {
            toast.warn(`No se pudo encontrar la dirección: "${reparto.direccion}"`);
            return null;
          }
        }).catch(() => {
          toast.warn(`Error al buscar la dirección: "${reparto.direccion}"`);
          return null;
        });
      });

      try {
        const results = await Promise.all(promises);
        const newMarkers = results.filter(marker => marker !== null);
        setMarkers(newMarkers);
      } catch (error) {
        toast.error("Hubo un problema al buscar las direcciones.");
      } finally {
        setLoading(false);
      }
    };
    
    geocodeRepartos();
  }, [repartos, GOOGLE_API_KEY]);

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
