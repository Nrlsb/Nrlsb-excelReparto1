// src/controllers/repartoController.js
// --- ARCHIVO MODIFICADO ---

import { supabase } from '../config/supabaseClient.js';

// Controlador para obtener todos los repartos del usuario autenticado
export const getRepartos = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('repartos')
      .select('*')
      .eq('user_id', req.user.id) // Filtramos por el ID del usuario
      .order('id', { ascending: true });

    if (error) throw error;

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Controlador para agregar un nuevo reparto
export const addReparto = async (req, res) => {
  const { destino, direccion, horarios, bultos, agregado_por } = req.body;

  if (!destino || !direccion || !bultos) {
    return res.status(400).json({ error: 'Los campos destino, direccion y bultos son obligatorios.' });
  }

  try {
    const { data, error } = await supabase
      .from('repartos')
      .insert([{ 
        destino, 
        direccion, 
        horarios, 
        bultos, 
        agregado_por,
        user_id: req.user.id // Asociamos el reparto con el ID del usuario
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Controlador para actualizar un reparto existente
export const updateReparto = async (req, res) => {
  const { id } = req.params;
  const { destino, direccion, horarios, bultos } = req.body;

  try {
    const { data, error } = await supabase
      .from('repartos')
      .update({ destino, direccion, horarios, bultos })
      .eq('id', id)
      .eq('user_id', req.user.id) // Aseguramos que solo pueda actualizar sus propios repartos
      .select()
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Reparto no encontrado o no tienes permiso para editarlo.' });

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Controlador para eliminar un reparto individual
export const deleteReparto = async (req, res) => {
  const { id } = req.params;

  try {
    const { error } = await supabase
      .from('repartos')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id); // Aseguramos que solo pueda eliminar sus propios repartos

    if (error) throw error;

    res.status(200).json({ message: 'Reparto eliminado correctamente.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Controlador para eliminar todos los repartos del usuario
export const clearRepartos = async (req, res) => {
  try {
    const { error } = await supabase
      .from('repartos')
      .delete()
      .eq('user_id', req.user.id); // Eliminamos solo los repartos del usuario actual

    if (error) throw error;

    res.status(200).json({ message: 'Todos tus repartos han sido eliminados correctamente.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
