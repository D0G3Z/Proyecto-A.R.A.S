const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/calificacionController');

// Obtener todas las calificaciones de una asignación
router.get('/calificaciones', ctrl.getCalificaciones);

// Guardar (insertar/actualizar) múltiples calificaciones en bloque
router.post('/calificaciones/bulk', ctrl.bulkCalificaciones);

module.exports = router;
