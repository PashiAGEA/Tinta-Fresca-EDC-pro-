// Backend/server.js
require('dotenv').config(); // Asegúrate de que esto esté al principio

const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js'); // Importa createClient aquí

const app = express();
const PORT = process.env.PORT || 3001; // Usaré 3001 como en tu frontend

// ====================================================================
// Configuración GLOBAL de Supabase (aquí se inicializan los clientes)
// ====================================================================
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Verifica que las variables de entorno estén cargadas
if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
  console.error("Error: Missing Supabase environment variables. Check your .env file.");
  process.exit(1); // Sale de la aplicación si faltan variables
}

// Cliente Supabase para operaciones regulares (usando anon_key)
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Cliente Supabase para operaciones de administración (usando service_role_key)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});
// ====================================================================

// Importa los módulos de rutas y PASALES los clientes de Supabase
const schoolsRoutes = require('./routes/schools')(supabase); // Pasa el cliente regular
const adminRoutes = require('./routes/admin')(supabaseAdmin, supabase); // Pasa el cliente admin y el regular para auth.getUser
const usersRoutes = require('./routes/users')(supabaseAdmin); // <--- NUEVA LÍNEA: Pasa el cliente admin a users.js

// Middlewares globales
app.use(cors());
app.use(express.json());

// Monta los routers en las rutas base correspondientes
app.use('/api/escuelas', schoolsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', usersRoutes); // <--- NUEVA LÍNEA: Monta las rutas de usuarios

// Ruta de prueba general
app.get('/', (req, res) => {
  res.send('API de Tinta Fresca EDC está funcionando!');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});