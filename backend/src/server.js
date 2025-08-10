// backend/src/server.js

// Se cambian los 'import' por 'require' para usar CommonJS
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const repartoRoutes = require('./routes/repartoRoutes.js');
const profileRoutes = require('./routes/profileRoutes.js');
const googleApiRoutes = require('./routes/googleApiRoutes.js');

dotenv.config();

const app = express();
// Render proporciona el puerto a través de la variable de entorno PORT
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Rutas (esto permanece igual)
app.use('/api/repartos', repartoRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/google', googleApiRoutes);

app.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});
