// src/controllers/profileController.js
// --- ARCHIVO NUEVO ---

import { supabaseAdmin } from '../config/supabaseClient.js';

export const updateProfile = async (req, res) => {
  const { username } = req.body;
  const user = req.user;

  if (!username || username.trim().length < 3) {
    return res.status(400).json({ error: 'El nombre de usuario debe tener al menos 3 caracteres.' });
  }

  try {
    // 1. Actualizar el nombre de usuario en la tabla 'profiles'
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({ username: username.trim(), updated_at: new Date() })
      .eq('id', user.id);

    if (profileError) {
      // Manejar error si el nombre de usuario ya existe (violación de restricción UNIQUE)
      if (profileError.code === '23505') {
        return res.status(409).json({ error: 'Este nombre de usuario ya está en uso.' });
      }
      throw profileError;
    }

    // 2. Actualizar los metadatos del usuario en 'auth.users'
    const { data: { user: updatedUser }, error: authError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      { user_metadata: { ...user.user_metadata, username: username.trim() } }
    );

    if (authError) throw authError;

    // Nota: La actualización de 'agregado_por' en la tabla 'repartos' se manejará con un trigger
    // en la base de datos para mayor consistencia (ver Paso 2).

    res.status(200).json({ message: 'Perfil actualizado correctamente.', user: updatedUser });
  } catch (error) {
    console.error('Error al actualizar el perfil:', error);
    res.status(500).json({ error: 'Error interno del servidor al actualizar el perfil.' });
  }
};
