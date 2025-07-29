import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

// No es necesario cargar dotenv de nuevo si ya está en server.js, pero no hace daño.
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

// Usar export default para que coincida con la sintaxis de import
export default supabase;
