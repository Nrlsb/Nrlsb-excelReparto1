// src/server.js
// --- ARCHIVO MODIFICADO ---
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import repartoRoutes from './routes/repartoRoutes.js';
import profileRoutes from './routes/profileRoutes.js'; // 1. Importar nuevas rutas

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

const frontendURL = "https://nrlsb-excel-reparto1.vercel.app"; 

const corsOptions = {
  origin: [frontendURL, 'http://localhost:3000'], // Permitir también localhost
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

app.get('/', (req, res) => {
  res.send('API de Gestión de Repartos funcionando correctamente!');
});

app.use('/api', repartoRoutes);
app.use('/api', profileRoutes); // 2. Usar las nuevas rutas de perfil

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
