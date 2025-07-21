// src/components/Auth.js
// --- ARCHIVO MODIFICADO ---
import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { toast } from 'react-toastify'; // Importar toast para notificaciones

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      // El inicio de sesión exitoso será manejado por onAuthStateChange en App.js
    } catch (error) {
      // Usar toast en lugar de alert para una mejor UX
      toast.error(error.error_description || error.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSignUp = async (e) => {
    e.preventDefault();
    
    // --- NUEVO: Validación de la longitud de la contraseña ---
    if (password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({ email, password });
      
      if (error) {
        // Manejar errores específicos de Supabase
        if (error.message.includes('User already registered')) {
            toast.error('Este email ya está registrado. Por favor, inicia sesión.');
        } else {
            // Lanzar otros errores para que sean capturados por el bloque catch
            throw error;
        }
      } else if (data.user && data.user.identities && data.user.identities.length === 0) {
        // Este caso suele ocurrir si el usuario existe pero no ha confirmado su email.
        toast.info('Este email ya está registrado. Revisa tu bandeja de entrada para confirmar la cuenta.');
      } else {
        // Mensaje de éxito claro para el usuario.
        toast.success('¡Registro exitoso! Revisa tu email para confirmar tu cuenta y poder iniciar sesión.');
      }

    } catch (error) {
      // Mensaje genérico para cualquier otro error no manejado.
      toast.error(error.error_description || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent m-0">
                📦 Gestión de Repartos
            </h1>
            <p className="text-gray-500 text-md sm:text-lg mt-2">
                Inicia sesión o regístrate para continuar
            </p>
        </div>
        <form className="bg-white shadow-lg rounded-xl px-8 pt-6 pb-8 mb-4 border border-gray-200">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              className="w-full p-3 border-2 border-gray-300 rounded-lg text-base transition duration-300 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
              id="email"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Contraseña
            </label>
            <input
              className="w-full p-3 border-2 border-gray-300 rounded-lg text-base transition duration-300 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
              id="password"
              type="password"
              placeholder="******************"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="flex flex-col space-y-4">
            <button
              onClick={handleLogin}
              className="w-full p-3 border-none rounded-lg text-base font-semibold cursor-pointer transition-transform duration-200 uppercase tracking-wider text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:scale-105 disabled:opacity-60"
              disabled={loading}
            >
              {loading ? <span>Cargando...</span> : <span>Iniciar Sesión</span>}
            </button>
            <button
              onClick={handleSignUp}
              className="w-full p-3 border-2 border-purple-600 rounded-lg text-base font-semibold cursor-pointer transition-transform duration-200 uppercase tracking-wider text-purple-600 bg-white hover:bg-purple-50 disabled:opacity-60"
              disabled={loading}
            >
              {loading ? <span>Cargando...</span> : <span>Registrarse</span>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
