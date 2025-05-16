const sql = require('mssql');
const config = require('../config/db');

// Obtener secciones por grado (usando la tabla de matrícula)
async function obtenerSeccionesPorGrado(req, res) {
    const { idGrado } = req.params;

    try {
        await sql.connect(config);
        const result = await sql.query`
            SELECT DISTINCT m.id_seccion, s.letra
            FROM matricula m
            JOIN seccion s ON m.id_seccion = s.id_seccion
            WHERE m.id_grado = ${idGrado}
        `;
        
        if (result.recordset.length > 0) {
            res.json({ success: true, result: result.recordset });
        } else {
            res.json({ success: false, message: 'No se encontraron secciones para este grado' });
        }
    } catch (error) {
        console.error('Error al obtener las secciones:', error);
        res.status(500).json({ success: false, message: 'Error al obtener las secciones' });
    }
}

module.exports = { obtenerSeccionesPorGrado };
