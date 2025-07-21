// src/services/api.js
// --- ARCHIVO MODIFICADO ---
import axios from 'axios';
import { toast } from 'react-toastify';
import { supabase } from '../supabaseClient'; // Importamos supabase

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- NUEVO: Interceptor para añadir el token de autenticación ---
apiClient.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});


// Interceptor para manejar errores de forma centralizada
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // --- NUEVO: Si el error es 401, podría ser un token expirado ---
    if (error.response?.status === 401) {
        toast.error('Tu sesión ha expirado. Por favor, inicia sesión de nuevo.');
        // Opcional: forzar el cierre de sesión
        supabase.auth.signOut();
    } else {
        const message = error.response?.data?.error || 'Ocurrió un error inesperado en la red.';
        toast.error(message);
    }
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

export const updateReparto = async (id, repartoData) => {
  const response = await apiClient.put(`/repartos/${id}`, repartoData);
  return response.data;
};

export const deleteReparto = async (id) => {
  const response = await apiClient.delete(`/repartos/${id}`);
  return response.data;
};

export const clearRepartos = async () => {
  const response = await apiClient.delete('/repartos');
  return response.data;
};
