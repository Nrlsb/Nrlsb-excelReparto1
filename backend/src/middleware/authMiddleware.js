import supabase from '../config/supabaseClient.js';

/**
 * Middleware para proteger rutas.
 * Verifica el token JWT de la cabecera 'Authorization'.
 * Si el token es válido, adjunta la información del usuario a `req.user`.
 */
export const authMiddleware = async (req, res, next) => {
  // Obtener el token de la cabecera
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Acceso no autorizado: No se proporcionó token.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verificar el token con Supabase
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      console.error('Error de autenticación de Supabase:', error?.message);
      return res.status(401).json({ error: 'Acceso no autorizado: Token inválido o expirado.' });
    }

    // Si el token es válido, adjuntar el usuario al objeto de la solicitud
    req.user = data.user;

    // Continuar con la siguiente función en la ruta
    next();
  } catch (error) {
    console.error('Error inesperado en el middleware de autenticación:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};
