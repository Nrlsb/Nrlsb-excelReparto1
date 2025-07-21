# Gestión de Repartos - Full Stack

Este proyecto es una aplicación web full-stack para la gestión de repartos de forma colaborativa y en tiempo real. Originalmente construido con HTML y Firebase, ha sido escalado a una arquitectura moderna y robusta.

### [**Ver Demo en Vivo**](https://nrlsb-excel-reparto1.vercel.app/)

![Imagen de la aplicación de repartos funcionando](https://i.imgur.com/gKk9p3v.jpg)

---

## ✨ Características

-   **Arquitectura Separada**: Frontend y Backend desacoplados para mayor escalabilidad y mantenimiento.
-   **Sincronización en Tiempo Real**: Gracias a las suscripciones de Supabase, los cambios se reflejan instantáneamente en todos los clientes.
-   **Interfaz Moderna**: Construida con React para una experiencia de usuario rápida y fluida.
-   **Backend Robusto**: API RESTful construida con Node.js y Express para manejar la lógica de negocio.
-   **Base de Datos Relacional**: Utiliza PostgreSQL alojado en Supabase para persistir los datos de forma segura.
-   **Exportación a Excel**: Permite descargar la lista de repartos en un archivo `.xlsx`.
-   **Despliegue Profesional**: Frontend alojado en Vercel y Backend en Render, siguiendo las mejores prácticas de la industria.

---

## 🚀 Stack Tecnológico

| Área          | Tecnología                                                              |
| ------------- | ----------------------------------------------------------------------- |
| **Frontend** | ![React](https://img.shields.io/badge/-React-61DAFB?logo=react&logoColor=white) ![Axios](https://img.shields.io/badge/-Axios-5A29E4?logo=axios&logoColor=white)                                |
| **Backend** | ![Node.js](https://img.shields.io/badge/-Node.js-339933?logo=node.js&logoColor=white) ![Express.js](https://img.shields.io/badge/-Express.js-000000?logo=express&logoColor=white)      |
| **Base de Datos** | ![Supabase](https://img.shields.io/badge/-Supabase-3FCF8E?logo=supabase&logoColor=white) ![PostgreSQL](https://img.shields.io/badge/-PostgreSQL-4169E1?logo=postgresql&logoColor=white) |
| **Despliegue** | ![Vercel](https://img.shields.io/badge/-Vercel-000000?logo=vercel&logoColor=white) ![Render](https://img.shields.io/badge/-Render-46E3B7?logo=render&logoColor=white)                     |

---

## 🛠️ Desarrollo Local

Para ejecutar este proyecto en tu máquina local, sigue estos pasos.

### Requisitos

-   Node.js (v16 o superior)
-   npm o yarn
-   Una cuenta y un proyecto en Supabase

### 1. Clonar el Repositorio

```bash
git clone [https://github.com/tu-usuario/tu-repositorio.git](https://github.com/tu-usuario/tu-repositorio.git)
cd tu-repositorio
```

### 2. Configurar el Backend

1.  Navega a la carpeta del backend:
    ```bash
    cd backend
    ```
2.  Instala las dependencias:
    ```bash
    npm install
    ```
3.  Crea un archivo `.env` a partir del ejemplo y llénalo con tus credenciales de Supabase.
4.  Inicia el servidor de desarrollo:
    ```bash
    npm run dev
    ```
    El backend estará corriendo en `http://localhost:3001`.

### 3. Configurar el Frontend

1.  Abre una nueva terminal y navega a la carpeta del frontend:
    ```bash
    cd frontend
    ```
2.  Instala las dependencias:
    ```bash
    npm install
    ```
3.  Crea un archivo `.env` a partir del ejemplo y llénalo con las variables de entorno, asegurándote de que `REACT_APP_API_URL` apunte a tu backend local (`http://localhost:3001/api`).
4.  Inicia la aplicación de React:
    ```bash
    npm start
    ```
    El frontend estará disponible en `http://localhost:3000`.

---

## ☁️ Despliegue

El proyecto está desplegado de la siguiente manera:

-   **Frontend (React)**: Desplegado en **Vercel**. Se conecta al backend a través de variables de entorno.
-   **Backend (Node.js)**: Desplegado como un servicio web en **Render**. Se conecta a Supabase a través de variables de entorno.

La configuración de CORS en el backend está ajustada para aceptar peticiones únicamente desde la URL del frontend en Vercel, garantizando la seguridad.

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo `LICENSE` para más detalles.
Gestión de Repartos - Full Stack
Una aplicación web full-stack moderna para la gestión de repartos de forma
colaborativa. Construida con React, Node.js y Supabase para ofrecer una experiencia
fluida y en tiempo real.
Ver demostración en vivo

✨ Características principales
● CRUD Completo : Crea, lee, actualiza y elimina repartos de forma intuitiva.
● Sincronización en Tiempo Real : Los cambios se reflejan instantáneamente en
todas las pantallas de los usuarios gracias a las suscripciones de Supabase.
● Interfaz Moderna y Responsiva : Desarrollada con React y estilizada con
Tailwind CSS para una experiencia de usuario limpia y adaptable a cualquier
dispositivo.
● Exportación a Excel : Descarga la lista completa de repartos en un archivo .xlsx
con un solo clic.
● Backend Robusto : API RESTful construida con Node.js y Express que maneja
toda la lógica de negocio de forma eficiente.
● Arquitectura Desacoplada : Frontend y Backend separados para mejorar la
escalabilidad, el mantenimiento y la organización del código.
● Despliegue Profesional : Alojado en plataformas líderes como Vercel para el
frontend y Render para el backend.
🚀 Stack Tecnológico
Área Tecnología
Frontend
Backend
Base de Datos
Despliegue
📁 Estructura del Proyecto
El repositorio está organizado en dos carpetas principales:
● /frontend: Contiene la aplicación de React.
● /backend: Contiene el servidor de Node.js y la API de Express.

🛠 Cómo Ejecutar el Proyecto en Local
Sigue estos pasos para configurar y ejecutar el proyecto en tu máquina.
Requisitos Previos
● Node.js (v16 o superior)
● npm o Yarn
● Una cuenta gratuita en Supabase

1. Configuración de Supabase
1. Crea un nuevo proyecto en Supabase.
2. Dentro de tu proyecto, ve un Editor SQL y ejecuta la siguiente consulta para crear
la tabla de repartos:
CREATE TABLE repartos (
id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
destino TEXT NOT NULL,
direccion TEXT NOT NULL,
horarios TEXT,
bultos INT NOT NULL,
agregado_por TEXT,
create_at TIMESTAMPTZ DEFAULT NOW()
);
3. Ve a Configuración > API y copia tu URL del Proyecto y tu clave anon (pública) . Las necesidades
para los siguientes pasos.
2. Configuración del Backend
1. Navega a la carpeta del backend:
cd backend
2. Instala las dependencias:
npm install
3. Crea un archivo .env en la raíz de la carpeta /backend y añade tus credenciales
de Supabase:
SUPABASE_URL=TU_URL_DE_SUPABASE
SUPABASE_ANON_KEY=TU_CLAVE_ANON_DE_SUPABASE
PORT=
4. Inicia el servidor de desarrollo:

npm run dev
El backend estará corriendo en http://localhost:3001.
3. Configuración del Frontend
1. Abre una nueva terminal y navega a la carpeta del frontend:
cd frontend
2. Instala las dependencias:
npm install
3. Crea un archivo .env en la raíz de la carpeta /frontend y añade las siguientes
variables:
REACT_APP_SUPABASE_URL=TU_URL_DE_SUPABASE
REACT_APP_SUPABASE_ANON_KEY=TU_CLAVE_ANON_DE_SUPABASE
REACT_APP_API_URL=http://localhost:3001/api
4. Inicia la aplicación de React:
npm start
El frontend estará disponible en http://localhost:3000 y se conectará a tu
backend local.

☁ Despliegue
● Frontend (React) : Desplegado en Vercel . Las variables de entorno
(REACT_APP_*) se configuran en el panel de Vercel. REACT_APP_API_URL debe
apuntar a la URL pública de su backend en Render.
● Backend (Node.js) : Desplegado como un servicio web en Render . Las variables
de entorno (SUPABASE_URL, SUPABASE_ANON_KEY) se configuran en el panel
de Render.
La configuración de CORS en backend/src/server.js está ajustada para aceptar
solicitudes únicamente desde la URL del frontend desplegado, garantizando la
seguridad.

📄 Licencia
Este proyecto está bajo la Licencia MIT. Consulta el archivo LICENCIA para más
detalles.