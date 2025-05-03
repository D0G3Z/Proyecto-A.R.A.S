const express = require('express');
const router = express.Router();
const { obtenerSeccionesPorGrado } = require('../controllers/seccionesController');

router.get('/secciones/grado/:idGrado', obtenerSeccionesPorGrado);

module.exports = router;
