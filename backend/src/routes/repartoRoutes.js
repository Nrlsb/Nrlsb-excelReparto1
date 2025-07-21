import { Router } from 'express';
import {
  getRepartos,
  addReparto,
  updateReparto,
  deleteReparto,
  clearRepartos
} from '../controllers/repartoController.js';

const router = Router();

// Define las rutas y las asocia con las funciones del controlador
// GET /api/repartos -> Obtiene todos los repartos
router.get('/repartos', getRepartos);

// POST /api/repartos -> Agrega un nuevo reparto
router.post('/repartos', addReparto);

// PUT /api/repartos/:id -> Actualiza un reparto específico
router.put('/repartos/:id', updateReparto);

// DELETE /api/repartos/:id -> Elimina un reparto específico
router.delete('/repartos/:id', deleteReparto);

// DELETE /api/repartos -> Elimina todos los repartos
router.delete('/repartos', clearRepartos);

export default router;
