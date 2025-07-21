// src/routes/profileRoutes.js
// --- ARCHIVO NUEVO ---

import { Router } from 'express';
import { updateProfile } from '../controllers/profileController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = Router();

// Todas las rutas de perfil requieren autenticación
router.use(authMiddleware);

// PUT /api/profile -> Actualiza el perfil del usuario autenticado
router.put('/profile', updateProfile);

export default router;
