// backend/src/controllers/profileController.js
import supabase from '../config/supabaseClient.js';
import asyncHandler from '../middleware/asyncHandler.js';

export const getProfile = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase
        .from('profiles')
        .select(`username, website, avatar_url`)
        .eq('id', id)
        .single();

    if (error) throw error;
    res.status(200).json(data);
});

export const updateProfile = asyncHandler(async (req, res) => {
    const { id } = req.user;
    const { username, website, avatar_url } = req.body;

    const { error: authError } = await supabase.auth.admin.updateUserById(
        id,
        { user_metadata: { username: username } }
    );

    if (authError) throw authError;

    const { error: profileError } = await supabase.from('profiles').upsert({
        id,
        username,
        website,
        avatar_url,
        updated_at: new Date(),
    });

    if (profileError) throw profileError;
    
    res.status(200).json({ message: 'Perfil actualizado correctamente.' });
});
