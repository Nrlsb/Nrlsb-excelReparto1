// backend/src/server.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import repartoRoutes from './routes/repartoRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import errorMiddleware from './middleware/errorMiddleware.js'; // 1. Importar el middleware de errores

const app = express();

app.use(cors());
app.use(express.json());

// Rutas de la API
app.use('/api/repartos', repartoRoutes);
app.use('/api/profile', profileRoutes);

// Ruta raíz de prueba
app.get('/', (req, res) => {
  res.send('API de Repartos funcionando correctamente.');
});

// 2. Usar el middleware de errores.
// Debe ser el último `app.use()` para que capture errores de todas las rutas anteriores.
app.use(errorMiddleware);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
