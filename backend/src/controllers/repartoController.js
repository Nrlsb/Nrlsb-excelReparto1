// backend/src/controllers/repartoController.js
import supabase from '../config/supabaseClient.js';
import ExcelJS from 'exceljs';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';

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

export const optimizeRoute = async (req, res) => {
    const { repartos, currentLocation } = req.body;
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'La clave de API de Google Maps no está configurada en el servidor.' });
    }

    if (!repartos || repartos.length === 0) {
        return res.status(400).json({ error: 'Se necesita al menos 1 reparto para optimizar.' });
    }

    try {
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
                throw new Error(`No se pudo geocodificar la dirección: "${reparto.direccion}". Razón: ${geocodeData.status}`);
            }
            const location = geocodeData.results[0].geometry.location;
            return { ...reparto, location };
        });

        let origin, destination, waypoints, allPointsForOrdering;

        if (currentLocation) {
            origin = `${currentLocation.lat},${currentLocation.lng}`;
            destination = origin; // Para una ruta circular
            waypoints = repartosWithCoords.map(r => `${r.location.lat},${r.location.lng}`);
            allPointsForOrdering = repartosWithCoords;
        } else {
            origin = `${repartosWithCoords[0].location.lat},${repartosWithCoords[0].location.lng}`;
            destination = `${repartosWithCoords[repartosWithCoords.length - 1].location.lat},${repartosWithCoords[repartosWithCoords.length - 1].location.lng}`;
            waypoints = repartosWithCoords.slice(1, -1).map(r => `${r.location.lat},${r.location.lng}`);
            allPointsForOrdering = repartosWithCoords.slice(1, -1);
        }

        const directionParams = new URLSearchParams({
            origin: origin,
            destination: destination,
            waypoints: `optimize:true|${waypoints.join('|')}`,
            key: apiKey,
        }).toString();

        const directionsUrl = `https://maps.googleapis.com/maps/api/directions/json?${directionParams}`;
        const directionsResponse = await axios.get(directionsUrl);
        const directionsData = directionsResponse.data;

        if (directionsData.status !== 'OK') {
            throw new Error(`Error de la API de Google Directions: ${directionsData.status} - ${directionsData.error_message || 'Sin detalles adicionales.'}`);
        }

        const route = directionsData.routes[0];
        const optimizedOrder = route.waypoint_order;
        
        // Extraemos las polilíneas de cada tramo (leg) de la ruta
        const legPolylines = route.legs.map(leg => leg.overview_polyline.points);

        let optimizedRepartos;

        if (currentLocation) {
            const startPoint = {
                id: 'start_location',
                destino: 'Punto de Partida',
                direccion: 'Tu ubicación actual',
                location: currentLocation,
                bultos: '-',
                horarios: '-',
                agregado_por: '-',
                created_at: new Date().toISOString()
            };
            optimizedRepartos = [
                startPoint,
                ...optimizedOrder.map(index => allPointsForOrdering[index]),
            ];
        } else {
            optimizedRepartos = [
                repartosWithCoords[0],
                ...optimizedOrder.map(index => allPointsForOrdering[index]),
                repartosWithCoords[repartosWithCoords.length - 1]
            ];
        }

        res.status(200).json({ optimizedRepartos, polylines: legPolylines });

    } catch (err) {
        console.error('Error en la optimización de ruta con Google Maps:', err.message);
        res.status(500).json({ error: 'No se pudo optimizar la ruta.', details: err.message });
    }
};

// ... (resto de las funciones sin cambios)
export const getRepartos = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = await getUserRole(userId);

        let query = supabase.from('repartos').select('*');

        if (userRole !== 'admin' && userRole !== 'especial') {
            query = query.eq('user_id', userId);
        }
        
        const { data, error } = await query.order('id', { ascending: true });

        if (error) throw error;
        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ error: 'No se pudieron obtener los repartos.', details: err.message });
    }
};

export const createReparto = async (req, res) => {
    try {
        const { data, error } = await supabase.from('repartos').insert([req.body]).select();
        if (error) throw error;
        res.status(201).json(data[0]);
    } catch (err) {
        res.status(500).json({ error: 'No se pudo crear el reparto.', details: err.message });
    }
};

export const updateReparto = async (req, res) => {
    try {
        const { id } = req.params;
        const userRole = await getUserRole(req.user.id);

        if (userRole !== 'admin' && userRole !== 'especial') {
            const { data: existingReparto, error: fetchError } = await supabase
                .from('repartos')
                .select('user_id')
                .eq('id', id)
                .single();

            if (fetchError || !existingReparto) {
                return res.status(404).json({ error: 'Reparto no encontrado.' });
            }

            if (existingReparto.user_id !== req.user.id) {
                return res.status(403).json({ error: 'No tienes permiso para modificar este reparto.' });
            }
        }

        const { data, error } = await supabase.from('repartos').update(req.body).eq('id', id).select();
        if (error) throw error;
        if (data.length === 0) return res.status(404).json({ error: 'Reparto no encontrado.' });
        res.status(200).json(data[0]);
    } catch (err) {
        res.status(500).json({ error: 'No se pudo actualizar el reparto.', details: err.message });
    }
};

export const deleteReparto = async (req, res) => {
    try {
        const { id } = req.params;
        const userRole = await getUserRole(req.user.id);

        if (userRole !== 'admin' && userRole !== 'especial') {
            const { data: existingReparto, error: fetchError } = await supabase
                .from('repartos')
                .select('user_id')
                .eq('id', id)
                .single();

            if (fetchError || !existingReparto) {
                return res.status(404).json({ error: 'Reparto no encontrado.' });
            }

            if (existingReparto.user_id !== req.user.id) {
                return res.status(403).json({ error: 'No tienes permiso para eliminar este reparto.' });
            }
        }

        const { error } = await supabase.from('repartos').delete().eq('id', id);
        if (error) throw error;
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: 'No se pudo eliminar el reparto.', details: err.message });
    }
};

export const clearAllRepartos = async (req, res) => {
    try {
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
    } catch (err) {
        res.status(500).json({ error: 'No se pudieron eliminar los repartos.', details: err.message });
    }
};


export const exportRepartos = async (req, res) => {
    try {
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
    } catch (err) {
        console.error('Error al exportar:', err);
        res.status(500).json({ error: 'No se pudo generar el archivo Excel.', details: err.message });
    }
};
