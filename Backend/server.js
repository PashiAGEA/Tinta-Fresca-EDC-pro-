require('dotenv').config(); // Carga las variables de entorno del archivo .env
const express = require('express');
const { Pool } = require('pg'); // Importa el Pool de pg
// Si vas a usar CORS, descomenta la siguiente línea e instálalo: npm install cors
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3001; // Puerto para el servidor backend

// Middlewares
app.use(express.json()); // Habilita el parsing de JSON en las solicitudes (para POST, PUT)
// Si vas a usar CORS, descomenta esta línea:
app.use(cors()); // Permite solicitudes desde dominios diferentes (ej. tu frontend React)

// Configuración del pool de conexiones a la base de datos
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // Necesario para Supabase en algunos entornos de desarrollo
    }
});

// Manejo de errores de conexión inicial del pool
pool.on('error', (err, client) => {
    console.error('Error inesperado en cliente inactivo del pool de DB', err);
    // En producción, podrías querer un manejo de errores más sofisticado que salir del proceso
    process.exit(-1);
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


// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor backend escuchando en http://localhost:${port}`);
});