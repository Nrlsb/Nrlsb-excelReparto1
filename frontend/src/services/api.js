import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
