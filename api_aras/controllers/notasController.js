const sql    = require('mssql');
const config = require('../config/db');

async function getPromediosPorBimestre(req, res) {
  const { materia, grado, seccion, bimestre } = req.query;
  if (!materia || !grado || !seccion || !bimestre) {
    return res.status(400).json({ success: false, message: 'Faltan parámetros' });
  }
  const bi = parseInt(bimestre, 10);
  let startMonth, endMonth;
  if (bi < 4) {
    startMonth = bi * 2 + 1;
    endMonth   = bi * 2 + 2;
  } else {
    startMonth = 9;
    endMonth   = 12;
  }

  try {
    await sql.connect(config);
    const result = await sql.query`
      SELECT
        m.id_matricula,
        (al.nombres + ' ' + al.apellido_paterno + ' ' + al.apellido_materno) AS nombre_completo,
        AVG(c.nota) AS promedio
      FROM calificacion c
      JOIN asignacion a ON c.id_asignacion = a.id_asignacion
      JOIN matricula m   ON c.id_matricula = m.id_matricula
      JOIN alumno al     ON m.id_alumno   = al.id_alumno
      WHERE a.id_materia = ${materia}
        AND m.id_grado    = ${grado}
        AND m.id_seccion  = ${seccion}
        AND MONTH(a.fecha_entrega) BETWEEN ${startMonth} AND ${endMonth}
      GROUP BY m.id_matricula, al.nombres, al.apellido_paterno, al.apellido_materno
      ORDER BY al.apellido_paterno, al.nombres`;
    res.json({ success: true, data: result.recordset });
  } catch (err) {
    console.error('Error en getPromediosPorBimestre:', err);
    res.status(500).json({ success: false, message: 'Error al obtener promedios' });
  }
}

module.exports = { getPromediosPorBimestre };