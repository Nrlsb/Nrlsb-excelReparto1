// src/components/Map.js
import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import polylineUtil from 'polyline-encoded';

// Componente para ajustar los límites del mapa
function BoundsFitter({ bounds }) {
  const map = useMap();
  useEffect(() => {
    if (bounds && bounds.length > 0) {
      map.fitBounds(bounds);
    }
  }, [bounds, map]);
  return null;
}

function Map({ repartos, polylines }) { // Cambiamos polyline por polylines
  const routeSegments = useMemo(() => {
    if (!polylines || !Array.isArray(polylines)) return [];
    // Decodificamos cada polilínea del array
    return polylines.map(p => polylineUtil.decode(p));
  }, [polylines]);

  const repartosConCoordenadas = useMemo(() => 
    (repartos || []).filter(r => r.location && typeof r.location.lat === 'number' && typeof r.location.lng === 'number'),
    [repartos]
  );

  const bounds = useMemo(() => {
    if (repartosConCoordenadas.length === 0) return null;
    return repartosConCoordenadas.map(r => [r.location.lat, r.location.lng]);
  }, [repartosConCoordenadas]);

  // Paleta de colores para los tramos de la ruta
  const colors = ['#3388ff', '#ff3333', '#33ff33', '#ff33ff', '#33ffff', '#ffff33'];

  if (repartosConCoordenadas.length === 0) {
    return (
      <div className="bg-gray-100 p-6 rounded-xl mb-8 shadow-sm border border-gray-200 text-center text-gray-500">
        Optimiza la ruta para ver el mapa. Los repartos deben tener coordenadas válidas.
      </div>
    );
  }

  return (
    <div className="mb-8">
      <MapContainer center={[repartosConCoordenadas[0].location.lat, repartosConCoordenadas[0].location.lng]} zoom={13} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {repartosConCoordenadas.map((reparto, index) => (
          <Marker key={reparto.id || index} position={[reparto.location.lat, reparto.location.lng]}>
            <Popup>
              <b>{index + 1}. {reparto.destino}</b><br />{reparto.direccion}
            </Popup>
          </Marker>
        ))}
        
        {/* Dibujamos cada tramo de la ruta con un color diferente */}
        {routeSegments.map((segment, index) => (
          <Polyline 
            key={index}
            pathOptions={{ color: colors[index % colors.length], weight: 5, opacity: 0.7 }} 
            positions={segment} 
          />
        ))}
        
        <BoundsFitter bounds={bounds} />
      </MapContainer>
    </div>
  );
}

export default Map;
