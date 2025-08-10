import express from 'express';
// Importamos todos los controladores como un objeto
import * as profileController from '../controllers/profileController.js';
// La importación ahora es "nombrada" (con llaves), igual que en repartoRoutes.js
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Aplicar el middleware a todas las rutas de perfil
router.use(authMiddleware);

router.route('/')
    .get(profileController.getProfile)
    .put(profileController.updateProfile);

// Usamos export default para el router
export default router;
