import { supabase } from '../config/supabaseClient.js';

// Controlador para obtener todos los repartos
export const getRepartos = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('repartos')
      .select('*')
      .order('id', { ascending: true }); // Ordena por ID para consistencia

    if (error) throw error;

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Controlador para agregar un nuevo reparto
export const addReparto = async (req, res) => {
  const { destino, direccion, horarios, bultos, agregado_por } = req.body;

  // Validación básica de los datos de entrada
  if (!destino || !direccion || !bultos) {
    return res.status(400).json({ error: 'Los campos destino, direccion y bultos son obligatorios.' });
  }

  try {
    const { data, error } = await supabase
      .from('repartos')
      .insert([{ destino, direccion, horarios, bultos, agregado_por }])
      .select() // .select() devuelve el registro insertado
      .single(); // .single() para obtener un objeto en lugar de un array

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Controlador para eliminar todos los repartos
export const clearRepartos = async (req, res) => {
  try {
    const { error } = await supabase
      .from('repartos')
      .delete()
      .neq('id', 0); // Condición para borrar todos los registros (id no es igual a 0)

    if (error) throw error;

    res.status(200).json({ message: 'Todos los repartos han sido eliminados correctamente.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
