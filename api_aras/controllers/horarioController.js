const sql = require('mssql');
const config = require('../config/db');

// Obtener horarios con información detallada
async function getHorarios(req, res) {
    try {
        await sql.connect(config);
        const result = await sql.query`
            SELECT 
                h.id_horario,
                d.nombres + ' ' + d.apellido_paterno AS nombre_docente,   
                m.nombre AS nombre_materia,                               
                g.nombre AS nombre_grado,                                 
                s.letra AS nombre_seccion,                                
                h.dia_semana,
                FORMAT(h.hora_inicio, 'hh\\:mm') AS hora_inicio,
                FORMAT(h.hora_fin, 'hh\\:mm') AS hora_fin
            FROM horario_clase h
            JOIN docente d ON h.id_docente = d.id_docente
            JOIN materia m ON h.id_materia = m.id_materia
            JOIN grado g ON h.id_grado = g.id_grado
            JOIN seccion s ON h.id_seccion = s.id_seccion
        `;
        res.json({ success: true, horarios: result.recordset });
    } catch (error) {
        console.error('Error al obtener horarios:', error);
        res.status(500).json({ success: false, message: 'Error al obtener horarios' });
    }
}


// Crear un nuevo horario
async function crearHorario(req, res) {
    const { id_docente, id_materia, id_grado, id_seccion, dia_semana, hora_inicio, hora_fin } = req.body;

    // Verifica si los valores están llegando bien
    console.log("Datos recibidos:", req.body);

    try {
        await sql.connect(config);
        await sql.query`
            INSERT INTO horario_clase (id_docente, id_materia, id_grado, id_seccion, dia_semana, hora_inicio, hora_fin)
            VALUES (${id_docente}, ${id_materia}, ${id_grado}, ${id_seccion}, ${dia_semana}, ${hora_inicio}, ${hora_fin})
        `;
        res.json({ success: true, message: 'Horario creado correctamente' });
    } catch (error) {
        console.error('Error al crear horario:', error);
        res.status(500).json({ success: false, message: 'Error al crear horario' });
    }
}


