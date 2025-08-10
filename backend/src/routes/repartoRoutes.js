import express from 'express';
import * as repartoController from '../controllers/repartoController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Todas las rutas están protegidas por el middleware de autenticación
router.use(authMiddleware);

// --- NUEVA RUTA PARA LA OPTIMIZACIÓN ---
// La definimos antes de las rutas con parámetros para evitar conflictos
router.post('/optimize', repartoController.optimizeRoute);

// Rutas CRUD existentes
router.route('/')
    .get(repartoController.getRepartos)
    .post(repartoController.createReparto);

router.route('/:id')
    .get(repartoController.getRepartoById)
    .put(repartoController.updateReparto)
    .delete(repartoController.deleteReparto);

export default router;
