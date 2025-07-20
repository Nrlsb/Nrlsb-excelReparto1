import { Router } from 'express';
import {
  getRepartos,
  addReparto,
  clearRepartos
} from '../controllers/repartoController.js';

const router = Router();

// Define las rutas y las asocia con las funciones del controlador
// GET /api/repartos -> Obtiene todos los repartos
router.get('/repartos', getRepartos);

// POST /api/repartos -> Agrega un nuevo reparto
router.post('/repartos', addReparto);

// DELETE /api/repartos -> Elimina todos los repartos
router.delete('/repartos', clearRepartos);

export default router;
