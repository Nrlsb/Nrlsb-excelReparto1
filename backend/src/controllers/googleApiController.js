// backend/src/controllers/googleApiController.js
const { getClient } = require('../config/googleClient');
const axios = require('axios');

const geocodeAddress = async (req, res) => {
  const { address } = req.query;
  try {
    const client = getClient();
    const response = await client.geocode({
      params: {
        address: address,
        key: process.env.GOOGLE_MAPS_API_KEY,
      },
    });
    res.json(response.data.results[0].geometry.location);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

const optimizeRoute = async (req, res) => {
  const { waypoints } = req.body; // Recibe un array de waypoints (lat,lng)
  try {
    const client = getClient();
    const response = await client.directions({
      params: {
        origin: waypoints[0],
        destination: waypoints[0], // Vuelve al origen
        waypoints: `optimize:true|${waypoints.slice(1).join('|')}`,
        key: process.env.GOOGLE_MAPS_API_KEY,
      },
    });
    res.json(response.data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// NUEVA FUNCIÓN para el autocompletado de direcciones
const getPlacePredictions = async (req, res) => {
  const { input } = req.query;
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!input) {
    return res.status(400).json({ error: 'Input query is required' });
  }

  const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json`;

  try {
    const response = await axios.get(url, {
      params: {
        input: input,
        key: apiKey,
        // Puedes añadir más parámetros si lo necesitas, como components para limitar por país
        // components: 'country:ar' 
      },
    });

    if (response.data.status === 'OK') {
      res.json(response.data.predictions);
    } else {
      res.status(500).json({ error: response.data.error_message || 'Error fetching predictions from Google Places API' });
    }
  } catch (error) {
    console.error('Error in getPlacePredictions:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  geocodeAddress,
  optimizeRoute,
  getPlacePredictions, // Se añade la nueva función
};
