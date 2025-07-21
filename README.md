# Gestión de Repartos - Full Stack con Roles y Tiempo Real

Una aplicación web full-stack moderna para la gestión de repartos de forma colaborativa. Construida con React, Node.js y Supabase para ofrecer una experiencia fluida, segura y en tiempo real con roles de usuario.

### [**Ver Demo en Vivo**](https://nrlsb-excel-reparto1.vercel.app/)

![Imagen de la aplicación de repartos funcionando](https://i.imgur.com/gKk9p3v.jpg)

---

## ✨ Características Principales

-   **Autenticación y Perfiles de Usuario**: Sistema completo de registro e inicio de sesión. Cada usuario tiene un alias personalizable.
-   **Rol de Administrador**: Un usuario administrador tiene la capacidad de ver, editar y eliminar los repartos de todos los usuarios.
-   **CRUD Completo y Privado**: Los usuarios estándar solo pueden crear, leer, actualizar y eliminar sus propios repartos.
-   **Sincronización en Tiempo Real**: Los cambios se reflejan instantáneamente en todas las pantallas de los usuarios gracias a las suscripciones en tiempo real de Supabase.
-   **Interfaz Moderna y Responsiva**: Desarrollada con **React** y estilizada con **Tailwind CSS** para una experiencia de usuario limpia y adaptable.
-   **Ordenamiento de Datos**: La tabla de repartos se puede ordenar dinámicamente haciendo clic en las cabeceras de las columnas.
-   **Exportación a Excel**: Descarga la lista de repartos (respetando el orden actual) en un archivo `.xlsx`.
-   **Backend Robusto y Seguro**: API RESTful construida con **Node.js** y **Express** que protege las rutas y valida los permisos de los usuarios.
-   **Arquitectura Desacoplada**: Frontend y Backend separados para mejorar la escalabilidad y el mantenimiento.
-   **Despliegue Profesional**: Alojado en **Vercel** para el frontend y **Render** para el backend.

---

## 🚀 Stack Tecnológico

| Área          | Tecnología                                                              |
| ------------- | ----------------------------------------------------------------------- |
| **Frontend** | ![React](https://img.shields.io/badge/-React-61DAFB?logo=react&logoColor=white) ![Tailwind CSS](https://img.shields.io/badge/-Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white) ![Axios](https://img.shields.io/badge/-Axios-5A29E4?logo=axios&logoColor=white) |
| **Backend** | ![Node.js](https://img.shields.io/badge/-Node.js-339933?logo=node.js&logoColor=white) ![Express.js](https://img.shields.io/badge/-Express.js-000000?logo=express&logoColor=white)      |
| **Base de Datos y Auth** | ![Supabase](https://img.shields.io/badge/-Supabase-3FCF8E?logo=supabase&logoColor=white) ![PostgreSQL](https://img.shields.io/badge/-PostgreSQL-4169E1?logo=postgresql&logoColor=white) |
| **Despliegue** | ![Vercel](https://img.shields.io/badge/-Vercel-000000?logo=vercel&logoColor=white) ![Render](https://img.shields.io/badge/-Render-46E3B7?logo=render&logoColor=white)                     |

---

## 📁 Estructura del Proyecto

El repositorio está organizado en dos carpetas principales:

-   `/frontend`: Contiene la aplicación de React.
-   `/backend`: Contiene el servidor de Node.js y la API de Express.

---

## 🛠️ Cómo Ejecutar el Proyecto en Local

### Requisitos Previos

-   Node.js (v16 o superior)
-   npm o yarn
-   Una cuenta gratuita en [Supabase](https://supabase.com/)

### 1. Configuración de Supabase

1.  Crea un nuevo proyecto en Supabase.
2.  Dentro de tu proyecto, ve a `SQL Editor` > `+ New query` y ejecuta el siguiente script para crear las tablas `repartos` y `profiles`, junto con los triggers necesarios para la automatización.

    ```sql
    -- 1. Tabla de Repartos
    CREATE TABLE repartos (
      id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
      destino TEXT NOT NULL,
      direccion TEXT NOT NULL,
      horarios TEXT,
      bultos INT NOT NULL,
      agregado_por TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
    );
    ALTER TABLE public.repartos ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Los usuarios pueden gestionar sus propios repartos" ON public.repartos
      FOR ALL USING (auth.uid() = user_id);

    -- 2. Tabla de Perfiles
    CREATE TABLE public.profiles (
      id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      username TEXT UNIQUE,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Los usuarios pueden ver y actualizar su propio perfil" ON public.profiles
      FOR ALL USING (auth.uid() = id);
    CREATE POLICY "El servicio puede leer todos los perfiles" ON public.profiles
      FOR SELECT USING (auth.role() = 'service_role');

    -- 3. Trigger para crear un perfil cuando se registra un nuevo usuario
    CREATE OR REPLACE FUNCTION public.handle_new_user()
    RETURNS TRIGGER AS $$
    BEGIN
      INSERT INTO public.profiles (id, username)
      VALUES (new.id, new.raw_user_meta_data->>'username');
      RETURN new;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

    -- 4. Trigger para actualizar 'agregado_por' en repartos cuando un usuario cambia su nombre
    CREATE OR REPLACE FUNCTION public.handle_profile_username_update()
    RETURNS TRIGGER AS $$
    BEGIN
      UPDATE public.repartos
      SET agregado_por = new.username
      WHERE user_id = new.id;
      RETURN new;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    CREATE TRIGGER on_profile_updated
      AFTER UPDATE OF username ON public.profiles
      FOR EACH ROW
      WHEN (old.username IS DISTINCT FROM new.username)
      EXECUTE PROCEDURE public.handle_profile_username_update();
    ```

3.  Ve a `Settings` > `API` y copia tu **URL del Proyecto**, tu clave **anon (public)** y tu clave **service_role (secret)**.

### 2. Configuración del Backend

1.  Navega a la carpeta `/backend`.
2.  Instala las dependencias: `npm install`.
3.  Crea un archivo `.env` y añade tus credenciales:
    ```env
    SUPABASE_URL=TU_URL_DE_SUPABASE
    SUPABASE_ANON_KEY=TU_CLAVE_ANON_DE_SUPABASE
    SUPABASE_SERVICE_KEY=TU_CLAVE_SECRETA_SERVICE_ROLE
    ADMIN_EMAIL=el-email-de-tu-cuenta-admin@ejemplo.com
    PORT=3001
    ```
4.  Inicia el servidor: `npm run dev`.

### 3. Configuración del Frontend

1.  Abre una nueva terminal y navega a la carpeta `/frontend`.
2.  Instala las dependencias: `npm install`.
3.  Crea un archivo `.env` y añade las siguientes variables:
    ```env
    REACT_APP_SUPABASE_URL=TU_URL_DE_SUPABASE
    REACT_APP_SUPABASE_ANON_KEY=TU_CLAVE_ANON_DE_SUPABASE
    REACT_APP_API_URL=http://localhost:3001/api
    REACT_APP_ADMIN_EMAIL=el-email-de-tu-cuenta-admin@ejemplo.com
    ```
4.  Inicia la aplicación: `npm start`.

---

## ☁️ Despliegue

-   **Frontend (React)**: Desplegado en **Vercel**. Configura las variables de entorno (`REACT_APP_*`) en el panel de Vercel. `REACT_APP_API_URL` debe apuntar a la URL pública de tu backend.
-   **Backend (Node.js)**: Desplegado en **Render**. Configura las variables de entorno (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_KEY`, `ADMIN_EMAIL`) en el panel de Render.

La configuración de **CORS** en `backend/src/server.js` está ajustada para aceptar peticiones desde el frontend desplegado y desde `localhost` para desarrollo.

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo `LICENSE` para más detalles.
