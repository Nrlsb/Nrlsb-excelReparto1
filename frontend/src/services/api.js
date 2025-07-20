import axios from 'axios';
import { toast } from 'react-toastify';

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para manejar errores de forma centralizada
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Extrae el mensaje de error de la respuesta de la API, o usa uno por defecto
    const message = error.response?.data?.error || 'Ocurrió un error inesperado en la red.';
    
    // Muestra una notificación de error al usuario
    toast.error(message);
    
    // Rechaza la promesa para que el error pueda ser manejado localmente si es necesario
    return Promise.reject(error);
  }
);


export const getRepartos = async () => {
  const response = await apiClient.get('/repartos');
  return response.data;
};

export const addReparto = async (repartoData) => {
  const response = await apiClient.post('/repartos', repartoData);
  return response.data;
};

export const clearRepartos = async () => {
  const response = await apiClient.delete('/repartos');
  return response.data;
};
