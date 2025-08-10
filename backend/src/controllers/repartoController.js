import supabase from '../config/supabaseClient.js';
import { Client } from "@googlemaps/google-maps-services-js";

// Crear una instancia del cliente de Google Maps para reutilizarla
const mapsClient = new Client({});

/**
 * Función auxiliar para geocodificar una dirección usando la API de Google Maps.
 * @param {string} address - La dirección a convertir en coordenadas.
 * @returns {Promise<{lat: number, lng: number}|null>} Las coordenadas o null si falla.
 */
const geocodeAddress = async (address) => {
  if (!address) return null;

  try {
    const response = await mapsClient.geocode({
      params: {
        address: address,
        key: process.env.GOOGLE_MAPS_API_KEY,
      },
      timeout: 2000,
    });

    if (response.data.status === 'OK') {
      const location = response.data.results[0].geometry.location;
      console.log(`Geocoding successful for address "${address}":`, location);
      return location;
    } else {
      console.error('Geocoding failed:', response.data.status, response.data.error_message);
      return null;
    }
  } catch (error) {
    console.error('Error calling Geocoding API:', error);
    return null;
  }
};

// --- OBTENER TODOS LOS REPARTOS ---
export const getRepartos = async (req, res) => {
    const userId = req.user.id;
    const { data, error } = await supabase
        .from('repartos')
        .select('*')
        .eq('user_id', userId);

    if (error) {
        return res.status(400).json({ error: error.message });
    }
    res.status(200).json(data);
};

// --- OBTENER UN REPARTO POR ID ---
export const getRepartoById = async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase
        .from('repartos')
        .select('*')
        .eq('id', id)
        .single();

    if (error) return res.status(400).json({ error: error.message });
    if (!data) return res.status(404).json({ error: 'Reparto not found' });
    res.status(200).json(data);
};

// --- CREAR UN NUEVO REPARTO (con geocodificación) ---
export const createReparto = async (req, res) => {
  const { cliente, direccion, telefono, paquete, estado } = req.body;
  const userId = req.user.id;

  const location = await geocodeAddress(direccion);

  const { data, error } = await supabase
    .from('repartos')
    .insert([{ 
        cliente, direccion, telefono, paquete, estado, 
        user_id: userId,
        lat: location ? location.lat : null,
        lng: location ? location.lng : null
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating reparto in Supabase:', error);
    return res.status(400).json({ error: error.message });
  }
  res.status(201).json(data);
};

// --- ACTUALIZAR UN REPARTO (con geocodificación) ---
export const updateReparto = async (req, res) => {
  const { id } = req.params;
  const { cliente, direccion, telefono, paquete, estado } = req.body;

  const location = await geocodeAddress(direccion);

  const { data, error } = await supabase
    .from('repartos')
    .update({ 
        cliente, direccion, telefono, paquete, estado,
        lat: location ? location.lat : null,
        lng: location ? location.lng : null
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating reparto in Supabase:', error);
    return res.status(400).json({ error: error.message });
  }
  if (!data) return res.status(404).json({ error: 'Reparto no encontrado' });
  res.status(200).json(data);
};

// --- ELIMINAR UN REPARTO ---
export const deleteReparto = async (req, res) => {
    const { id } = req.params;

    const { data, error } = await supabase
        .from('repartos')
        .delete()
        .eq('id', id)
        .select()
        .single();

    if (error) return res.status(400).json({ error: error.message });
    if (!data) return res.status(404).json({ error: 'Reparto no encontrado para eliminar' });
    res.status(200).json({ message: 'Reparto deleted successfully', repartro: data });
};

// --- NUEVA FUNCIÓN PARA OPTIMIZAR LA RUTA ---
export const optimizeRoute = async (req, res) => {
  const { repartos } = req.body;

  const validRepartos = repartos.filter(r => r.lat && r.lng);

  if (validRepartos.length < 2) {
    return res.status(400).json({ error: "Se necesitan al menos 2 repartos con coordenadas para optimizar la ruta." });
  }

  const origin = validRepartos[0];
  const waypoints = validRepartos.slice(1);

  try {
    const response = await mapsClient.directions({
      params: {
        origin: { lat: origin.lat, lng: origin.lng },
        destination: { lat: origin.lat, lng: origin.lng },
        waypoints: waypoints.map(wp => ({ lat: wp.lat, lng: wp.lng })),
        optimizeWaypoints: true,
        key: process.env.GOOGLE_MAPS_API_KEY,
      },
    });

    if (response.data.status === 'OK') {
      const optimizedOrder = response.data.routes[0].waypoint_order;
      const optimizedWaypoints = optimizedOrder.map(index => waypoints[index]);
      const optimizedRepartos = [origin, ...optimizedWaypoints];
      
      res.status(200).json({ optimizedRepartos });
    } else {
      res.status(400).json({ error: 'Error al calcular la ruta: ' + response.data.error_message });
    }
  } catch (error) {
    console.error("Error calling Directions API:", error);
    res.status(500).json({ error: "Error interno del servidor al contactar la API de Google." });
  }
};
