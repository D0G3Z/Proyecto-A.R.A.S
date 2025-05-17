const sql    = require('mssql');
const config = require('../config/db');

// Obtener promedio de calificaciones por bimestre con rangos de fechas exactos
async function getPromediosPorBimestre(req, res) {
  const { materia, grado, seccion, bimestre } = req.query;
  if (!materia || !grado || !seccion || !bimestre) {
    return res.status(400).json({ success: false, message: 'Faltan parámetros' });
  }

  const bi = parseInt(bimestre, 10);
  const year = new Date().getFullYear();
  // Definición de rangos de fechas según calendario académico
  const ranges = {
    1: { start: `${year}-03-10`, end: `${year}-05-09` },
    2: { start: `${year}-05-19`, end: `${year}-07-18` },
    3: { start: `${year}-07-28`, end: `${year}-09-26` },
    4: { start: `${year}-10-06`, end: `${year}-12-20` }
  };
  const range = ranges[bi];
  if (!range) {
    return res.status(400).json({ success: false, message: 'Bimestre inválido' });
  }

  console.log(`getPromediosPorBimestre → bimestre ${bi}, rango ${range.start} a ${range.end}`);

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
        AND a.fecha_entrega BETWEEN ${range.start} AND ${range.end}
      GROUP BY m.id_matricula, al.nombres, al.apellido_paterno, al.apellido_materno
      ORDER BY al.apellido_paterno, al.nombres`;

      console.log(`Registros encontrados para bimestre ${bi}:`, result.recordset.length);
      console.log('Detalle recordset:', result.recordset);

    res.json({ success: true, data: result.recordset });
  } catch (err) {
    console.error('Error en getPromediosPorBimestre:', err);
    res.status(500).json({ success: false, message: 'Error al obtener promedios' });
  }
}

module.exports = { getPromediosPorBimestre };
