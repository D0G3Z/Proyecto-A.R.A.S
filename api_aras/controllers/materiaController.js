const sql = require('mssql');
const config = require('../config/db');

// Función para obtener las materias y grados del docente desde los horarios
async function getMateriasDocente(req, res) {
    const { id_docente } = req.params;  // Obtiene el id del docente desde los parámetros de la URL

    console.log('ID del docente recibido:', id_docente);  // Verifica el id_docente recibido

    try {
        await sql.connect(config);
        const result = await sql.query`
            SELECT 
                m.id_materia, 
                m.nombre AS materia, 
                CONCAT(g.nombre, ' ', n.nombre) AS grado_y_nivel  
            FROM horario_clase h
            JOIN materia m ON h.id_materia = m.id_materia
            JOIN grado g ON h.id_grado = g.id_grado
            JOIN nivel n ON g.id_nivel = n.id_nivel 
            WHERE h.id_docente = ${id_docente}  
            GROUP BY m.id_materia, m.nombre, g.nombre, n.nombre  
        `;

        console.log('Resultados de la consulta:', result.recordset);  // Imprime los resultados

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
