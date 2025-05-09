const sql = require('mssql');
const config = require('../config/db');

async function getAlumnosPorMateria(req, res) {
  // los leemos de req.query en lugar de req.params
  const id_materia = parseInt(req.query.materia, 10);
  const id_grado   = parseInt(req.query.grado,   10);
  const seccion    = req.query.seccion; // es texto

  console.log('getAlumnosPorMateria →', { id_materia, id_grado, seccion });

  if (!id_materia || !id_grado || !seccion) {
    return res.status(400).json({
      success: false,
      message: 'Faltan materia, grado o sección en la consulta'
    });
  }

  try {
    await sql.connect(config);
    const result = await sql.query`
      SELECT
        al.id_alumno,
        al.nombres,
        al.apellido_paterno,
        al.apellido_materno
      FROM matricula mat
      JOIN alumno al
        ON mat.id_alumno = al.id_alumno
      WHERE mat.id_grado   = ${id_grado}
        AND mat.id_seccion = ${seccion}
        AND EXISTS (
          SELECT 1
          FROM horario_clase h
          WHERE h.id_materia = ${id_materia}
            AND h.id_grado   = mat.id_grado
            AND h.id_seccion = mat.id_seccion
            AND al.estado     = 'Activo'
        )
    `;
    res.json({ success: true, alumnos: result.recordset });
  } catch (error) {
    console.error('Error en getAlumnosPorMateria:', error);
    res.status(500).json({ success: false, message: 'Error al obtener alumnos' });
  }
}

module.exports = { getAlumnosPorMateria };
