import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

// Validar que las credenciales de Supabase estén definidas
if (!supabaseUrl || !supabaseKey) {
  throw new Error("Las credenciales (URL y Key) de Supabase no están definidas en el archivo .env");
}

// Crear y exportar el cliente de Supabase para usarlo en otras partes del backend
export const supabase = createClient(supabaseUrl, supabaseKey);
