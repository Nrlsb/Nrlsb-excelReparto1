// backend/src/config/supabaseClient.js
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.SUPABASE_URL;
// ¡IMPORTANTE! Usar la clave de servicio (service_role) en el backend para operaciones administrativas.
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Las credenciales de Supabase (URL y SERVICE_KEY) para el backend no están en el archivo .env");
}

// Inicializa el cliente con la clave de servicio para poder saltar las políticas de RLS cuando sea necesario.
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default supabase;
