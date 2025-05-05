const sql    = require('mssql');
const config = require('../config/db');

async function guardarAsistencia(req, res) {
  const { horario_id, fecha, registros } = req.body;

  try {
    await sql.connect(config);

    // 1) Obtener grado y sección del horario
    const horRes = await sql.query`
      SELECT id_grado, id_seccion
      FROM horario_clase
      WHERE id_horario = ${horario_id}
    `;
    if (!horRes.recordset.length) {
      return res
        .status(400)
        .json({ success: false, message: `Horario ${horario_id} no encontrado` });
    }
    const { id_grado, id_seccion } = horRes.recordset[0];

    // 2) Procesar cada registro de asistencia
    for (const rec of registros) {
      const { id_alumno, falta, tardanza, presente } = rec;

      // 2a) Buscar la matrícula
      const matRes = await sql.query`
        SELECT TOP 1 id_matricula
        FROM matricula
        WHERE id_alumno      = ${id_alumno}
          AND id_grado       = ${id_grado}
          AND id_seccion     = ${id_seccion}
          AND anio_academico = YEAR(${fecha})
      `;
      if (!matRes.recordset.length) {
        console.warn(`Sin matrícula para alumno ${id_alumno}, se omite.`);
        continue; // simplemente saltar este alumno
      }
      const id_matricula = matRes.recordset[0].id_matricula;

      // 2b) Determinar estado ('P','T' o 'F')
      const estado = presente  ? 'P'
                   : tardanza ? 'T'
                   :            'F';

      // 2c) ¿Ya hay un registro para esta fecha?
      const existe = await sql.query`
        SELECT TOP 1 id_asistencia
        FROM asistencia_alumno
        WHERE id_matricula = ${id_matricula}
          AND fecha        = ${fecha}
      `;
      if (existe.recordset.length) {
        // 2d) Actualizar
        await sql.query`
          UPDATE asistencia_alumno
          SET estado = ${estado}
          WHERE id_asistencia = ${existe.recordset[0].id_asistencia}
        `;
      } else {
        // 2e) Insertar nuevo (bimestre fijo = 1; adáptalo si lo necesitas)
        await sql.query`
          INSERT INTO asistencia_alumno (id_matricula, fecha, estado)
          VALUES (${id_matricula}, ${fecha}, ${estado})
        `;
      }
    }

    return res.json({
      success: true,
      message: 'Asistencias guardadas correctamente'
    });
  } catch (err) {
    console.error('Error en guardarAsistencia:', err);
    return res
      .status(500)
      .json({ success: false, message: 'Error interno al guardar asistencias' });
  }
}

// GET /api/asistencias/horario/:id_horario?fecha=YYYY-MM-DD
async function getAsistenciasPorHorarioFecha(req, res) {
  const horario_id = parseInt(req.params.horario_id, 10);
  const fecha      = req.query.fecha;  // esperas YYYY-MM-DD

  if (!horario_id || !fecha) {
    return res.status(400).json({
      success: false,
      message: 'Falta horario_id o fecha en la consulta'
    });
  }

  try {
    await sql.connect(config);
    const result = await sql.query`
      SELECT
        a.id_asistencia,
        mat.id_alumno,
        al.nombres,
        al.apellido_paterno,
        al.apellido_materno,
        a.estado
      FROM asistencia_alumno a
      JOIN matricula mat
        ON a.id_matricula = mat.id_matricula
      JOIN alumno al
        ON mat.id_alumno = al.id_alumno
      WHERE a.id_horario = ${horario_id}
        AND a.fecha      = CONVERT(date, ${fecha})
    `;
    res.json({
      success: true,
      asistencias: result.recordset
    });
  } catch (err) {
    console.error('Error en getAsistenciasPorHorarioFecha:', err);
    res.status(500).json({
      success: false,
      message: 'Error al obtener asistencias'
    });
  }
}

module.exports = {
  getAsistenciasPorHorarioFecha,
  guardarAsistencia
};
