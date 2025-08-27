// backend/src/middleware/errorMiddleware.js

/**
 * Middleware de manejo de errores centralizado para Express.
 * Captura los errores pasados a través de next(error) y envía una respuesta JSON estandarizada.
 * @param {Error} err - El objeto de error.
 * @param {import('express').Request} req - El objeto de solicitud de Express.
 * @param {import('express').Response} res - El objeto de respuesta de Express.
 * @param {import('express').NextFunction} next - La función para pasar al siguiente middleware.
 */
const errorMiddleware = (err, req, res, next) => {
  // Imprime el stack completo del error en la consola del servidor para depuración.
  console.error(err.stack);

  // Si la respuesta ya tiene un código de estado, lo usamos. Si no, es un error interno del servidor (500).
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  // Enviamos una respuesta JSON con un formato consistente.
  res.status(statusCode).json({
    error: 'Ha ocurrido un error en el servidor.',
    // Para entornos de producción, no revelamos detalles del error al cliente.
    details: process.env.NODE_ENV === 'production' ? 'Contacte al administrador.' : err.message,
  });
};

export default errorMiddleware;
