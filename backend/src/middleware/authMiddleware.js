// src/middleware/authMiddleware.js
// --- ARCHIVO NUEVO ---

import { supabase } from '../config/supabaseClient.js';

const authMiddleware = async (req, res, next) => {
  // Extraer el token del encabezado 'Authorization'
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Acceso denegado. No se proporcionó token.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verificar el token con Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error) {
      // Si el token es inválido o ha expirado, Supabase devolverá un error.
      return res.status(401).json({ error: 'Token inválido o expirado.' });
    }

    if (!user) {
      return res.status(401).json({ error: 'Usuario no encontrado.' });
    }

    // Si el token es válido, adjuntamos el usuario al objeto de la petición (req)
    // para que los siguientes controladores puedan usarlo.
    req.user = user;
    next(); // Pasa al siguiente middleware o al controlador de la ruta
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor al validar el token.' });
  }
};

export default authMiddleware;
