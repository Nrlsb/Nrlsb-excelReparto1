// backend/src/middleware/asyncHandler.js

/**
 * Un wrapper para funciones de controlador asíncronas de Express.
 * Captura cualquier error de una promesa rechazada y lo pasa a Express
 * para que sea manejado por el middleware de errores.
 * @param {function} fn - La función de controlador asíncrona.
 * @returns {function} Una nueva función que maneja los errores.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
