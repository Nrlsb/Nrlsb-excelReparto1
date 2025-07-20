import React from 'react';
import ReactDOM from 'react-dom/client';
// import './index.css'; // Se eliminó esta línea porque el archivo no existe
import App from './App';

// Este es el punto de entrada de la aplicación.
// Busca el div con id="root" en tu public/index.html
const root = ReactDOM.createRoot(document.getElementById('root'));

// Renderiza (dibuja) el componente principal <App /> dentro de ese div.
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
