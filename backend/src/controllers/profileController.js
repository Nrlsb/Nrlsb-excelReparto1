import supabase from '../config/supabaseClient.js';

/**
 * Obtiene el perfil del usuario autenticado.
 */
export const getProfile = async (req, res) => {
  const userId = req.user.id;

  const { data, error } = await supabase
    .from('profiles')
    .select('username, website, avatar_url')
    .eq('id', userId)
    .single();

  if (error) {
    // Si no existe el perfil, podemos devolver un objeto vacío o un 404
    if (error.code === 'PGRST116') {
        return res.status(200).json(null); // No profile found is not a server error
    }
    console.error('Error fetching profile:', error);
    return res.status(400).json({ error: error.message });
  }

  res.status(200).json(data);
};

/**
 * Actualiza el perfil del usuario autenticado.
 * Puede crear el perfil si no existe (upsert).
 */
export const updateProfile = async (req, res) => {
  const userId = req.user.id;
  const { username, website, avatar_url } = req.body;

  const { data, error } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      username,
      website,
      avatar_url,
      updated_at: new Date(),
    })
    .select()
    .single();

  if (error) {
    console.error('Error updating profile:', error);
    return res.status(400).json({ error: error.message });
  }

  res.status(200).json(data);
};
