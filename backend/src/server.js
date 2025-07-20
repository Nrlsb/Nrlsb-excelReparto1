import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import repartoRoutes from './routes/repartoRoutes.js';

// Cargar variables de entorno del archivo .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// --- Configuración de CORS ---
// CORREGIDO: Se agregó "https://" a la URL del frontend
const frontendURL = "https://nrlsb-excel-reparto1.vercel.app"; 

const corsOptions = {
  origin: frontendURL,
  optionsSuccessStatus: 200 // Para compatibilidad con navegadores antiguos
};

// --- Middlewares ---
// Habilita CORS con las opciones específicas
app.use(cors(corsOptions));

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
