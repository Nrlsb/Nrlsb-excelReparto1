// src/components/Map.js
import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, Tooltip } from 'react-leaflet';
import polylineUtil from 'polyline-encoded';
import L from 'leaflet'; // Importamos Leaflet para los iconos personalizados

// --- NUEVO: Iconos personalizados para cada estado ---
const getMarkerIcon = (estado) => {
  const colors = {
    pendiente: '#3b82f6', // blue-500
    entregado: '#22c55e', // green-500
    fallido: '#ef4444',   // red-500
    start_location: '#10b981', // emerald-500
  };
  const color = colors[estado] || colors.pendiente;

  const iconHtml = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="32px" height="32px" style="filter: drop-shadow(2px 2px 2px rgba(0,0,0,0.4));">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>`;

  return new L.DivIcon({
    html: iconHtml,
    className: 'custom-leaflet-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};


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

function Map({ repartos, polyline }) { 
  const routePath = useMemo(() => {
    if (!polyline) return [];
    return polylineUtil.decode(polyline);
  }, [polyline]);

  const repartosConCoordenadas = useMemo(() => 
    (repartos || []).filter(r => r.location && typeof r.location.lat === 'number' && typeof r.location.lng === 'number'),
    [repartos]
  );

  const bounds = useMemo(() => {
    if (repartosConCoordenadas.length === 0) return null;
    return repartosConCoordenadas.map(r => [r.location.lat, r.location.lng]);
  }, [repartosConCoordenadas]);

  if (repartosConCoordenadas.length === 0) {
    return (
      <div className="bg-gray-100 p-6 rounded-xl mb-8 shadow-sm border border-gray-200 text-center text-gray-500">
        Optimiza la ruta para ver el mapa. Los repartos deben tener coordenadas válidas.
      </div>
    );
  }

  return (
    <div className="mb-8">
      <MapContainer center={[repartosConCoordenadas[0].location.lat, repartosConCoordenadas[0].location.lng]} zoom={13} scrollWheelZoom={true}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {repartosConCoordenadas.map((reparto, index) => {
          const isStart = reparto.id === 'start_location';
          const estado = isStart ? 'start_location' : (reparto.estado || 'pendiente');

          return (
            <Marker 
              key={reparto.id || index} 
              position={[reparto.location.lat, reparto.location.lng]}
              icon={getMarkerIcon(estado)} // --- NUEVO: Usar icono dinámico ---
            >
              <Popup>
                {/* --- NUEVO: Popup mejorado --- */}
                <div className="text-sm">
                  <p className="font-bold text-base mb-1">{index + 1}. {reparto.destino}</p>
                  <p className="text-gray-600">{reparto.direccion}</p>
                  <hr className="my-2"/>
                  {reparto.horarios && <p><span className="font-semibold">Horarios:</span> {reparto.horarios}</p>}
                  {reparto.bultos && reparto.bultos !== '-' && <p><span className="font-semibold">Bultos:</span> {reparto.bultos}</p>}
                  {reparto.legData && (
                    <p className="mt-1 text-blue-600">
                      <span className="font-semibold">Tramo:</span> {reparto.legData.duration} ({reparto.legData.distance})
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
        
        {routePath.length > 0 && (
          <Polyline 
            pathOptions={{ color: '#3388ff', weight: 5, opacity: 0.7 }} 
            positions={routePath} 
          >
            {/* --- NUEVO: Tooltip para la polilínea --- */}
            <Tooltip sticky>Verás la información del tramo en la tabla.</Tooltip>
          </Polyline>
        )}
        
        <BoundsFitter bounds={bounds} />
      </MapContainer>
      {/* Estilos para que los iconos SVG se vean bien */}
      <style>{`
        .custom-leaflet-icon {
          background: transparent;
          border: none;
        }
      `}</style>
    </div>
  );
}

export default Map;
