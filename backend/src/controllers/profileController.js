import supabase from '../config/supabaseClient.js';

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
        const { id } = req.params;
        const { username, website, avatar_url } = req.body;

        const { error } = await supabase.from('profiles').upsert({
            id,
            username,
            website,
            avatar_url,
            updated_at: new Date(),
        });

        if (error) throw error;
        res.status(200).json({ message: 'Perfil actualizado correctamente.' });
    } catch (err) {
        res.status(500).json({ error: 'No se pudo actualizar el perfil.', details: err.message });
    }
};
