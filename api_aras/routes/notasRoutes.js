const express = require('express');
const router  = express.Router();
const { getPromediosPorBimestre } = require('../controllers/notasController');

router.get('/notas/bimestre', getPromediosPorBimestre);
module.exports = router;
