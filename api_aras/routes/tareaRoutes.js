// routes/tareaRoutes.js
const express = require('express');
const {
  getTareasPorFiltro,
  crearTarea,
  eliminarTarea
} = require('../controllers/tareaController');
const router  = express.Router();

// Listar tareas para un curso (materia+grado+sección)
router.get('/tareas', getTareasPorFiltro);

// Crear nueva tarea
router.post('/tareas', crearTarea);

// Eliminar tarea
router.delete('/tareas/:id', eliminarTarea);

module.exports = router;
