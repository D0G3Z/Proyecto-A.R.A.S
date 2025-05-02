// controllers/materiaController.js
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
              CONCAT(
                g.nombre, ' ',
                CASE WHEN g.id_nivel = 1 THEN 'Primaria' ELSE 'Secundaria' END
              )           AS grado_y_nivel,
              s.letra      AS seccion
            FROM horario_clase h
            JOIN materia m ON h.id_materia = m.id_materia
            JOIN grado   g ON h.id_grado   = g.id_grado
            JOIN seccion s ON h.id_seccion = s.id_seccion
            WHERE h.id_docente = ${id_docente}
            GROUP BY m.id_materia, m.nombre, g.nombre, g.id_nivel, s.letra
        `;

        console.log('Resultados de la consulta:', result.recordset);
        res.json({ success: true, materias: result.recordset });
    } catch (error) {
        console.error('Error al obtener las materias del docente:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener las materias del docente'
        });
    }
}

module.exports = { getMateriasDocente };
