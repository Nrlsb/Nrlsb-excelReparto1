import { NextResponse } from 'next/server';
import { getUser, unauthorizedResponse } from '@/lib/auth';

export async function POST(req) {
  const user = await getUser(req);
  if (!user) return unauthorizedResponse();

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'La clave de API de Google Maps no está configurada.' }, { status: 500 });
  }

  try {
    const { repartos, currentLocation, trafficModel } = await req.json();

    if (!repartos || repartos.length === 0) {
      return NextResponse.json({ error: 'Se necesita al menos 1 reparto para optimizar.' }, { status: 400 });
    }

    let startLocationCoords;
    let startLocationAddress = 'Tu ubicación actual';

    // 1. Geocodificar punto de partida si es necesario
    if (typeof currentLocation === 'string') {
      const fullManualAddress = `${currentLocation}, Esperanza, Santa Fe, Argentina`;
      startLocationAddress = currentLocation;
      const geocodeParams = new URLSearchParams({ address: fullManualAddress, key: apiKey }).toString();
      const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?${geocodeParams}`;
      const res = await fetch(geocodeUrl);
      const data = await res.json();
      
      if (data.status !== 'OK' || !data.results[0]) {
        return NextResponse.json({ error: `No se pudo geocodificar la dirección de partida: "${startLocationAddress}". Razón: ${data.status}` }, { status: 400 });
      }
      startLocationCoords = data.results[0].geometry.location;
    } else if (currentLocation && typeof currentLocation.lat === 'number' && typeof currentLocation.lng === 'number') {
      startLocationCoords = currentLocation;
    } else {
      return NextResponse.json({ error: 'No se proporcionó un punto de partida válido.' }, { status: 400 });
    }

    // 2. Geocodificar repartos
    const geocodePromises = repartos.map(async (reparto) => {
      const fullAddress = `${reparto.direccion}, Esperanza, Santa Fe, Argentina`;
      const params = new URLSearchParams({ address: fullAddress, key: apiKey }).toString();
      const url = `https://maps.googleapis.com/maps/api/geocode/json?${params}`;
      const res = await fetch(url);
      const data = await res.json();
      
      if (data.status !== 'OK' || !data.results[0]) {
         throw new Error(`No se pudo geocodificar la dirección: "${reparto.direccion}". Razón: ${data.status}`);
      }
      return { ...reparto, location: data.results[0].geometry.location };
    });

    const repartosWithCoords = await Promise.all(geocodePromises);

    // 3. Obtener ruta optimizada
    const origin = `${startLocationCoords.lat},${startLocationCoords.lng}`;
    const destination = origin;
    const waypoints = repartosWithCoords.map(r => `${r.location.lat},${r.location.lng}`);
    
    const directionParams = new URLSearchParams({
      origin: origin,
      destination: destination,
      waypoints: `optimize:true|${waypoints.join('|')}`,
      key: apiKey,
      departure_time: 'now',
      traffic_model: trafficModel || 'best_guess',
    }).toString();

    const directionsUrl = `https://maps.googleapis.com/maps/api/directions/json?${directionParams}`;
    const dirRes = await fetch(directionsUrl);
    const directionsData = await dirRes.json();

    if (directionsData.status !== 'OK' || !directionsData.routes || directionsData.routes.length === 0) {
      return NextResponse.json({ error: `Error de Google Directions: ${directionsData.status}` }, { status: 500 });
    }

    const route = directionsData.routes[0];
    const optimizedOrder = route.waypoint_order;
    const overview_polyline = route.overview_polyline.points;
    const routeLegs = route.legs;

    const totalDurationInSeconds = routeLegs.reduce((total, leg) => {
      return total + (leg.duration_in_traffic ? leg.duration_in_traffic.value : leg.duration.value);
    }, 0);
    
    const hours = Math.floor(totalDurationInSeconds / 3600);
    const minutes = Math.round((totalDurationInSeconds % 3600) / 60);
    const totalDurationText = `${hours > 0 ? `${hours}h ` : ''}${minutes}m (con tráfico)`;

    const startPoint = {
      id: 'start_location',
      destino: 'Punto de Partida',
      direccion: startLocationAddress,
      location: startLocationCoords,
      bultos: '-',
      horarios: '-',
      agregado_por: '-',
      created_at: new Date().toISOString()
    };
    
    const optimizedRepartos = [
      startPoint,
      ...optimizedOrder.map((repartoIndex, legIndex) => {
        const reparto = repartosWithCoords[repartoIndex];
        const leg = routeLegs[legIndex];
        return {
          ...reparto,
          legData: {
            distance: leg.distance.text,
            duration: leg.duration_in_traffic ? leg.duration_in_traffic.text : leg.duration.text,
          },
        };
      }),
    ];

    return NextResponse.json({ 
      optimizedRepartos, 
      polyline: overview_polyline,
      totalDuration: totalDurationText
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
