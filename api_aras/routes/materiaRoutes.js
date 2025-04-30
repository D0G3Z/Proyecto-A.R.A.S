const express = require('express');
const router = express.Router();
const { getMateriasDocente } = require('../controllers/materiaController');

// Ruta para obtener las materias de un docente específico
router.get('/materias/docente/:id_docente', getMateriasDocente);

module.exports = router;
