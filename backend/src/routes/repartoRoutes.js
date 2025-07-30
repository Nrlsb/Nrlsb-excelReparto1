// backend/src/routes/repartoRoutes.js
import express from 'express';
import { 
  getRepartos, 
  createReparto, 
  updateReparto, 
  deleteReparto, 
  exportRepartos,
  clearAllRepartos // Importar la nueva función
} from '../controllers/repartoController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, getRepartos);
router.post('/', authMiddleware, createReparto);
router.put('/:id', authMiddleware, updateReparto);
router.delete('/:id', authMiddleware, deleteReparto);
router.get('/export', authMiddleware, exportRepartos);
// Nueva ruta para vaciar los repartos
router.delete('/all', authMiddleware, clearAllRepartos);

export default router;
