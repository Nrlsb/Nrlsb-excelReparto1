import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
});

// Función para adjuntar el token de autenticación a las peticiones
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// Funciones para Repartos
export const getRepartos = () => api.get('/repartos');
export const createReparto = (reparto) => api.post('/repartos', reparto);
export const updateReparto = (id, reparto) => api.put(`/repartos/${id}`, reparto);
export const deleteReparto = (id) => api.delete(`/repartos/${id}`);

// --- NUEVA FUNCIÓN PARA OPTIMIZAR LA RUTA ---
export const optimizeRoute = (repartos) => api.post('/repartos/optimize', { repartos });

// Funciones para Perfil
export const getProfile = () => api.get('/profile');
export const updateProfile = (profile) => api.put('/profile', profile);

export default api;
