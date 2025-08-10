// backend/src/routes/googleApiRoutes.js
import express from 'express';
import { getPlaceAutocomplete, getGeocodeFromPlaceId } from '../controllers/googleApiController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Protegemos las rutas para que solo usuarios autenticados puedan usarlas
router.use(authMiddleware);

router.get('/places-autocomplete', getPlaceAutocomplete);
router.get('/geocode', getGeocodeFromPlaceId);

export default router;
