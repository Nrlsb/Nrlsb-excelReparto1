// backend/src/routes/googleApiRoutes.js
const express = require('express');
const router = express.Router();
const {
  geocodeAddress,
  optimizeRoute,
  getPlacePredictions, // Se importa la nueva función
} = require('../controllers/googleApiController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/geocode', authMiddleware, geocodeAddress);
router.post('/optimize-route', authMiddleware, optimizeRoute);

// NUEVA RUTA para obtener sugerencias de direcciones
router.get('/places-autocomplete', authMiddleware, getPlacePredictions);

module.exports = router;
