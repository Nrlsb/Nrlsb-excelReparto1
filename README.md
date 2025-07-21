# Gestión de Repartos - Full Stack

Una aplicación web full-stack moderna para la gestión de repartos de forma colaborativa. Construida con React, Node.js y Supabase para ofrecer una experiencia fluida y en tiempo real.

### [**Ver Demo en Vivo**](https://nrlsb-excel-reparto1.vercel.app/)

![Imagen de la aplicación de repartos funcionando](https://i.imgur.com/gKk9p3v.jpg)

---

## ✨ Características Principales

-   **CRUD Completo**: Crea, lee, actualiza y elimina repartos de forma intuitiva.
-   **Sincronización en Tiempo Real**: Los cambios se reflejan instantáneamente en todas las pantallas de los usuarios gracias a las suscripciones de Supabase.
-   **Interfaz Moderna y Responsiva**: Desarrollada con **React** y estilizada con **Tailwind CSS** para una experiencia de usuario limpia y adaptable a cualquier dispositivo.
-   **Exportación a Excel**: Descarga la lista completa de repartos en un archivo `.xlsx` con un solo clic.
-   **Backend Robusto**: API RESTful construida con **Node.js** y **Express** que maneja toda la lógica de negocio de forma eficiente.
-   **Arquitectura Desacoplada**: Frontend y Backend separados para mejorar la escalabilidad, el mantenimiento y la organización del código.
-   **Despliegue Profesional**: Alojado en plataformas líderes como **Vercel** para el frontend y **Render** para el backend.

---

## 🚀 Stack Tecnológico

| Área          | Tecnología                                                              |
| ------------- | ----------------------------------------------------------------------- |
| **Frontend** | ![React](https://img.shields.io/badge/-React-61DAFB?logo=react&logoColor=white) ![Tailwind CSS](https://img.shields.io/badge/-Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white) ![Axios](https://img.shields.io/badge/-Axios-5A29E4?logo=axios&logoColor=white) |
| **Backend** | ![Node.js](https://img.shields.io/badge/-Node.js-339933?logo=node.js&logoColor=white) ![Express.js](https://img.shields.io/badge/-Express.js-000000?logo=express&logoColor=white)      |
| **Base de Datos** | ![Supabase](https://img.shields.io/badge/-Supabase-3FCF8E?logo=supabase&logoColor=white) ![PostgreSQL](https://img.shields.io/badge/-PostgreSQL-4169E1?logo=postgresql&logoColor=white) |
| **Despliegue** | ![Vercel](https://img.shields.io/badge/-Vercel-000000?logo=vercel&logoColor=white) ![Render](https://img.shields.io/badge/-Render-46E3B7?logo=render&logoColor=white)                     |

---

## 📁 Estructura del Proyecto

El repositorio está organizado en dos carpetas principales:

-   `/frontend`: Contiene la aplicación de React.
-   `/backend`: Contiene el servidor de Node.js y la API de Express.

---

## 🛠️ Cómo Ejecutar el Proyecto en Local

Sigue estos pasos para configurar y correr el proyecto en tu máquina.

### Requisitos Previos

-   Node.js (v16 o superior)
-   npm o yarn
-   Una cuenta gratuita en [Supabase](https://supabase.com/)

### 1. Configuración de Supabase

1.  Crea un nuevo proyecto en Supabase.
2.  Dentro de tu proyecto, ve a `SQL Editor` y ejecuta la siguiente consulta para crear la tabla `repartos`:
    ```sql
    CREATE TABLE repartos (
      id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
      destino TEXT NOT NULL,
      direccion TEXT NOT NULL,
      horarios TEXT,
      bultos INT NOT NULL,
      agregado_por TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    ```
3.  Ve a `Settings` > `API` y copia tu **URL del Proyecto** y tu clave **anon (public)**. Las necesitarás para los siguientes pasos.

### 2. Configuración del Backend

1.  Navega a la carpeta del backend:
    ```bash
    cd backend
    ```
2.  Instala las dependencias:
    ```bash
    npm install
    ```
3.  Crea un archivo `.env` en la raíz de la carpeta `/backend` y añade tus credenciales de Supabase:
    ```env
    SUPABASE_URL=TU_URL_DE_SUPABASE
    SUPABASE_ANON_KEY=TU_CLAVE_ANON_DE_SUPABASE
    PORT=3001
    ```
4.  Inicia el servidor de desarrollo:
    ```bash
    npm run dev
    ```
    El backend estará corriendo en `http://localhost:3001`.

### 3. Configuración del Frontend

1.  Abre una **nueva terminal** y navega a la carpeta del frontend:
    ```bash
    cd frontend
    ```
2.  Instala las dependencias:
    ```bash
    npm install
    ```
3.  Crea un archivo `.env` en la raíz de la carpeta `/frontend` y añade las siguientes variables:
    ```env
    REACT_APP_SUPABASE_URL=TU_URL_DE_SUPABASE
    REACT_APP_SUPABASE_ANON_KEY=TU_CLAVE_ANON_DE_SUPABASE
    REACT_APP_API_URL=http://localhost:3001/api
    ```
4.  Inicia la aplicación de React:
    ```bash
    npm start
    ```
    El frontend estará disponible en `http://localhost:3000` y se conectará a tu backend local.

---

## ☁️ Despliegue

-   **Frontend (React)**: Desplegado en **Vercel**. Las variables de entorno (`REACT_APP_*`) se configuran en el panel de Vercel. `REACT_APP_API_URL` debe apuntar a la URL pública de tu backend en Render.
-   **Backend (Node.js)**: Desplegado como un servicio web en **Render**. Las variables de entorno (`SUPABASE_URL`, `SUPABASE_ANON_KEY`) se configuran en el panel de Render.

La configuración de **CORS** en `backend/src/server.js` está ajustada para aceptar peticiones únicamente desde la URL del frontend desplegado, garantizando la seguridad.

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo `LICENSE` para más detalles.