// Eliminar un horario por ID
async function eliminarHorario(req, res) {
    const { id } = req.params;
    try {
        await sql.connect(config);
        await sql.query`DELETE FROM horario_clase WHERE id_horario = ${id}`;
        res.json({ success: true, message: 'Horario eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar horario:', error);
        res.status(500).json({ success: false, message: 'Error al eliminar horario' });
    }
}

// Obtener docentes (para combo)
async function getDocentes(req, res) {
    try {
        await sql.connect(config);
        const result = await sql.query`
            SELECT id_docente, (nombres + ' ' + apellido_paterno) AS nombre_completo
            FROM docente
            WHERE estado = 'Activo'
        `;
        res.json({ success: true, result: result.recordset });
    } catch (error) {
        console.error('Error al obtener docentes:', error);
        res.status(500).json({ success: false });
    }
}

// Obtener materias
async function getMaterias(req, res) {
    try {
        await sql.connect(config);
        const result = await sql.query`SELECT id_materia, nombre FROM materia`;
        res.json({ success: true, result: result.recordset });
    } catch (error) {
        console.error('Error al obtener materias:', error);
        res.status(500).json({ success: false });
    }
}

// Obtener grados
async function getGrados(req, res) {
    try {
        await sql.connect(config);
        const result = await sql.query`SELECT id_grado, nombre FROM grado`;
        res.json({ success: true, result: result.recordset });
    } catch (error) {
        console.error('Error al obtener grados:', error);
        res.status(500).json({ success: false });
    }
}

// Obtener secciones
async function getSecciones(req, res) {
    try {
        await sql.connect(config);
        const result = await sql.query`SELECT id_seccion, letra FROM seccion`;
        res.json({ success: true, result: result.recordset });
    } catch (error) {
        console.error('Error al obtener secciones:', error);
        res.status(500).json({ success: false });
    }
}

async function obtenerHorariosPorFiltro(req, res) {
    const { nivel, grado, seccion } = req.params;
    try {
      await sql.connect(config);
      const result = await sql.query`
        SELECT 
          h.id_horario,
          h.dia_semana,
          h.hora_inicio,
          h.hora_fin,
          d.nombres + ' ' + d.apellido_paterno AS nombre_docente,
          m.nombre                     AS nombre_materia,
          g.nombre + ' ' + 
            (CASE WHEN g.id_nivel = 1 THEN 'Primaria' ELSE 'Secundaria' END) 
                                      AS nombre_grado
        FROM horario_clase h
        JOIN docente d ON h.id_docente = d.id_docente
        JOIN materia m ON h.id_materia = m.id_materia
        JOIN grado g   ON h.id_grado   = g.id_grado
        WHERE g.id_nivel   = ${nivel}
          AND h.id_grado   = ${grado}
          AND h.id_seccion = ${seccion}
        ORDER BY h.hora_inicio
      `;
      res.json({ success: true, horarios: result.recordset });
    } catch (error) {
      console.error('Error al obtener horarios filtrados:', error);
      res.status(500).json({ success: false, message: 'Error al obtener horarios' });
    }
  }

module.exports = {
    getHorarios,
    crearHorario,
    eliminarHorario,
    getDocentes,
    getMaterias,
    getGrados,
    getSecciones,
    getDocentesPorNivel,
    obtenerHorariosPorFiltro,       
    getMateriasPorDocente,
    getGradosPorNivel,
    getListAlumnos,
    getListDocentes,
    getHorariosDocente
};

// Obtener docentes por nivel
async function getDocentesPorNivel(req, res) {
    const { id_nivel } = req.params;
    try {
        await sql.connect(config);
        const result = await sql.query`
            SELECT id_docente, (nombres + ' ' + apellido_paterno) AS nombre_completo
            FROM docente
            WHERE id_nivel = ${id_nivel} AND estado = 'Activo'
        `;
        res.json({ success: true, result: result.recordset });
    } catch (error) {
        console.error('Error al obtener docentes por nivel:', error);
        res.status(500).json({ success: false });
    }
}



// Obtener materias que dicta un docente
async function getMateriasPorDocente(req, res) {
    const { id } = req.params;
    try {
        await sql.connect(config);
        const result = await sql.query`
            SELECT m.id_materia, m.nombre
            FROM docente_materia dm
            JOIN materia m ON dm.id_materia = m.id_materia
            WHERE dm.id_docente = ${id}
        `;
        res.json({ success: true, result: result.recordset });
    } catch (error) {
        console.error('Error al obtener materias del docente:', error);
        res.status(500).json({ success: false });
    }
}


// Obtener grados por nivel
async function getGradosPorNivel(req, res) {
    const { id_nivel } = req.params;
    try {
        await sql.connect(config);
        const result = await sql.query`
            SELECT id_grado, nombre, id_nivel
            FROM grado
            WHERE id_nivel = ${id_nivel}
        `;
        res.json({ success: true, result: result.recordset });
    } catch (error) {
        console.error('Error al obtener grados por nivel:', error);
        res.status(500).json({ success: false });
    }
}

// Obtener todos los docentes
async function getListDocentes(req, res) {
    try {
        await sql.connect(config);
        const result = await sql.query`
            SELECT id_docente, nombres, apellido_paterno, dni, estado
            FROM docente
            WHERE estado = 'Activo'
        `;
        res.json({ success: true, result: result.recordset });
    } catch (error) {
        console.error('Error al obtener docentes:', error);
        res.status(500).json({ success: false, message: 'Error al obtener docentes' });
    }
}

// Obtener todos los alumnos con su grado
async function getListAlumnos(req, res) {
    try {
        await sql.connect(config);
        const result = await sql.query`
            SELECT 
                a.id_alumno, 
                a.nombres, 
                a.apellido_paterno, 
                a.estado
            FROM alumno a
            WHERE a.estado = 'Activo'
        `;
        res.json({ success: true, result: result.recordset });
    } catch (error) {
        console.error('Error al obtener alumnos:', error);
        res.status(500).json({ success: false, message: 'Error al obtener alumnos' });
    }
}

// Obtener los horarios de un docente específico
async function getHorariosDocente(req, res) {
    const { id_docente } = req.params;  // Obtiene el id del docente desde los parámetros de la URL

    console.log('id_docente:', id_docente);  // Imprime el id del docente para asegurarse de que es correcto

    try {
        await sql.connect(config);
        const result = await sql.query`
            SELECT 
                h.id_horario,
                m.nombre AS materia,
                g.nombre AS grado,
                h.dia_semana,
                FORMAT(h.hora_inicio, 'hh\\:mm') AS hora_inicio,
                FORMAT(h.hora_fin, 'hh\\:mm') AS hora_fin
            FROM horario_clase h
            JOIN materia m ON h.id_materia = m.id_materia
            JOIN grado g ON h.id_grado = g.id_grado
            WHERE h.id_docente = ${id_docente}  
            ORDER BY h.hora_inicio;  
        `;

        res.json({ success: true, horarios: result.recordset });
    } catch (error) {
        console.error('Error al obtener horarios del docente:', error);
        res.status(500).json({ success: false, message: 'Error al obtener horarios del docente' });
    }
}









