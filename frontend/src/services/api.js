import axios from 'axios';
import supabase from '../supabaseClient';

// Configura la URL base para las peticiones de Axios.
// Si estás en desarrollo, usará localhost. Si no, la URL de tu backend desplegado.
const apiClient = axios.create({
    baseURL: process.env.NODE_ENV === 'development' 
        ? 'http://localhost:3001/api' 
        : 'https://excel-reparto-1.vercel.app/api', // Asegúrate de que esta sea la URL correcta de tu backend en Vercel
});

// Interceptor para añadir el token de autenticación de Supabase a cada petición
apiClient.interceptors.request.use(async (config) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Exportamos cada función de forma individual (named export)

export const getRepartos = async () => {
    try {
        const response = await apiClient.get('/repartos');
        return response.data;
    } catch (error) {
        console.error('Error al obtener los repartos:', error);
        throw error;
    }
};

export const updateReparto = async (id, data) => {
    try {
        const response = await apiClient.put(`/repartos/${id}`, data);
        return response.data;
    } catch (error) {
        console.error(`Error al actualizar el reparto ${id}:`, error);
        throw error;
    }
};

export const updateRepartoEstado = async (id, estado) => {
    try {
        const response = await apiClient.put(`/repartos/${id}/estado`, { estado });
        return response.data;
    } catch (error) {
        console.error(`Error al actualizar el estado del reparto ${id}:`, error);
        throw error;
    }
};

export const deleteReparto = async (id) => {
    try {
        const response = await apiClient.delete(`/repartos/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error al eliminar el reparto ${id}:`, error);
        throw error;
    }
};

export const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
        const response = await apiClient.post('/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error al subir el archivo:', error);
        throw error;
    }
};
