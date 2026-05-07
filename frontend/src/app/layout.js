import './globals.css';
import 'react-toastify/dist/ReactToastify.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Gestión de Repartos',
  description: 'Sistema de optimización y gestión de repartos',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css"
        />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
