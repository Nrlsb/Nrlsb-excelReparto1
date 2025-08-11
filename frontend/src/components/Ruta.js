import React, { useState, useEffect, useCallback } from 'react';
import { useJsApiLoader } from '@react-google-maps/api';
import Map from './Map';
import { getRepartos } from '../services/api';

// Añadimos 'directions' a las librerías a cargar
const libraries = ['places', 'directions'];

const Ruta = () => {
    const [repartos, setRepartos] = useState([]);
    const [userLocation, setUserLocation] = useState(null);
    const [directionsResponse, setDirectionsResponse] = useState(null);
    const [orderedRepartos, setOrderedRepartos] = useState([]);

    // Movemos el cargador de la API de Google Maps aquí
    const { isLoaded, loadError } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
        libraries,
    });

    useEffect(() => {
        const fetchRepartosData = async () => {
            try {
                const data = await getRepartos();
                // Filtramos solo repartos pendientes que tengan coordenadas
                const pending = data.filter(r => r.estado === 'pendiente' && r.lat && r.lng);
                setRepartos(pending);
                setOrderedRepartos(pending); // El orden inicial es el que viene de la BD
            } catch (error) {
                console.error("Error al obtener los repartos:", error);
            }
        };

        fetchRepartosData();

        // Obtenemos la ubicación actual del usuario
        navigator.geolocation.getCurrentPosition(
            position => {
                setUserLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                });
            },
            () => {
                console.error("Error al obtener la ubicación del usuario.");
                // Ubicación de fallback (ej. centro de Buenos Aires)
                setUserLocation({ lat: -34.6037, lng: -58.3816 });
            }
        );
    }, []);

    const calculateRoute = useCallback(() => {
        // Nos aseguramos de que todo esté cargado antes de calcular
        if (!isLoaded || repartos.length === 0 || !userLocation) {
            return;
        }

        const directionsService = new window.google.maps.DirectionsService();
        
        const waypoints = repartos.map(reparto => ({
            location: { lat: reparto.lat, lng: reparto.lng },
            stopover: true,
        }));

        if (waypoints.length === 0) {
            alert("No hay repartos pendientes para optimizar.");
            return;
        }

        const origin = userLocation;
        const destination = waypoints[waypoints.length - 1].location;
        const intermediateWaypoints = waypoints.slice(0, -1);

        const request = {
            origin: origin,
            destination: destination,
            waypoints: intermediateWaypoints,
            optimizeWaypoints: true, // ¡La magia de la optimización!
            travelMode: window.google.maps.TravelMode.DRIVING,
        };

        directionsService.route(request, (result, status) => {
            if (status === window.google.maps.DirectionsStatus.OK) {
                setDirectionsResponse(result);
                // Reordenamos la lista de repartos según la ruta optimizada
                const optimizedOrder = result.routes[0].waypoint_order;
                let reordered = optimizedOrder.map(index => repartos[index]);
                
                // Buscamos el reparto que no está en el `waypoint_order` (el destino)
                const destinationReparto = repartos.find(r => 
                    !reordered.some(ro => ro.id === r.id)
                );
                if(destinationReparto) {
                    reordered.push(destinationReparto);
                }

                setOrderedRepartos(reordered);

            } else {
                console.error(`Error al obtener la ruta: ${status}`, result);
                alert(`Error al calcular la ruta: ${status}. Verifica las direcciones y tu clave de API de Google Maps.`);
            }
        });
    }, [isLoaded, repartos, userLocation]);

    if (loadError) {
        return <div>Error al cargar los mapas. Por favor, revisa tu clave de API.</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Visualización de la Ruta</h1>
            <div className="flex flex-col md:flex-row gap-8">
                <div className="md:w-3/5 h-96 md:h-[600px] shadow-lg rounded-lg">
                    {isLoaded ? (
                        <Map
                            repartos={repartos}
                            userLocation={userLocation}
                            directionsResponse={directionsResponse}
                            isLoaded={isLoaded}
                            ruta={true}
                        />
                    ) : (
                        <div>Cargando Mapa...</div>
                    )}
                </div>
                <div className="md:w-2/5">
                    <button
                        onClick={calculateRoute}
                        disabled={!isLoaded || repartos.length === 0}
                        className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400 mb-4 transition-colors duration-300"
                    >
                        Optimizar Ruta
                    </button>
                    <div className="overflow-auto max-h-96 md:max-h-[540px] bg-white p-3 rounded-lg shadow">
                        <h2 className="text-xl font-semibold mb-2 sticky top-0 bg-white pb-2">Orden de Reparto Sugerido</h2>
                        <ul className="space-y-2">
                            <li className="flex items-center p-3 bg-green-100 rounded-md">
                                <span className="font-bold text-green-800">1. Punto de Partida</span>
                            </li>
                            {orderedRepartos.map((reparto, index) => (
                                <li key={reparto.id} className="p-3 border-b hover:bg-gray-50">
                                    <p className="font-bold text-gray-800">{index + 2}. {reparto.cliente}</p>
                                    <p className="text-sm text-gray-600">{reparto.direccion}, {reparto.localidad}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Ruta;
