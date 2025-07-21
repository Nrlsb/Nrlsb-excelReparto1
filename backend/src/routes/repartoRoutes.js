// src/routes/repartoRoutes.js
// --- ARCHIVO MODIFICADO ---

import { Router } from 'express';
import {
  getRepartos,
  addReparto,
  updateReparto,
  deleteReparto,
  clearRepartos
} from '../controllers/repartoController.js';
import authMiddleware from '../middleware/authMiddleware.js'; // Importamos el middleware

const router = Router();

// Aplicamos el middleware a TODAS las rutas de repartos.
// Esto asegura que ninguna de estas operaciones se pueda realizar sin un token válido.
router.use(authMiddleware);

// Define las rutas y las asocia con las funciones del controlador
// GET /api/repartos -> Obtiene todos los repartos del usuario autenticado
router.get('/repartos', getRepartos);

// POST /api/repartos -> Agrega un nuevo reparto para el usuario autenticado
router.post('/repartos', addReparto);

// PUT /api/repartos/:id -> Actualiza un reparto específico del usuario autenticado
router.put('/repartos/:id', updateReparto);

// DELETE /api/repartos/:id -> Elimina un reparto específico del usuario autenticado
router.delete('/repartos/:id', deleteReparto);

// DELETE /api/repartos -> Elimina todos los repartos del usuario autenticado
router.delete('/repartos', clearRepartos);

export default router;
