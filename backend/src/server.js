// Importa y configura dotenv para cargar las variables de entorno al inicio
import 'dotenv/config';

import express from 'express';
import cors from 'cors';
// Importamos las rutas con la sintaxis de ES Modules
import repartoRoutes from './routes/repartoRoutes.js';
import profileRoutes from './routes/profileRoutes.js';

const app = express();
const port = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas de la API
app.use('/api/repartos', repartoRoutes);
app.use('/api/profile', profileRoutes);

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
