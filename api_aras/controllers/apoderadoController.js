// controllers/apoderadoController.js
const sql    = require('mssql');
const config = require('../config/db');

// 1) Perfil del apoderado
async function getApoderadoById(req, res) {
  const idApo = parseInt(req.params.id, 10);
  if (!idApo) {
    return res.status(400).json({ success: false, message: 'Falta id_apoderado' });
  }
  try {
    await sql.connect(config);
    const result = await sql.query`
      SELECT 
        id_apoderado, dni, nombres, apellido_paterno, apellido_materno,
        direccion, telefono, correo, tipo_parentesco
      FROM apoderado
      WHERE id_apoderado = ${idApo}
    `;
    if (!result.recordset.length) {
      return res.status(404).json({ success: false, message: 'Apoderado no encontrado' });
    }
    res.json({ success: true, apoderado: result.recordset[0] });
  } catch (err) {
    console.error('Error en getApoderadoById:', err);
    res.status(500).json({ success: false, message: 'Error al obtener apoderado' });
  }
}

// 2) Lista de hijos
async function getHijosPorApoderado(req, res) {
  const idApo = parseInt(req.params.id, 10);
  if (!idApo) {
    return res.status(400).json({ success: false, message: 'Falta id_apoderado' });
  }
  try {
    await sql.connect(config);
    const result = await sql.query`
      SELECT 
        a.id_alumno,
        a.nombres + ' ' + a.apellido_paterno + ' ' + a.apellido_materno AS nombre
      FROM alumno_apoderado aa
      JOIN alumno a ON aa.id_alumno = a.id_alumno
      WHERE aa.id_apoderado = ${idApo}
        AND aa.es_principal = 1
    `;
    res.json({ success: true, hijos: result.recordset });
  } catch (err) {
    console.error('Error en getHijosPorApoderado:', err);
    res.status(500).json({ success: false, message: 'Error al obtener hijos' });
  }
}

// 3) Cursos asignados al apoderado
async function getCursosPorApoderado(req, res) {
  const idApo = parseInt(req.params.id, 10);
  if (!idApo) {
    return res.status(400).json({ success: false, message: 'Falta id_apoderado' });
  }
  try {
    await sql.connect(config);
    const result = await sql.query`
      SELECT
        h.id_horario,
        m.id_materia,
        m.nombre      AS curso,
        g.nombre      AS grado,
        s.letra       AS seccion,
        h.dia_semana  AS dia,
        CONVERT(varchar(5), h.hora_inicio,108) AS hora_inicio,
        CONVERT(varchar(5), h.hora_fin,   108) AS hora_fin
      FROM alumno_apoderado aa
      JOIN matricula mat ON aa.id_alumno = mat.id_alumno
      JOIN horario_clase h ON mat.id_grado = h.id_grado AND mat.id_seccion = h.id_seccion
      JOIN materia m ON h.id_materia = m.id_materia
      JOIN grado g   ON mat.id_grado  = g.id_grado
      JOIN seccion s ON mat.id_seccion= s.id_seccion
      WHERE aa.id_apoderado = ${idApo} AND aa.es_principal = 1
      ORDER BY g.nombre, m.nombre, h.dia_semana, h.hora_inicio
    `;
    res.json({ success: true, cursos: result.recordset });
  } catch (err) {
    console.error('Error en getCursosPorApoderado:', err);
    res.status(500).json({ success: false, message: 'Error al obtener cursos' });
  }
}

// 4) Horarios filtrados por fecha (query param ?dia=YYYY-MM-DD&alumno=)
async function getHorariosPorApoderado(req, res) {
  const idApo  = parseInt(req.params.id, 10);
  const diaStr = req.query.dia;            // p.e. "2025-05-22"
  if (!idApo || !diaStr) {
    return res.status(400).json({ success: false, message: 'Falta id_apoderado o dia' });
  }
  try {
    await sql.connect(config);
    const result = await sql.query`
      DECLARE @fecha date = ${diaStr};
      SELECT
        CONVERT(varchar(5), h.hora_inicio, 108) AS hora_inicio,
        CONVERT(varchar(5), h.hora_fin,    108) AS hora_fin,
        m.nombre                             AS curso
      FROM alumno_apoderado aa
      JOIN matricula mat
        ON aa.id_alumno   = mat.id_alumno
      JOIN horario_clase h
        ON mat.id_grado   = h.id_grado
       AND mat.id_seccion = h.id_seccion
      JOIN materia m
        ON h.id_materia = m.id_materia
      WHERE aa.id_apoderado = ${idApo}
        AND aa.es_principal  = 1
        -- Esto devolverá "Lunes", "Martes", etc. en español
        AND h.dia_semana = FORMAT(@fecha,'dddd','es-ES')
      ORDER BY h.hora_inicio;
    `;
    res.json({ success: true, horarios: result.recordset });
  } catch (err) {
    console.error('Error en getHorariosPorApoderado:', err);
    res.status(500).json({ success: false, message: 'Error al obtener horarios' });
  }
}

