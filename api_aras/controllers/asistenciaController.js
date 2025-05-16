// api_aras/controllers/asistenciaController.js
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
        continue; // saltar este alumno si no encuentra matrícula
      }
      const id_matricula = matRes.recordset[0].id_matricula;

      // 2b) Determinar estado ('P','T' o 'F')
      const estado = presente  ? 'P'
                   : tardanza ? 'T'
                   :            'F';

      // 2c) ¿Ya hay un registro para esta fecha y horario?
      const existe = await sql.query`
        SELECT TOP 1 id_asistencia
        FROM asistencia_alumno
        WHERE id_matricula = ${id_matricula}
          AND id_horario   = ${horario_id}
          AND fecha        = CONVERT(date, ${fecha})
      `;
      if (existe.recordset.length) {
        // 2d) Actualizar
        await sql.query`
          UPDATE asistencia_alumno
          SET estado = ${estado}
          WHERE id_asistencia = ${existe.recordset[0].id_asistencia}
        `;
      } else {
        // 2e) Insertar nuevo (sin bimestre, o usa uno fijo si lo necesitas)
        await sql.query`
          INSERT INTO asistencia_alumno (id_matricula, id_horario, fecha, estado)
          VALUES (${id_matricula}, ${horario_id}, CONVERT(date, ${fecha}), ${estado})
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

// GET /api/asistencias/horario/:horario_id?fecha=YYYY-MM-DD
async function getAsistenciasPorHorarioFecha(req, res) {
  const horario_id = parseInt(req.params.horario_id, 10);
  const fecha      = req.query.fecha;  // formato YYYY-MM-DD
  console.log('horario_id:', horario_id, 'fecha:', fecha);
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
        mat.id_alumno,
        al.nombres,
        al.apellido_paterno,
        al.apellido_materno,
        COALESCE(a.estado, 'F') AS estado
      FROM horario_clase h
      -- emparejamos solo esa sesión
      JOIN matricula mat
        ON mat.id_grado   = h.id_grado
       AND mat.id_seccion = h.id_seccion
      JOIN alumno al
        ON mat.id_alumno  = al.id_alumno
      LEFT JOIN asistencia_alumno a
        ON a.id_matricula = mat.id_matricula
       AND a.id_horario   = h.id_horario
       AND a.fecha        = CONVERT(date, ${fecha})
      WHERE h.id_horario = ${horario_id}
        AND al.estado     = 'Activo'
      ORDER BY al.apellido_paterno, al.nombres
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
  guardarAsistencia,
  getAsistenciasPorHorarioFecha
};
