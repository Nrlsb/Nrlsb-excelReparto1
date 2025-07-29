import supabase from '../config/supabaseClient.js';

const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No autorizado: Token no proporcionado.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            return res.status(401).json({ error: 'No autorizado: Token inválido.' });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'No autorizado: Error de autenticación.' });
    }
};

export default authMiddleware;
