// Cargar variables de entorno
require('dotenv').config();

// Usar require en lugar de import
const express = require('express');
const cors = require('cors');
const repartoRoutes = require('./routes/repartoRoutes');
const profileRoutes = require('./routes/profileRoutes');

// Crear la aplicación de express
const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Para parsear el body de las peticiones como JSON

// Rutas de la API
app.use('/api/repartos', repartoRoutes);
app.use('/api/profile', profileRoutes);

// Ruta de bienvenida para probar que el servidor funciona
app.get('/', (req, res) => {
  res.send('API de Repartos funcionando correctamente.');
});

// Puerto
const PORT = process.env.PORT || 3001;

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
