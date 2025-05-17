const sql = require('mssql');
const config = require('../config/db');

async function getAlumnosPorMateria(req, res) {
  // los leemos de req.query en lugar de req.params
  const id_materia = parseInt(req.query.materia, 10);
  const id_grado   = parseInt(req.query.grado,   10);
  const id_seccion = parseInt(req.query.seccion, 10);

  console.log('getAlumnosPorMateria →', { id_materia, id_grado, id_seccion });

  if (!id_materia || !id_grado || !id_seccion) {
    return res.status(400).json({
      success: false,
      message: 'Faltan materia, grado o sección en la consulta'
    });
  }

  try {
    await sql.connect(config);
    const result = await sql.query`
      SELECT
        mat.id_matricula,
        al.id_alumno,
        al.nombres,
        al.apellido_paterno,
        al.apellido_materno
      FROM matricula mat
      JOIN alumno al
        ON mat.id_alumno = al.id_alumno
      WHERE mat.id_grado   = ${id_grado}
        AND mat.id_seccion = ${id_seccion}
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
