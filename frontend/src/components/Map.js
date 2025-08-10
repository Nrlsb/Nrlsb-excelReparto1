// src/components/Map.js --- NUEVO ARCHIVO
import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';

// Función para decodificar la polilínea de Google
function decodePolyline(encoded) {
  let lat = 0, lng = 0, index = 0;
  const points = [];
  while (index < encoded.length) {
    let b, shift = 0, result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lat += dlat;
    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lng += dlng;
    points.push([lat * 1e-5, lng * 1e-5]);
  }
  return points;
}


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
  const decodedPolyline = useMemo(() => {
    if (!polyline) return [];
    return decodePolyline(polyline);
  }, [polyline]);

  const bounds = useMemo(() => {
    if (!repartos || repartos.length === 0) return null;
    return repartos.map(r => [r.location.lat, r.location.lng]);
  }, [repartos]);

  if (!repartos || repartos.length === 0) {
    return (
      <div className="bg-gray-100 p-6 rounded-xl mb-8 shadow-sm border border-gray-200 text-center text-gray-500">
        Optimiza la ruta para ver el mapa.
      </div>
    );
  }

  return (
    <div className="mb-8">
      <MapContainer center={[repartos[0].location.lat, repartos[0].location.lng]} zoom={13} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {repartos.map((reparto, index) => (
          <Marker key={reparto.id} position={[reparto.location.lat, reparto.location.lng]}>
            <Popup>
              <b>{index + 1}. {reparto.destino}</b><br />{reparto.direccion}
            </Popup>
          </Marker>
        ))}
        {decodedPolyline.length > 0 && <Polyline pathOptions={{ color: 'blue' }} positions={decodedPolyline} />}
        <BoundsFitter bounds={bounds} />
      </MapContainer>
    </div>
  );
}

export default Map;