// 5) Resumen “Mis Cursos” + faltas + promedio en el bimestre actual
async function getResumenCursosPorApoderado(req, res) {
  const idApo    = parseInt(req.params.id, 10);
  const idAlumno = parseInt(req.query.alumno, 10);
  if (!idApo || !idAlumno) {
    return res.status(400).json({ success: false, message: 'Faltan parámetros' });
  }

  const hoy = new Date();
  const anio = hoy.getFullYear();
  const mm = hoy.getMonth()+1, dd = hoy.getDate();
  let ini, fin;
  if ((mm === 3 && dd >= 10) || mm === 4 || (mm === 5 && dd <= 9)) {
    ini = `${anio}-03-10`; fin = `${anio}-05-09`;
  } else if ((mm === 5 && dd >= 19) || mm === 6 || (mm === 7 && dd <= 18)) {
    ini = `${anio}-05-19`; fin = `${anio}-07-18`;
  } else if ((mm === 7 && dd >= 28) || mm === 8 || (mm === 9 && dd <= 26)) {
    ini = `${anio}-07-28`; fin = `${anio}-09-26`;
  } else {
    ini = `${anio}-10-06`; fin = `${anio}-12-20`;
  }

  try {
    await sql.connect(config);
    const result = await sql.query`
      DECLARE @ini date = ${ini}, @fin date = ${fin};
      -- Traer todos los cursos del alumno según su horario semanal
      WITH Cursos AS (
        SELECT DISTINCT h.id_materia, m.nombre
        FROM alumno_apoderado aa
        JOIN matricula mat ON aa.id_alumno = mat.id_alumno AND mat.id_alumno = ${idAlumno}
        JOIN horario_clase h ON mat.id_grado = h.id_grado AND mat.id_seccion = h.id_seccion
        JOIN materia m ON h.id_materia = m.id_materia
        WHERE aa.id_apoderado = ${idApo} AND aa.es_principal = 1
      )
      SELECT
        c.nombre AS curso,
        ISNULL(SUM(CASE WHEN aa.estado = 'A' THEN 1 END), 0)    AS faltas,
        ISNULL(ROUND(AVG(ca.nota),2), 0)                       AS promedio
      FROM Cursos c
      LEFT JOIN matricula mat ON 1=1 AND mat.id_alumno = ${idAlumno}
      LEFT JOIN alumno_apoderado aa2 ON aa2.id_alumno = mat.id_alumno AND aa2.id_apoderado = ${idApo}
      LEFT JOIN asistencia_alumno aa ON aa.id_matricula = mat.id_matricula
      LEFT JOIN horario_clase hc ON hc.id_horario = aa.id_horario AND hc.id_materia = c.id_materia
      LEFT JOIN asignacion asg ON asg.id_materia = c.id_materia AND asg.id_seccion = mat.id_seccion
         AND asg.id_grado = mat.id_grado AND asg.fecha_entrega BETWEEN @ini AND @fin
      LEFT JOIN calificacion ca ON ca.id_asignacion = asg.id_asignacion AND ca.id_matricula = mat.id_matricula
      GROUP BY c.nombre
      ORDER BY c.nombre
    `;
    res.json({ success: true, data: result.recordset });
  } catch (err) {
    console.error('Error en getResumenCursosPorApoderado:', err);
    res.status(500).json({ success: false, message: 'Error al obtener resumen de cursos' });
  }
}

