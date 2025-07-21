import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY; // Nueva variable

// Validar que las credenciales de Supabase estén definidas
if (!supabaseUrl || !supabaseKey || !supabaseServiceKey) {
  throw new Error("Las credenciales (URL, Key y Service Key) de Supabase no están definidas en el archivo .env");
}

// Cliente de Supabase para operaciones del lado del cliente (respeta RLS)
export const supabase = createClient(supabaseUrl, supabaseKey);

// --- NUEVO: Cliente de Supabase con privilegios de administrador ---
// Este cliente utilizará la service_role key para saltarse las políticas de RLS.
// ¡USAR CON PRECAUCIÓN Y SOLO EN EL BACKEND!
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
