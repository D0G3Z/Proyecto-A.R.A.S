const express = require('express');
const router = express.Router();
const {
  guardarAsistencia,
  getAsistenciasPorHorarioFecha
} = require('../controllers/asistenciaController');

// POST para guardar (o actualizar) la asistencia
router.post('/asistencias', guardarAsistencia);

// GET para leer la asistencia existente de un horario y fecha
router.get('/asistencias/horario/:horario_id', getAsistenciasPorHorarioFecha);

module.exports = router;
