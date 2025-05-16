// routes/asignacionRoutes.js
const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/asignacionController');

// CRUD completo para asignaciones
router.get    ('/asignaciones',         ctrl.getAsignaciones);
router.get    ('/asignaciones/:id',     ctrl.getAsignacion);
router.post   ('/asignaciones',         ctrl.createAsignacion);
router.put    ('/asignaciones/:id',     ctrl.updateAsignacion);
router.delete ('/asignaciones/:id',     ctrl.deleteAsignacion);

module.exports = router;
