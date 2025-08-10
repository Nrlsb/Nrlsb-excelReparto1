// backend/src/controllers/repartoController.js
import supabase from '../config/supabaseClient.js';
import ExcelJS from 'exceljs';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios'; // <-- Importamos Axios

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
        // Si no se encuentra un perfil, se asume el rol con menos privilegios.
        return 'user';
    }
    return data.role;
}

// --- NUEVA FUNCIÓN PARA OPTIMIZAR LA RUTA ---
export const optimizeRoute = async (req, res) => {
    const { repartos } = req.body;

    if (!repartos || repartos.length < 2) {
        return res.status(400).json({ error: 'Se necesitan al menos 2 repartos para optimizar la ruta.' });
    }

    // --- SIMULACIÓN DE API DE MAPAS ---
    // En una aplicación real, aquí llamarías a un servicio como Google Maps Directions API,
    // Mapbox Optimization API, o similar. Estos servicios requieren una clave de API.
    // Por ejemplo, con Mapbox, el proceso sería:
    // 1. Geocodificar cada dirección para obtener latitud y longitud.
    // 2. Enviar todas las coordenadas al servicio de optimización.
    // 3. El servicio devuelve los puntos (waypoints) en el orden óptimo.

    try {
        // Como no podemos usar una API real aquí, simularemos la optimización
        // invirtiendo el orden de la lista como demostración.
        // En un caso real, reemplazarías esta lógica con la llamada a la API.
        
        console.log('Simulando optimización de ruta...');
        const waypoints = repartos.map(r => r.direccion);
        console.log('Waypoints a optimizar:', waypoints);

        // Lógica de simulación: Simplemente invertimos el array.
        const optimizedRepartos = [...repartos].reverse();

        // En un caso real, el resultado de la API te daría un nuevo orden.
        // Tendrías que reordenar el array `repartos` original basado en la respuesta de la API.
        // Por ejemplo: `const optimizedRepartos = apiResponse.waypoints.map(waypoint => repartos[waypoint.waypoint_index]);`

        res.status(200).json(optimizedRepartos);

    } catch (err) {
        console.error('Error en la optimización de ruta (simulada):', err);
        res.status(500).json({ error: 'No se pudo optimizar la ruta.', details: err.message });
    }
};


export const getRepartos = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = await getUserRole(userId);

        let query = supabase.from('repartos').select('*');

        // Si el rol NO es admin o especial, filtramos los repartos por el ID del usuario.
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

        // Si no es admin o especial, verificamos que sea el dueño del reparto.
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
            // Admin o especial borran todos los repartos
            query = query.neq('id', 0); 
        } else {
            // Usuario normal borra solo los suyos
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
        // La lógica de exportación también debe respetar los roles
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
