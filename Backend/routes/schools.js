// Backend/routes/schools.js
const express = require('express');
const router = express.Router();

// Envuelve las rutas en una función que acepta el cliente de Supabase
module.exports = (supabaseClient) => { // <--- RECIBE supabaseClient

  // Ruta para obtener todas las schools
  router.get('/', async (req, res) => {
    console.log('GET /api/schools - Obteniendo todas las schools');
    const { data, error } = await supabaseClient
      .from("schools") // Asegúrate de que el nombre de la tabla coincida con Supabase (case-sensitive)
      .select('*');

    if (error) {
      console.error('Error al obtener schools:', error.message);
      return res.status(500).json({ error: error.message });
    }
    res.json(data);
  });

  // Ruta para obtener una escuela por ID
  router.get('/:id', async (req, res) => {
    const { id } = req.params;
    console.log(`GET /api/schools/${id} - Obteniendo escuela por ID`);
    const { data, error } = await supabaseClient
      .from("schools")
      .select('*')
      .eq('id', id)
      .single(); // Espera un solo resultado

    if (error) {
      if (error.code === 'PGRST116') { // Código de error para "No rows found" en PostgREST
        return res.status(404).json({ message: `escuela con ID ${id} no encontrada.` });
      }
      console.error(`Error al obtener escuela con ID ${id}:`, error.message);
      return res.status(500).json({ error: error.message });
    }
    res.json(data);
  });

  // Ruta para crear una nueva escuela
  router.post('/', async (req, res) => {
    const { name, address, phone, school_email, location, active } = req.body;
    console.log('POST /api/schools - Creando nueva escuela:', req.body.name);

    // Validación básica de campos (puedes expandirla)
    if (!name || !address || !phone || !school_email) {
      return res.status(400).json({ error: 'Faltan campos obligatorios: nombre, dirección, teléfono, email.' });
    }

    const { data, error } = await supabaseClient
      .from("schools")
      .insert([{ name, address, phone, school_email, location, active: active || true }]); // 'active' por defecto a true si no se provee

    if (error) {
      console.error('Error al crear escuela:', error.message);
      return res.status(500).json({ error: error.message });
    }
    res.status(201).json(data);
  });

  // Ruta para actualizar una escuela por ID
  router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, address, phone, school_email, location, active } = req.body;
    console.log(`PUT /api/schools/${id} - Actualizando escuela:`, req.body.name);

    // Validación básica de campos
    if (!name && !address && !phone && !school_email && !location && active === undefined) {
      return res.status(400).json({ error: 'No se proporcionaron campos para actualizar.' });
    }

    // Construir el objeto de actualización solo con los campos presentes en el body
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (address !== undefined) updateData.address = address;
    if (phone !== undefined) updateData.phone = phone;
    if (school_email !== undefined) updateData.school_email = school_email;
    if (location !== undefined) updateData.location = location;
    if (active !== undefined) updateData.active = active;

    const { data, error } = await supabaseClient
      .from("schools")
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error(`Error al actualizar escuela con ID ${id}:`, error.message);
      return res.status(500).json({ error: error.message });
    }

    if (data && data.length === 0) {
      // Supabase .update() devuelve un array vacío si no se encuentra el ID para actualizar.
      return res.status(404).json({ message: `escuela con ID ${id} no encontrada para actualizar.` });
    }

    res.json({ message: `escuela con ID ${id} actualizada exitosamente.`, data });
  });

  // Ruta para eliminar una escuela por ID
  router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    console.log(`DELETE /api/schools/${id} - Eliminando escuela por ID`);
    const { data, error } = await supabaseClient
      .from("schools")
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`Error al eliminar escuela con ID ${id}:`, error.message);
      return res.status(500).json({ error: error.message });
    }

    if (data && data.length === 0) {
      // Supabase .delete() devuelve un array vacío si no se encuentra el ID para eliminar.
      return res.status(404).json({ message: `escuela con ID ${id} no encontrada para eliminar.` });
    }

    res.json({ message: `escuela con ID ${id} eliminada exitosamente.` });
  });

  return router; // <--- DEVUELVE el router
};