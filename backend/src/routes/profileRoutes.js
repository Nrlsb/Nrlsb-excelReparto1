// backend/src/routes/profileRoutes.js
import { Router } from 'express';
import { updateProfile } from '../controllers/profileController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = Router();

// Todas las rutas de perfil requieren autenticación
router.use(authMiddleware);

// PUT /api/profile -> Actualiza el perfil del usuario autenticado
// Se corrige la ruta de '/profile' a '/' para que sea /api/profile
router.put('/', updateProfile);

export default router;
