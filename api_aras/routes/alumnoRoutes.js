const express = require('express');
const router  = express.Router();
const { getAlumnosPorMateria } = require('../controllers/alumnoController');

// Pasa los tres parámetros por query: ?materia=18&grado=1&seccion=A
router.get('/alumnos/por-materia', getAlumnosPorMateria);

module.exports = router;
