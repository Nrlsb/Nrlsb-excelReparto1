// backend/src/controllers/repartoController.js
import supabase from '../config/supabaseClient.js';
import ExcelJS from 'exceljs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getRepartos = async (req, res) => {
    try {
        const userEmail = req.user.email;
        const isAdmin = userEmail === process.env.ADMIN_EMAIL;
        
        let query = supabase.from('repartos').select('*');

        // Si no es admin, la política RLS de Supabase ya filtra los resultados.
        // Si es admin, el cliente de Supabase usa la service_key que salta RLS.
        
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
        const userEmail = req.user.email;
        const isAdmin = userEmail === process.env.ADMIN_EMAIL;

        // Aunque usamos la service_key, añadimos una capa de seguridad en la lógica.
        if (!isAdmin) {
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
        const userEmail = req.user.email;
        const isAdmin = userEmail === process.env.ADMIN_EMAIL;

        if (!isAdmin) {
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

// --- NUEVA FUNCIÓN ---
export const clearAllRepartos = async (req, res) => {
    try {
        const userEmail = req.user.email;
        const isAdmin = userEmail === process.env.ADMIN_EMAIL;

        let query = supabase.from('repartos').delete();

        if (isAdmin) {
            // Admin borra todos los repartos (usamos un filtro que siempre es verdad)
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
        const { data, error } = await supabase.from('repartos').select('*').order('created_at', { ascending: false });
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
