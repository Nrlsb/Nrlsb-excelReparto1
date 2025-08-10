import express from 'express';
import * as repartoController from '../controllers/repartoController.js';
// La importación { authMiddleware } ahora funcionará correctamente
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Aplicar el middleware a todas las rutas de repartos
router.use(authMiddleware);

router.post('/optimize', repartoController.optimizeRoute);

router.route('/')
    .get(repartoController.getRepartos)
    .post(repartoController.createReparto);

router.route('/:id')
    .get(repartoController.getRepartoById)
    .put(repartoController.updateReparto)
    .delete(repartoController.deleteReparto);

export default router;
