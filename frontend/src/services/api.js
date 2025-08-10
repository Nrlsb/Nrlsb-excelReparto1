import axios from 'axios';

const api = axios.create({
  // La URL base para las peticiones a tu backend
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
});

// CORRECCIÓN: Cambiar a una exportación por defecto.
export default api;
