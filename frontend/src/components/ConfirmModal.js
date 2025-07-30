// frontend/src/components/ConfirmModal.js
import React from 'react';

/**
 * Un componente de modal reutilizable para diálogos de confirmación.
 * @param {object} props
 * @param {boolean} props.isOpen - Si el modal está abierto o no.
 * @param {function} props.onClose - Función para llamar al cerrar/cancelar.
 * @param {function} props.onConfirm - Función para llamar al confirmar.
 * @param {string} props.title - El título del modal.
 * @param {React.ReactNode} props.children - El contenido o mensaje del modal.
 */
function ConfirmModal({ isOpen, onClose, onConfirm, title, children }) {
  if (!isOpen) {
    return null;
  }

  return (
    // Fondo oscuro semi-transparente que cubre toda la pantalla
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 transition-opacity duration-300"
      onClick={onClose} // Cierra el modal si se hace clic en el fondo
    >
      {/* Contenedor del modal */}
      <div 
        className="bg-white rounded-xl shadow-2xl p-6 m-4 max-w-sm w-full transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale"
        onClick={(e) => e.stopPropagation()} // Evita que el clic dentro del modal se propague al fondo
      >
        <h2 className="text-xl font-bold text-gray-800 mb-4">{title}</h2>
        <div className="text-gray-600 mb-6">
          {children}
        </div>
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-6 py-2 border-none rounded-lg font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
          >
            Confirmar
          </button>
        </div>
      </div>
      {/* Estilos para la animación de entrada */}
      <style>{`
        @keyframes fade-in-scale {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in-scale {
          animation: fade-in-scale 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

export default ConfirmModal;
