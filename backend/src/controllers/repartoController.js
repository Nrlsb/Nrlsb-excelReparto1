// backend/src/controllers/repartoController.js
import supabase from '../config/supabaseClient.js';
import ExcelJS from 'exceljs';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import asyncHandler from '../middleware/asyncHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function getUserRole(userId) {
    const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

    if (error || !data) {
        console.error(`No se pudo obtener el perfil para el usuario ${userId}:`, error?.message);
        return 'user';
    }
    return data.role;
}

export const optimizeRoute = asyncHandler(async (req, res) => {
    const { repartos, currentLocation, trafficModel } = req.body;
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
        res.status(500);
        throw new Error('La clave de API de Google Maps no está configurada en el servidor.');
    }

    if (!repartos || repartos.length === 0) {
        res.status(400);
        throw new Error('Se necesita al menos 1 reparto para optimizar.');
    }

    let startLocationCoords;
    let startLocationAddress = 'Tu ubicación actual';

    if (typeof currentLocation === 'string') {
        const fullManualAddress = `${currentLocation}, Esperanza, Santa Fe, Argentina`;
        startLocationAddress = currentLocation;
        const geocodeParams = new URLSearchParams({ address: fullManualAddress, key: apiKey }).toString();
        const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?${geocodeParams}`;
        const geocodeResponse = await axios.get(geocodeUrl);
        
        if (geocodeResponse.data.status !== 'OK' || !geocodeResponse.data.results[0]) {
            res.status(400);
            throw new Error(`No se pudo geocodificar la dirección de partida: "${startLocationAddress}". Razón: ${geocodeResponse.data.status}`);
        }
        startLocationCoords = geocodeResponse.data.results[0].geometry.location;

    } else if (currentLocation && typeof currentLocation.lat === 'number' && typeof currentLocation.lng === 'number') {
        startLocationCoords = currentLocation;
    } else {
        res.status(400);
        throw new Error('No se proporcionó un punto de partida válido.');
    }

    const geocodePromises = repartos.map(reparto => {
        const fullAddress = `${reparto.direccion}, Esperanza, Santa Fe, Argentina`;
        const params = new URLSearchParams({ address: fullAddress, key: apiKey }).toString();
        const url = `https://maps.googleapis.com/maps/api/geocode/json?${params}`;
        return axios.get(url);
    });

    const geocodeResponses = await Promise.all(geocodePromises);
    
    const repartosWithCoords = repartos.map((reparto, index) => {
        const geocodeData = geocodeResponses[index].data;
        if (geocodeData.status !== 'OK' || !geocodeData.results[0]) {
            res.status(400);
            throw new Error(`No se pudo geocodificar la dirección: "${reparto.direccion}". Razón: ${geocodeData.status}`);
        }
        const location = geocodeData.results[0].geometry.location;
        return { ...reparto, location };
    });

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
    const directionsResponse = await axios.get(directionsUrl);
    const directionsData = directionsResponse.data;

    if (directionsData.status !== 'OK' || !directionsData.routes || directionsData.routes.length === 0) {
        res.status(500);
        throw new Error(`Error de la API de Google Directions: ${directionsData.status} - ${directionsData.error_message || 'Sin detalles adicionales.'}`);
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

    res.status(200).json({ 
        optimizedRepartos, 
        polyline: overview_polyline,
        totalDuration: totalDurationText
    });
});

export const getRepartos = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const userRole = await getUserRole(userId);

    let query = supabase.from('repartos').select('*');

    if (userRole !== 'admin' && userRole !== 'especial') {
        query = query.eq('user_id', userId);
    }
    
    const { data, error } = await query.order('id', { ascending: true });

    if (error) throw error;
    res.status(200).json(data);
});

export const createReparto = asyncHandler(async (req, res) => {
    const { data, error } = await supabase.from('repartos').insert([req.body]).select();
    if (error) throw error;
    res.status(201).json(data[0]);
});

export const updateReparto = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userRole = await getUserRole(req.user.id);

    if (userRole !== 'admin' && userRole !== 'especial') {
        const { data: existingReparto, error: fetchError } = await supabase
            .from('repartos')
            .select('user_id')
            .eq('id', id)
            .single();

        if (fetchError || !existingReparto) {
            res.status(404);
            throw new Error('Reparto no encontrado.');
        }

        if (existingReparto.user_id !== req.user.id) {
            res.status(403);
            throw new Error('No tienes permiso para modificar este reparto.');
        }
    }

    const { data, error } = await supabase.from('repartos').update(req.body).eq('id', id).select();
    if (error) throw error;
    if (data.length === 0) {
        res.status(404);
        throw new Error('Reparto no encontrado.');
    }
    res.status(200).json(data[0]);
});

export const deleteReparto = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userRole = await getUserRole(req.user.id);

    if (userRole !== 'admin' && userRole !== 'especial') {
        const { data: existingReparto, error: fetchError } = await supabase
            .from('repartos')
            .select('user_id')
            .eq('id', id)
            .single();

        if (fetchError || !existingReparto) {
            res.status(404);
            throw new Error('Reparto no encontrado.');
        }

        if (existingReparto.user_id !== req.user.id) {
            res.status(403);
            throw new Error('No tienes permiso para eliminar este reparto.');
        }
    }

    const { error } = await supabase.from('repartos').delete().eq('id', id);
    if (error) throw error;
    res.status(204).send();
});

export const clearAllRepartos = asyncHandler(async (req, res) => {
    const userRole = await getUserRole(req.user.id);
    let query = supabase.from('repartos').delete();

    if (userRole === 'admin' || userRole === 'especial') {
        query = query.neq('id', 0); 
    } else {
        query = query.eq('user_id', req.user.id);
    }

    const { error } = await query;
    if (error) throw error;
    res.status(204).send();
});

export const exportRepartos = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const userRole = await getUserRole(userId);

    let query = supabase.from('repartos').select('*');

    if (userRole !== 'admin' && userRole !== 'especial') {
        query = query.eq('user_id', userId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;

    const workbook = new ExcelJS.Workbook();
    const templatePath = path.join(__dirname, '..', '..', 'templates', 'PLANILLA PARA REPARTOS-1.xlsx');
    
    await workbook.xlsx.readFile(templatePath);

    const worksheet = workbook.getWorksheet(1);
    const startingRow = 5;
    data.forEach((reparto, index) => {
        const currentRow = startingRow + index;
        const row = worksheet.getRow(currentRow);

        row.getCell('A').value = index + 1;
        row.getCell('B').value = reparto.destino;
        row.getCell('C').value = reparto.direccion;
        row.getCell('D').value = reparto.horarios;
        row.getCell('E').value = reparto.bultos;
        
        const templateRow = worksheet.getRow(startingRow);
        row.height = templateRow.height;
        for(let i = 1; i <= 5; i++) {
            row.getCell(i).style = templateRow.getCell(i).style;
        }
    });
    
    worksheet.getCell('C2').value = new Date();

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="Repartos-${new Date().toISOString().slice(0, 10)}.xlsx"`);

    await workbook.xlsx.write(res);
    res.end();
});
