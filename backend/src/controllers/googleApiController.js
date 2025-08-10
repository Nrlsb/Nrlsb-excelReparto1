// backend/src/controllers/googleApiController.js
import axios from 'axios';

const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

export const getPlaceAutocomplete = async (req, res) => {
  const { input } = req.query;

  if (!GOOGLE_API_KEY) {
    return res.status(500).json({ error: 'La clave de API de Google Maps no está configurada en el servidor.' });
  }
  if (!input) {
    return res.status(400).json({ error: 'El parámetro "input" es requerido.' });
  }

  const apiUrl = 'https://maps.googleapis.com/maps/api/place/autocomplete/json';

  try {
    const response = await axios.get(apiUrl, {
      params: {
        input,
        key: GOOGLE_API_KEY,
        components: 'country:ar',
        language: 'es',
      },
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error en el proxy de Google Places:', error.message);
    res.status(500).json({ error: 'Error al contactar la API de Google Places.' });
  }
};

export const getGeocodeFromPlaceId = async (req, res) => {
    const { place_id } = req.query;

    if (!GOOGLE_API_KEY) {
        return res.status(500).json({ error: 'La clave de API de Google Maps no está configurada en el servidor.' });
    }
    if (!place_id) {
        return res.status(400).json({ error: 'El parámetro "place_id" es requerido.' });
    }

    const apiUrl = 'https://maps.googleapis.com/maps/api/geocode/json';

    try {
        const response = await axios.get(apiUrl, {
            params: {
                place_id,
                key: GOOGLE_API_KEY,
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error('Error en el proxy de Google Geocode:', error.message);
        res.status(500).json({ error: 'Error al contactar la API de Google Geocode.' });
    }
};
