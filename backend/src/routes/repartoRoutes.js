import express from 'express';
import { getRepartos, createReparto, updateReparto, deleteReparto, exportRepartos } from '../controllers/repartoController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, getRepartos);
router.post('/', authMiddleware, createReparto);
router.put('/:id', authMiddleware, updateReparto);
router.delete('/:id', authMiddleware, deleteReparto);
router.get('/export', authMiddleware, exportRepartos);

export default router;
