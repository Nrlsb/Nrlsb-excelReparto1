import 'dotenv/config'; // Forma moderna de cargar variables de entorno
import express from 'express';
import cors from 'cors';
import repartoRoutes from './routes/repartoRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import googleApiRoutes from './routes/googleApiRoutes.js'; // <-- AÑADIR ESTA LÍNEA

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/repartos', repartoRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/google', googleApiRoutes); // <-- AÑADIR ESTA LÍNEA

app.get('/', (req, res) => {
  res.send('API de Repartos funcionando correctamente.');
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
