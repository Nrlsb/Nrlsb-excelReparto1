const express = require('express');
const { 
    getRepartos, 
    createReparto, 
    updateReparto, 
    deleteReparto, 
    exportRepartos // Importar la nueva función
} = require('../controllers/repartoController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Rutas existentes
router.get('/', authMiddleware, getRepartos);
router.post('/', authMiddleware, createReparto);
router.put('/:id', authMiddleware, updateReparto);
router.delete('/:id', authMiddleware, deleteReparto);

// --- NUEVA RUTA PARA EXPORTAR ---
router.get('/export', authMiddleware, exportRepartos);

module.exports = router;