// 6) Horario semanal completo (Lun–Vie) para un alumno
async function getHorariosSemanalPorApoderado(req, res) {
  const idApo    = parseInt(req.params.id, 10);
  const idAlumno = parseInt(req.query.alumno, 10);
  if (!idApo || !idAlumno) {
    return res.status(400).json({ success: false, message: 'Faltan parámetros id_apoderado o alumno' });
  }

  try {
    await sql.connect(config);
    const result = await sql.query`
      SELECT
        h.dia_semana                          AS dia_semana,
        CONVERT(varchar(5), h.hora_inicio,108) AS hora_inicio,
        CONVERT(varchar(5), h.hora_fin,   108) AS hora_fin,
        m.nombre                              AS curso
      FROM alumno_apoderado aa
      JOIN matricula mat
        ON aa.id_alumno   = mat.id_alumno
      JOIN horario_clase h
        ON mat.id_grado   = h.id_grado
       AND mat.id_seccion = h.id_seccion
      JOIN materia m
        ON h.id_materia = m.id_materia
      WHERE aa.id_apoderado  = ${idApo}
        AND aa.es_principal   = 1
        AND mat.id_alumno     = ${idAlumno}
      ORDER BY
        CASE h.dia_semana
          WHEN 'Lunes'     THEN 1
          WHEN 'Martes'    THEN 2
          WHEN 'Miércoles' THEN 3
          WHEN 'Jueves'    THEN 4
          WHEN 'Viernes'   THEN 5
          ELSE 6
        END,
        h.hora_inicio
    `;
    res.json({ success: true, horarios: result.recordset });
  } catch (err) {
    console.error('Error en getHorariosSemanalPorApoderado:', err);
    res.status(500).json({ success: false, message: 'Error al obtener horario semanal' });
  }
}
/**
 * 6) Tareas + notas de un curso para un alumno dado
 *    /api/apoderados/:id/tareas?alumno=...&materia=...
 */
async function getTareasPorCursoAlumno(req, res) {
  const idApo   = parseInt(req.params.id, 10);
  const idAlu   = parseInt(req.query.alumno, 10);
  const idMat   = parseInt(req.query.materia, 10);
  if (!idApo || !idAlu || !idMat) {
    return res.status(400).json({ success:false, message:'Faltan parámetros' });
  }
  try {
    await sql.connect(config);
    // obtenemos id_matricula
    const matRes = await sql.query`
      SELECT TOP(1) id_matricula
      FROM matricula
      WHERE id_alumno = ${idAlu}
    `;
    const idMatri = matRes.recordset[0]?.id_matricula;
    if (!idMatri) return res.json({ success:true, tareas:[] });

    const result = await sql.query`
      SELECT
        a.id_asignacion,
        a.descripcion AS tarea,
        FORMAT(a.fecha_entrega,'yyyy-MM-dd') AS fecha_entrega,
        ISNULL(c.nota, NULL) AS nota
      FROM asignacion a
      LEFT JOIN calificacion c
        ON c.id_asignacion = a.id_asignacion
       AND c.id_matricula = ${idMatri}
      WHERE a.id_materia = ${idMat}
        AND a.id_grado   = (SELECT id_grado   FROM matricula WHERE id_matricula=${idMatri})
        AND a.id_seccion = (SELECT id_seccion FROM matricula WHERE id_matricula=${idMatri})
      ORDER BY a.fecha_entrega DESC
    `;
    res.json({ success:true, tareas: result.recordset });
  } catch(err) {
    console.error('Error en getTareasPorCursoAlumno:', err);
    res.status(500).json({ success:false, message:'Error al obtener tareas' });
  }
}

/**
 * 7) Asistencias de un curso para un alumno dado
 *    /api/apoderados/:id/asistencias?alumno=...&materia=...
 */
async function getAsistenciasPorCursoAlumno(req, res) {
  const idApo   = parseInt(req.params.id, 10);
  const idAlu   = parseInt(req.query.alumno, 10);
  const idMat   = parseInt(req.query.materia, 10);
  if (!idApo || !idAlu || !idMat) {
    return res.status(400).json({ success:false, message:'Faltan parámetros' });
  }
  try {
    await sql.connect(config);
    // obtenemos id_matricula
    const matRes = await sql.query`
      SELECT TOP(1) id_matricula
      FROM matricula
      WHERE id_alumno = ${idAlu}
    `;
    const idMatri = matRes.recordset[0]?.id_matricula;
    if (!idMatri) return res.json({ success:true, asistencias:[] });

    const result = await sql.query`
      SELECT
        FORMAT(aa.fecha,'yyyy-MM-dd') AS fecha,
        aa.estado -- 'P' = presente, 'A' = ausente
      FROM asistencia_alumno aa
      JOIN horario_clase hc
        ON aa.id_horario = hc.id_horario
       AND hc.id_materia = ${idMat}
      WHERE aa.id_matricula = ${idMatri}
      ORDER BY aa.fecha DESC
    `;
    res.json({ success:true, asistencias: result.recordset });
  } catch(err) {
    console.error('Error en getAsistenciasPorCursoAlumno:', err);
    res.status(500).json({ success:false, message:'Error al obtener asistencias' });
  }
}


module.exports = {
  getApoderadoById,
  getHijosPorApoderado,
  getCursosPorApoderado,
  getHorariosPorApoderado,
  getResumenCursosPorApoderado,
  getHorariosSemanalPorApoderado,
  getTareasPorCursoAlumno,
  getAsistenciasPorCursoAlumno
};
