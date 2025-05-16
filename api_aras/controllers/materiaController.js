const sql = require('mssql');
const config = require('../config/db');

async function getMateriasDocente(req, res) {
  const { id_docente } = req.params;

  try {
    await sql.connect(config);
    const result = await sql.query`
      SELECT 
        m.id_materia, 
        m.nombre    AS materia, 
        h.id_grado  AS id_grado,
        CONCAT(
          g.nombre, ' ', 
          CASE WHEN g.id_nivel = 1 THEN 'Primaria' ELSE 'Secundaria' END
        )           AS grado_y_nivel,
        h.id_seccion AS id_seccion,
        s.letra      AS seccion
      FROM horario_clase h
      JOIN materia  m ON h.id_materia = m.id_materia
      JOIN grado    g ON h.id_grado   = g.id_grado
      JOIN seccion  s ON h.id_seccion = s.id_seccion
      WHERE h.id_docente = ${id_docente}
      GROUP BY 
        m.id_materia, 
        m.nombre, 
        h.id_grado, 
        g.nombre, 
        g.id_nivel, 
        h.id_seccion, 
        s.letra
    `;

    if (result.recordset.length > 0) {
      res.json({ success: true, materias: result.recordset });
    } else {
      res.json({ success: false, message: 'No se encontraron materias para este docente' });
    }
  } catch (error) {
    console.error('Error al obtener las materias del docente:', error);
    res.status(500).json({ success: false, message: 'Error al obtener las materias del docente' });
  }
}

module.exports = { getMateriasDocente };
