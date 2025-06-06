const express = require('express');
const router = express.Router();
const {
    getHorarios,
    crearHorario,
    eliminarHorario,
    getDocentes,
    getMaterias,
    getGrados,
    getSecciones,
    getDocentesPorNivel,
    getMateriasPorDocente,
    obtenerHorariosPorFiltro,
    getGradosPorNivel,
    getListDocentes,
    getListAlumnos,
    getHorariosDocente
} = require('../controllers/horarioController');


router.get('/horarios', getHorarios);
router.get('/horarios/:nivel/:grado/:seccion', obtenerHorariosPorFiltro);
router.post('/horarios', crearHorario);
router.delete('/horarios/:id', eliminarHorario);

router.get('/docentes', getDocentes);
router.get('/materias', getMaterias);
router.get('/grados', getGrados);
router.get('/secciones', getSecciones);
router.get('/grados/nivel/:id_nivel', getGradosPorNivel);
router.get('/docentes/nivel/:id_nivel', getDocentesPorNivel);
router.get('/docente/:id/materias', getMateriasPorDocente);

router.get('/docentes/lista', getListDocentes)
router.get('/alumnos/lista', getListAlumnos)

// Obtener horarios de un docente específico
router.get('/horarios/docente/:id_docente', getHorariosDocente);


module.exports = router;
