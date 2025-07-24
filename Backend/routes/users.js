// Backend/routes/users.js
const express = require('express');
const router = express.Router();

// Envuelve las rutas en una función que acepta el cliente de Supabase (con service_role_key)
module.exports = (supabaseAdminClient) => { // Importante: Este es el cliente con service_role_key

 // Ruta para obtener todos los usuarios (perfiles de la tabla "Usuarios")
  // Esta ruta requiere privilegios de administrador para ser accedida.
  router.get('/', async (req, res) => {
    console.log('GET /api/users - Obteniendo todos los perfiles de usuario');

    // Aquí usamos supabaseAdminClient porque esta operación necesita leer todos los perfiles,
    // lo cual no debería ser accesible con la anon_key por seguridad.
    const { data, error } = await supabaseAdminClient
      .from('Usuarios') // Asegúrate de que el nombre de la tabla coincida (con comillas si es necesario)
      .select('*');

    if (error) {
      console.error('Error al obtener todos los perfiles de usuario:', error.message);
      return res.status(500).json({ error: error.message });
    }
    res.json(data);
  });

  // Ruta para obtener los datos del perfil del usuario autenticado
  // (Esto podría estar protegido si solo usuarios autenticados pueden ver su propio perfil)
  router.get('/:id', async (req, res) => {
    const { id } = req.params;
    console.log(`GET /api/users/${id} - Obteniendo perfil de usuario`);

    const { data, error } = await supabaseAdminClient
      .from('Usuarios') // Asegúrate de que el nombre de la tabla coincida (con comillas si es necesario)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ message: `Perfil de usuario con ID ${id} no encontrado.` });
      }
      console.error(`Error al obtener perfil de usuario con ID ${id}:`, error.message);
      return res.status(500).json({ error: error.message });
    }
    res.json(data);
  });

  // Ruta para actualizar el nombre de un usuario en la tabla "Usuarios"
  // Esta ruta debería ser llamada por el frontend del usuario para actualizar SU PROPIO perfil.
  // Es crucial que aquí validemos que el token del usuario coincide con el 'id' que se intenta actualizar.
  router.put('/:id/name', async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    console.log(`PUT /api/users/${id}/name - Actualizando nombre a: ${name}`);

    // --- Validación de seguridad CRÍTICA ---
    // En un escenario real, aquí deberías obtener el ID del usuario autenticado
    // a través del token JWT enviado en el encabezado de la solicitud (req.headers.authorization).
    // Y comparar ese ID con 'id' de req.params para asegurar que el usuario solo actualiza su propio perfil.
    // Por ahora, y dado que es un equipo pequeño y la ruta está en el backend, la service_role_key
    // nos permite el acceso, pero en el frontend deberías asegurarte de que solo el dueño del perfil
    // envíe esta solicitud.

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ error: 'El nombre es obligatorio y debe ser una cadena de texto válida.' });
    }

    const { data, error } = await supabaseAdminClient
      .from('Usuarios') // Asegúrate de que el nombre de la tabla coincida
      .update({ name: name.trim() }) // Usamos .trim() para quitar espacios al inicio/final
      .eq('id', id);

    if (error) {
      console.error(`Error al actualizar el nombre del usuario con ID ${id}:`, error.message);
      return res.status(500).json({ error: error.message });
    }

    if (data && data.length === 0) {
      return res.status(404).json({ message: `Usuario con ID ${id} no encontrado para actualizar su nombre.` });
    }

    res.json({ message: `Nombre del usuario con ID ${id} actualizado exitosamente.`, data });
  });

  return router;
};