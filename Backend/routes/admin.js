// Backend/routes/admin.js
const express = require('express');
const router = express.Router();

// Envuelve las rutas en una función que acepta los clientes de Supabase
// Recibe supabaseAdmin (para operaciones admin) y supabase (para auth.getUser)
module.exports = (supabaseAdminClient, supabaseAuthClient) => { // <--- RECIBE LOS CLIENTES

  // Middleware para verificar la autenticación del administrador
  async function authenticateAdmin(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'No token provided' });
    }
    const token = authHeader.split(' ')[1];
    try {
      // Usa el supabaseAuthClient (cliente normal) para verificar el token del usuario
      const { data: { user }, error } = await supabaseAuthClient.auth.getUser(token);
      if (error || !user) {
        console.error("Authentication error:", error ? error.message : "User not found");
        return res.status(401).json({ message: 'Invalid or expired token' });
      }
      req.user = user;
      // Aquí, en una app real, verificarías el rol del usuario (ej. user.app_metadata.role === 'admin')
      next();
    } catch (err) {
      console.error("Error during token verification:", err.message);
      return res.status(401).json({ message: 'Authentication failed' });
    }
  }

  // Ruta para listar todos los users
  router.get('/users', authenticateAdmin, async (req, res) => {
    try {
      // Usa supabaseAdminClient para las operaciones de admin
      const { data: { users }, error } = await supabaseAdminClient.auth.admin.listUsers();
      if (error) {
        console.error("Error listing users:", error.message);
        return res.status(500).json({ error: error.message });
      }
      res.json(users);
    } catch (err) {
      console.error("Server error listing users:", err.message);
      res.status(500).json({ error: 'Failed to retrieve users' });
    }
  });

  // Ruta para eliminar un usuario por ID
  router.delete('/users/:id', authenticateAdmin, async (req, res) => {
    const { id } = req.params;
    try {
      // Usa supabaseAdminClient para las operaciones de admin
      const { error } = await supabaseAdminClient.auth.admin.deleteUser(id);
      if (error) {
        console.error(`Error deleting user ${id}:`, error.message);
        return res.status(500).json({ error: error.message });
      }
      res.json({ message: `User ${id} deleted successfully` });
    } catch (err) {
      console.error("Server error deleting user:", err.message);
      res.status(500).json({ error: 'Failed to delete user' });
    }
  });

  return router; // <--- DEVUELVE el router
};