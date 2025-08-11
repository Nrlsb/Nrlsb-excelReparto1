import React from 'react';
import { GoogleMap, Marker, DirectionsRenderer } from '@react-google-maps/api';

const mapContainerStyle = {
    width: '100%',
    height: '100%',
    borderRadius: '0.5rem',
};

// Un centro por defecto para el mapa, por si no hay otra ubicación
const defaultCenter = {
    lat: -34.6037, // Buenos Aires, Argentina
    lng: -58.3816,
};

const Map = ({ repartos, userLocation, directionsResponse, isLoaded, ruta }) => {
    // El mapa se centrará en la ubicación del usuario o en el primer reparto
    const center = userLocation || (repartos && repartos.length > 0 ? { lat: repartos[0].lat, lng: repartos[0].lng } : defaultCenter);

    if (!isLoaded) {
        return <div>Cargando mapa...</div>;
    }

    return (
        <GoogleMap
            mapContainerStyle={mapContainerStyle}
            zoom={12}
            center={center}
            options={{
                streetViewControl: false,
                mapTypeControl: false,
                fullscreenControl: false,
            }}
        >
            {/* Marcador para la ubicación del usuario */}
            {userLocation && (
                <Marker
                    position={userLocation}
                    label={{ text: "P", color: "white" }}
                    title="Punto de Partida"
                    icon={{
                        path: window.google.maps.SymbolPath.CIRCLE,
                        scale: 10,
                        fillColor: "#4285F4",
                        fillOpacity: 1,
                        strokeWeight: 2,
                        strokeColor: "white",
                    }}
                />
            )}

            {/* Marcadores para los repartos */}
            {repartos && repartos.map((reparto, index) => (
                reparto.lat && reparto.lng && (
                    <Marker
                        key={reparto.id}
                        position={{ lat: reparto.lat, lng: reparto.lng }}
                        label={`${index + 1}`}
                        title={`${reparto.cliente}\n${reparto.direccion}`}
                    />
                )
            ))}

            {/* Renderizador para la ruta optimizada */}
            {directionsResponse && ruta && (
                <DirectionsRenderer
                    directions={directionsResponse}
                    options={{
                        suppressMarkers: true, // Ocultamos los marcadores A y B por defecto
                        polylineOptions: {
                            strokeColor: '#FF0000', // Hacemos la ruta de un color rojo visible
                            strokeOpacity: 0.8,
                            strokeWeight: 5,
                        },
                    }}
                />
            )}
        </GoogleMap>
    );
};

export default Map;
