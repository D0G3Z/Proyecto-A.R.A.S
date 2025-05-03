const sql = require('mssql');
const config = require('../config/db');

// Obtener total de docentes activos
async function totalDocentes(req, res) {
    try {
        await sql.connect(config);
        const result = await sql.query`
            SELECT COUNT(*) AS total
            FROM docente
            WHERE estado = 'Activo'
        `;

        res.json({ success: true, total: result.recordset[0].total });
    } catch (error) {
        console.error('Error obteniendo total de docentes:', error);
        res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
}

// Obtener total de alumnos activos
async function totalAlumnos(req, res) {
    try {
        await sql.connect(config);
        const result = await sql.query`
            SELECT COUNT(*) AS total
            FROM alumno
            WHERE estado = 'Activo'
        `;

        res.json({ success: true, total: result.recordset[0].total });
    } catch (error) {
        console.error('Error obteniendo total de alumnos:', error);
        res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
}

// Obtener horarios de clases
async function listarHorarios(req, res) {
    try {
        await sql.connect(config);
        const result = await sql.query`
            SELECT 
                m.nombre AS nombre_materia,
                d.nombres + ' ' + d.apellido_paterno AS nombre_docente,
                g.nombre AS nombre_grado,
                h.dia_semana,
                FORMAT(h.hora_inicio, 'hh\\:mm') AS hora_inicio,
                FORMAT(h.hora_fin, 'hh\\:mm') AS hora_fin
            FROM horario_clase h
            INNER JOIN docente d ON h.id_docente = d.id_docente
            INNER JOIN materia m ON h.id_materia = m.id_materia
            INNER JOIN grado g ON h.id_grado = g.id_grado
            INNER JOIN seccion s ON h.id_seccion = s.id_seccion
        `;

        res.json({ success: true, horarios: result.recordset });
    } catch (error) {
        console.error('Error listando horarios:', error);
        res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
}

module.exports = { totalDocentes, totalAlumnos, listarHorarios };
