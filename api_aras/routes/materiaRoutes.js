const express = require('express');
const router = express.Router();
const { getMateriasDocente } = require('../controllers/materiaController');

// Obtener las materias del docente
router.get('/materias/docente/:id_docente', getMateriasDocente);

module.exports = router;
