// Backend/routes/schools.js
const express = require('express');
const { createClient } = require('@supabase/supabase-js'); // Importa createClient

const router = express.Router(); // <--- Crea una instancia de Router

// Configuración de Supabase (igual que en tu server.js, podrías extraer esto a un archivo de configuración si quieres)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey); // Usa la anon key para operaciones normales

// Ruta para obtener todas las escuelas
router.get('/', async (req, res) => { // La ruta es '/' porque se montará en '/api/escuelas'
  const { data, error } = await supabase
    .from('Escuelas') // Asegúrate de usar "Escuelas"
    .select('*');

  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.json(data);
});

// Ruta para crear una nueva escuela
router.post('/', async (req, res) => {
  const { name, address, phone, school_email, location, active } = req.body;
  const { data, error } = await supabase
    .from('Escuelas')
    .insert([{ name, address, phone, school_email, location, active }]);

  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.status(201).json(data);
});


// ===========================================
// RUTAS PARA ESCUELAS
// ===========================================

// Ruta de prueba: GET /api/saludo-db - Verifica la conexión general a la base de datos
app.get('/api/saludo-db', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.json({ message: 'Conexión a la base de datos exitosa!', dbTime: result.rows[0].now });
    } catch (err) {
        console.error('Error al conectar a la base de datos:', err);
        res.status(500).json({ error: 'Error al conectar a la base de datos.', details: err.message });
    }
});

// 1. GET /api/escuelas - Obtener todas las escuelas
app.get('/api/escuelas', async (req, res) => {
    console.log('¡Solicitud GET recibida en /api/escuelas!');
    try {
        const result = await pool.query('SELECT * FROM "Escuelas"'); // Usando "Escuelas" con E mayúscula y comillas
        res.json(result.rows);
    } catch (err) {
        console.error('Error al obtener escuelas:', err);
        res.status(500).json({ error: 'Error interno del servidor al obtener escuelas.', details: err.message });
    }
});

// 2. GET /api/escuelas/:id - Obtener una escuela por su ID
app.get('/api/escuelas/:id', async (req, res) => {
    const { id } = req.params; // Captura el ID de la URL
    console.log(`¡Solicitud GET recibida para /api/escuelas/${id}!`);
    try {
        const result = await pool.query('SELECT * FROM "Escuelas" WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Escuela no encontrada.' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(`Error al obtener escuela con ID ${id}:`, err);
        res.status(500).json({ error: 'Error interno del servidor al obtener escuela.', details: err.message });
    }
});

// 3. POST /api/escuelas - Crear una nueva escuela
app.post('/api/escuelas', async (req, res) => {
    // Asegúrate de que los nombres de las columnas en req.body (ej. name, address)
    // coincidan con los nombres de las columnas *exactas* en tu DB de Supabase.
    // También verifica si discharge_date y last_update se generan automáticamente en tu DB.
    // Si no se generan, deberías incluirlos en el INSERT.
    const { name, address, phone, school_email, location, active } = req.body;
    console.log('¡Solicitud POST recibida en /api/escuelas con datos:', req.body);
    try {
        const result = await pool.query(
            'INSERT INTO "Escuelas" (name, address, phone, school_email, location, active) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [name, address, phone, school_email, location, active]
        );
        res.status(201).json(result.rows[0]); // 201 Created (para indicar que un recurso fue creado)
    } catch (err) {
        console.error('Error al crear escuela:', err);
        res.status(500).json({ error: 'Error interno del servidor al crear escuela.', details: err.message });
    }
});

// 4. PUT /api/escuelas/:id - Actualizar una escuela existente
app.put('/api/escuelas/:id', async (req, res) => {
    const { id } = req.params;
    // Asegúrate de que los nombres de las columnas en req.body coincidan con tu DB.
    const { name, address, phone, school_email, location, active } = req.body;
    console.log(`¡Solicitud PUT recibida para /api/escuelas/${id} con datos:`, req.body);
    try {
        // Incluimos last_update = CURRENT_TIMESTAMP para que se actualice automáticamente
        const result = await pool.query(
            'UPDATE "Escuelas" SET name = $1, address = $2, phone = $3, school_email = $4, location = $5, active = $6, last_update = CURRENT_TIMESTAMP WHERE id = $7 RETURNING *',
            [name, address, phone, school_email, location, active, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Escuela no encontrada para actualizar.' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(`Error al actualizar escuela con ID ${id}:`, err);
        res.status(500).json({ error: 'Error interno del servidor al actualizar escuela.', details: err.message });
    }
});

// 5. DELETE /api/escuelas/:id - Eliminar una escuela
app.delete('/api/escuelas/:id', async (req, res) => {
    const { id } = req.params;
    console.log(`¡Solicitud DELETE recibida para /api/escuelas/${id}!`);
    try {
        const result = await pool.query('DELETE FROM "Escuelas" WHERE id = $1 RETURNING id', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Escuela no encontrada para eliminar.' });
        }
        res.status(204).send(); // 204 No Content (indica éxito sin devolver contenido)
    } catch (err) {
        console.error(`Error al eliminar escuela con ID ${id}:`, err);
        res.status(500).json({ error: 'Error interno del servidor al eliminar escuela.', details: err.message });
    }
});


module.exports = router; // <--- Exporta el router