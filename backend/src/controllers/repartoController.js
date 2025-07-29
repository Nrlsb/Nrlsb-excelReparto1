const supabase = require('../config/supabaseClient');
const ExcelJS = require('exceljs');
const path = require('path');

// Obtener todos los repartos
const getRepartos = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('repartos')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ error: 'No se pudieron obtener los repartos.', details: err.message });
    }
};

// Crear un nuevo reparto
const createReparto = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('repartos')
            .insert([req.body])
            .select();

        if (error) throw error;
        res.status(201).json(data[0]);
    } catch (err) {
        res.status(500).json({ error: 'No se pudo crear el reparto.', details: err.message });
    }
};

// Actualizar un reparto
const updateReparto = async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase
            .from('repartos')
            .update(req.body)
            .eq('id', id)
            .select();

        if (error) throw error;
        if (data.length === 0) return res.status(404).json({ error: 'Reparto no encontrado.' });
        res.status(200).json(data[0]);
    } catch (err) {
        res.status(500).json({ error: 'No se pudo actualizar el reparto.', details: err.message });
    }
};

// Eliminar un reparto
const deleteReparto = async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabase
            .from('repartos')
            .delete()
            .eq('id', id);

        if (error) throw error;
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: 'No se pudo eliminar el reparto.', details: err.message });
    }
};

// --- NUEVA FUNCIÓN PARA EXPORTAR ---
const exportRepartos = async (req, res) => {
    try {
        // 1. Obtener los datos de repartos desde Supabase
        const { data, error } = await supabase
            .from('repartos')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        // 2. Cargar la plantilla de Excel
        const workbook = new ExcelJS.Workbook();
        // La ruta apunta a la carpeta 'templates' que crearás en 'backend'
        const templatePath = path.join(__dirname, '..', 'templates', 'PLANILLA PARA REPARTOS-1.xlsx');
        await workbook.xlsx.readFile(templatePath);

        // 3. Acceder a la primera hoja de cálculo
        const worksheet = workbook.getWorksheet(1);

        // 4. Insertar los datos en la planilla (comenzando en la fila 5)
        const startingRow = 5;
        data.forEach((reparto, index) => {
            const currentRow = startingRow + index;
            const row = worksheet.getRow(currentRow);

            row.getCell('A').value = reparto.direccion;
            row.getCell('B').value = reparto.localidad;
            row.getCell('C').value = reparto.franja_horaria;
            row.getCell('D').value = reparto.valor;
            row.getCell('E').value = reparto.estado;
            row.getCell('F').value = reparto.id_reparto;

            // Para asegurar que las celdas nuevas tengan el mismo estilo que la fila 5 (opcional pero recomendado)
            const templateRow = worksheet.getRow(startingRow);
            row.height = templateRow.height;
            for(let i = 1; i <= 6; i++) {
                row.getCell(i).style = templateRow.getCell(i).style;
            }
        });
        
        // Opcional: Escribir la fecha actual en la celda C2
        worksheet.getCell('C2').value = new Date();

        // 5. Configurar la respuesta para la descarga
        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader(
            'Content-Disposition',
            `attachment; filename="Repartos-${new Date().toISOString().slice(0, 10)}.xlsx"`
        );

        // 6. Enviar el archivo al cliente
        await workbook.xlsx.write(res);
        res.end();

    } catch (err) {
        console.error('Error al exportar:', err);
        res.status(500).json({ error: 'No se pudo generar el archivo Excel.', details: err.message });
    }
};


module.exports = {
    getRepartos,
    createReparto,
    updateReparto,
    deleteReparto,
    exportRepartos // Asegúrate de exportar la nueva función
};
