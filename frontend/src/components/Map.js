// src/components/Map.js
import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import polylineUtil from 'polyline-encoded'; // <-- Importamos la nueva biblioteca

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
  const { routePath, returnPath } = useMemo(() => {
    if (!polyline) return { routePath: [], returnPath: [] };
    
    const decoded = polylineUtil.decode(polyline);
    
    // Si la ruta es circular, la dividimos en dos para diferenciar ida y vuelta
    if (repartos.length > 0 && repartos[0].id === 'start_location') {
      const waypointsCount = repartos.length;
      // Aproximadamente la mitad de los puntos para la ida
      const halfwayIndex = Math.floor(decoded.length / 2);
      
      const route = decoded.slice(0, halfwayIndex + 1);
      const returnRoute = decoded.slice(halfwayIndex);

      // Aplicamos un pequeño desplazamiento a la ruta de vuelta para que sea visible
      const offsetReturnRoute = returnRoute.map(([lat, lng]) => [lat + 0.00005, lng + 0.00005]);

      return { routePath: route, returnPath: offsetReturnRoute };
    }

    // Si no es circular, mostramos una sola línea
    return { routePath: decoded, returnPath: [] };
  }, [polyline, repartos]);

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
        
        {/* Dibujamos la ruta de ida */}
        {routePath.length > 0 && <Polyline pathOptions={{ color: 'blue', weight: 5, opacity: 0.7 }} positions={routePath} />}
        
        {/* Dibujamos la ruta de vuelta con otro color y estilo */}
        {returnPath.length > 0 && <Polyline pathOptions={{ color: 'red', weight: 3, opacity: 0.7, dashArray: '5, 10' }} positions={returnPath} />}

        <BoundsFitter bounds={bounds} />
      </MapContainer>
    </div>
  );
}

export default Map;
