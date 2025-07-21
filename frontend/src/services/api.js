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
    const message = error.response?.data?.error || 'Ocurrió un error inesperado en la red.';
    toast.error(message);
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

// NUEVA FUNCIÓN: Actualizar un reparto
export const updateReparto = async (id, repartoData) => {
  const response = await apiClient.put(`/repartos/${id}`, repartoData);
  return response.data;
};

// NUEVA FUNCIÓN: Eliminar un reparto
export const deleteReparto = async (id) => {
  const response = await apiClient.delete(`/repartos/${id}`);
  return response.data;
};

export const clearRepartos = async () => {
  const response = await apiClient.delete('/repartos');
  return response.data;
};
