const express = require('express');
const router = express.Router();
const { totalDocentes, totalAlumnos, listarHorarios } = require('../controllers/directorController');

// Definición de rutas
router.get('/director/docentes/total', totalDocentes);
router.get('/director/alumnos/total', totalAlumnos);
router.get('/director/horarios', listarHorarios);

module.exports = router;
