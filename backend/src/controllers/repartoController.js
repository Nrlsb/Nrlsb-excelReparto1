// backend/src/controllers/repartoController.js
import supabase from '../config/supabaseClient.js';
import ExcelJS from 'exceljs';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios'; // Importamos axios

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Obtiene el rol de un usuario desde la tabla de perfiles.
 * @param {string} userId - El UUID del usuario.
 * @returns {Promise<string>} El rol del usuario (ej. 'admin', 'especial', 'user').
 */
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

// ... (las funciones getRepartos, createReparto, etc. permanecen iguales) ...

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

// --- NUEVA FUNCIÓN PARA OPTIMIZAR RUTAS ---
export const optimizeRepartos = async (req, res) => {
    const { repartos } = req.body;

    if (!repartos || !Array.isArray(repartos) || repartos.length === 0) {
        return res.status(400).json({ error: 'Se requiere una lista de repartos.' });
    }

    try {
        // --- Paso 1: Geocodificación ---
        const geocodePromises = repartos.map(reparto => {
            const query = encodeURIComponent(`${reparto.direccion}, Argentina`);
            const url = `https://nominatim.openstreetmap.org/search?format=json&q=${query}`;
            return axios.get(url, {
                headers: { 'User-Agent': 'RepartosApp/1.0' } // Nominatim requiere un User-Agent
            });
        });

        const responses = await Promise.all(geocodePromises);

        const waypoints = responses.map((response, index) => {
            if (response.data && response.data.length > 0) {
                const { lat, lon } = response.data[0];
                return {
                    ...repartos[index],
                    coordinates: [parseFloat(lat), parseFloat(lon)]
                };
            }
            return {
                ...repartos[index],
                coordinates: null // Marcar si no se pudo geocodificar
            };
        }).filter(reparto => reparto.coordinates); // Filtrar los que no se encontraron

        if (waypoints.length < 2) {
             return res.status(400).json({ error: 'Se necesitan al menos dos direcciones válidas para optimizar la ruta.' });
        }

        // --- Por ahora, solo devolvemos los waypoints con coordenadas ---
        // En la siguiente fase, aquí llamaremos a OSRM para obtener la ruta
        
        // Simulación de la respuesta que dará OSRM en el futuro
        const mockResponse = {
            repartosOrdenados: waypoints, // Por ahora, sin ordenar
            ruta: waypoints.map(wp => wp.coordinates) // Una línea recta simple por ahora
        };

        res.status(200).json(mockResponse);

    } catch (error) {
        console.error('Error en la optimización de ruta:', error.message);
        res.status(500).json({ error: 'Error al procesar la ruta.', details: error.message });
    }
};
