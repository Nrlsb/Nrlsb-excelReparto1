// frontend/src/services/api.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

export const getRepartos = async (token) => {
  const response = await api.get('/repartos', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const createReparto = async (reparto, token) => {
  const response = await api.post('/repartos', reparto, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const updateReparto = async (id, updates, token) => {
  const response = await api.put(`/repartos/${id}`, updates, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const deleteReparto = async (id, token) => {
  const response = await api.delete(`/repartos/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const uploadFile = async (file, token) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/repartos/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const optimizeRoute = async (waypoints, token) => {
  const response = await api.post('/google/optimize-route', { waypoints }, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const deleteAllRepartos = async (token) => {
  const response = await api.delete('/repartos', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// NUEVA FUNCIÓN para llamar a nuestro backend para las predicciones
export const getPlacePredictions = async (input, token) => {
  try {
    const response = await api.get('/google/places-autocomplete', {
      params: { input },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching place predictions from backend:', error);
    throw error;
  }
};
