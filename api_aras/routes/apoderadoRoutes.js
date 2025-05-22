const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/apoderadoController');

// 1) Perfil del apoderado
router.get('/apoderados/:id',                ctrl.getApoderadoById);
router.get('/apoderados/:id/hijos', ctrl.getHijosPorApoderado);
// 2) Cursos “crudo”
router.get('/apoderados/:id/cursos',         ctrl.getCursosPorApoderado);
// 3) Horarios para un día concreto
router.get('/apoderados/:id/horarios',       ctrl.getHorariosPorApoderado);
// 5) **Resumen (“Mis Cursos” + faltas + promedio bimestre actual)**
router.get('/apoderados/:id/resumen-cursos', ctrl.getResumenCursosPorApoderado);

module.exports = router;
