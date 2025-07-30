// backend/src/controllers/profileController.js
import supabase from '../config/supabaseClient.js';

// La función getProfile no se usa, pero la dejamos por si se necesita en el futuro.
export const getProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase
            .from('profiles')
            .select(`username, website, avatar_url`)
            .eq('id', id)
            .single();

        if (error) throw error;
        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ error: 'No se pudo obtener el perfil.', details: err.message });
    }
};

export const updateProfile = async (req, res) => {
    try {
        // Usar el ID del usuario autenticado que viene del middleware
        const { id } = req.user;
        const { username, website, avatar_url } = req.body;

        // 1. Actualizar los metadatos en la tabla de autenticación de Supabase
        const { error: authError } = await supabase.auth.admin.updateUserById(
            id,
            { user_metadata: { username: username } }
        );

        if (authError) throw authError;

        // 2. Actualizar la tabla pública de perfiles
        const { error: profileError } = await supabase.from('profiles').upsert({
            id,
            username,
            website,
            avatar_url,
            updated_at: new Date(),
        });

        if (profileError) throw profileError;
        
        // El trigger 'on_profile_updated' en la base de datos se encargará
        // de actualizar el campo 'agregado_por' en la tabla de repartos.

        res.status(200).json({ message: 'Perfil actualizado correctamente.' });
    } catch (err) {
        res.status(500).json({ error: 'No se pudo actualizar el perfil.', details: err.message });
    }
};
