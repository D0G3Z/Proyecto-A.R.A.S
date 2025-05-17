// routes/docenteRoutes.js
const express = require('express');
const router = express.Router();
const { getDocentePorId, cambiarContrasena } = require('../controllers/docenteController');

router.get('/docentes/:id', getDocentePorId);
router.post('/docentes/cambiar-contrasena', cambiarContrasena);

module.exports = router;
