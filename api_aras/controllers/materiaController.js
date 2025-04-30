const sql = require('mssql');
const config = require('../config/db');

// Función para obtener las materias del docente
async function getMateriasDocente(req, res) {
    const { id_docente } = req.params;  // Obtiene el id del docente desde los parámetros de la URL

    try {
        await sql.connect(config);
        const result = await sql.query`
            SELECT m.id_materia, m.nombre AS materia, g.nombre AS grado
            FROM docente_materia dm
            JOIN materia m ON dm.id_materia = m.id_materia
            JOIN grado g ON g.id_grado = dm.id_grado
            WHERE dm.id_docente = ${id_docente}  // Filtra por el docente
        `;

        res.json({ success: true, materias: result.recordset });
    } catch (error) {
        console.error('Error al obtener materias del docente:', error);
        res.status(500).json({ success: false, message: 'Error al obtener materias del docente' });
    }
}

module.exports = { getMateriasDocente };
