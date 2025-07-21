// src/controllers/repartoController.js
// --- ARCHIVO MODIFICADO PARA ROL DE ADMIN ---

import { supabase, supabaseAdmin } from '../config/supabaseClient.js';
import dotenv from 'dotenv';

dotenv.config();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

// --- NUEVO: Función para determinar si un usuario es administrador ---
const isAdmin = (user) => {
  return user && user.email === ADMIN_EMAIL;
};

// Controlador para obtener repartos
export const getRepartos = async (req, res) => {
  try {
    let query;
    // Si el usuario es admin, usa el cliente de admin para obtener TODOS los repartos
    if (isAdmin(req.user)) {
      console.log('Usuario admin detectado. Obteniendo todos los repartos.');
      query = supabaseAdmin
        .from('repartos')
        .select('*')
        .order('id', { ascending: true });
    } else {
      // Si es un usuario normal, usa el cliente estándar y filtra por su ID
      console.log('Usuario normal detectado. Obteniendo sus repartos.');
      query = supabase
        .from('repartos')
        .select('*')
        .eq('user_id', req.user.id)
        .order('id', { ascending: true });
    }

    const { data, error } = await query;
    if (error) throw error;

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Controlador para agregar un nuevo reparto (sin cambios, ya que siempre se asocia al usuario que lo crea)
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
    let query = supabase
      .from('repartos')
      .update({ destino, direccion, horarios, bultos })
      .eq('id', id);

    // El admin puede editar cualquier reparto, el usuario normal solo los suyos.
    if (!isAdmin(req.user)) {
      query = query.eq('user_id', req.user.id);
    }
    
    const { data, error } = await query.select().single();

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
    let query = supabase
      .from('repartos')
      .delete()
      .eq('id', id);

    // El admin puede eliminar cualquier reparto, el usuario normal solo los suyos.
    if (!isAdmin(req.user)) {
      query = query.eq('user_id', req.user.id);
    }

    const { error, count } = await query;

    if (error) throw error;
    if (count === 0 && !isAdmin(req.user)) {
        // Este caso puede darse si un usuario intenta borrar un reparto que no le pertenece.
        return res.status(404).json({ error: 'Reparto no encontrado o no tienes permiso para eliminarlo.' });
    }


    res.status(200).json({ message: 'Reparto eliminado correctamente.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Controlador para eliminar todos los repartos
export const clearRepartos = async (req, res) => {
  try {
    let query;
    
    // El admin borra TODOS los repartos de la tabla. El usuario normal solo los suyos.
    if (isAdmin(req.user)) {
      query = supabaseAdmin.from('repartos').delete().neq('id', 0); // .neq es una forma de decir "donde id no sea 0", para borrar todo
    } else {
      query = supabase.from('repartos').delete().eq('user_id', req.user.id);
    }

    const { error } = await query;

    if (error) throw error;

    res.status(200).json({ message: 'Repartos eliminados correctamente.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
