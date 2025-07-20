import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import repartoRoutes from './routes/repartoRoutes.js';

// Cargar variables de entorno del archivo .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// --- Middlewares ---
// Habilita CORS para permitir que tu frontend (que correrá en otro puerto)
// pueda hacer peticiones a este backend.
app.use(cors());

// Permite al servidor procesar y entender cuerpos de petición en formato JSON.
app.use(express.json());

// --- Rutas ---
// Ruta de bienvenida para verificar que el servidor está funcionando.
app.get('/', (req, res) => {
  res.send('API de Gestión de Repartos funcionando correctamente!');
});

// Asocia todas las rutas definidas en repartoRoutes con el prefijo /api.
// Ejemplo: GET /api/repartos
app.use('/api', repartoRoutes);

// --- Iniciar Servidor ---
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
