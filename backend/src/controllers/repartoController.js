import supabase from '../config/supabaseClient.js';
import ExcelJS from 'exceljs';
import path from 'path';
import { fileURLToPath } from 'url';

// Solución para __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getRepartos = async (req, res) => {
    try {
        const { data, error } = await supabase.from('repartos').select('*').order('created_at', { ascending: false });
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
        const { error } = await supabase.from('repartos').delete().eq('id', id);
        if (error) throw error;
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: 'No se pudo eliminar el reparto.', details: err.message });
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

            // --- CORRECCIÓN EN EL MAPEO DE DATOS ---
            // Se ajustan los campos de la base de datos a las columnas correctas del Excel.
            row.getCell('A').value = index + 1;                // Columna N°
            row.getCell('B').value = reparto.destino;          // Columna Destino
            row.getCell('C').value = reparto.direccion;        // Columna Dirección
            row.getCell('D').value = reparto.horarios;         // Columna Horarios de entrega
            row.getCell('E').value = reparto.bultos;           // Columna Cantidad de Bultos
            
            // Se copian los estilos de la primera fila de datos para mantener el formato
            const templateRow = worksheet.getRow(startingRow);
            row.height = templateRow.height;
            for(let i = 1; i <= 5; i++) { // Se itera hasta la columna E (5)
                row.getCell(i).style = templateRow.getCell(i).style;
            }
        });
        
        worksheet.getCell('C2').value = new Date(); // Pone la fecha actual en la celda C2

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="Repartos-${new Date().toISOString().slice(0, 10)}.xlsx"`);

        await workbook.xlsx.write(res);
        res.end();
    } catch (err) {
        console.error('Error al exportar:', err);
        res.status(500).json({ error: 'No se pudo generar el archivo Excel.', details: err.message });
    }
};
