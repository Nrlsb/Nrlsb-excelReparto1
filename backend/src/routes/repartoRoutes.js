// backend/src/routes/repartoRoutes.js
import express from 'express';
import { 
  getRepartos, 
  createReparto, 
  updateReparto, 
  deleteReparto, 
  exportRepartos,
  clearAllRepartos
} from '../controllers/repartoController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Rutas generales
router.get('/', authMiddleware, getRepartos);
router.post('/', authMiddleware, createReparto);
router.get('/export', authMiddleware, exportRepartos);

// --- CORRECCIÓN DE ORDEN ---
// La ruta específica '/all' debe declararse ANTES de la ruta genérica con parámetros como '/:id'
// para asegurar que sea detectada correctamente por Express.
router.delete('/all', authMiddleware, clearAllRepartos);

// Rutas específicas por ID
router.put('/:id', authMiddleware, updateReparto);
router.delete('/:id', authMiddleware, deleteReparto);

export default router;
