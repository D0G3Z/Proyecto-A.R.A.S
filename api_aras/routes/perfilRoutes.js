const express = require('express');
const router = express.Router();
const { obtenerPerfil, actualizarContrasena } = require('../controllers/perfilController');

// Rutas
router.get('/perfil/:usuario', obtenerPerfil);
router.post('/actualizar-contrasena', actualizarContrasena);

module.exports = router;
