// controllers/tareaController.js
const sql    = require('mssql');
const config = require('../config/db');

/**
 * GET /api/tareas?materia=&grado=&seccion=
 * Lista todas las tareas para un curso dado
 */
async function getTareasPorFiltro(req, res) {
  const id_materia = parseInt(req.query.materia, 10);
  const id_grado   = parseInt(req.query.grado,   10);
  const id_seccion = parseInt(req.query.seccion, 10);

  if (!id_materia || !id_grado || !id_seccion) {
    return res.status(400).json({
      success: false,
      message: 'Faltan parámetros materia, grado o sección'
    });
  }

  try {
    await sql.connect(config);
    const result = await sql.query`
      SELECT 
        id_tarea,
        descripcion,
        CONVERT(varchar, fecha_entrega, 23) AS fecha_entrega,
        estado
      FROM tarea
      WHERE id_materia = ${id_materia}
        AND id_grado   = ${id_grado}
        AND id_seccion = ${id_seccion}
      ORDER BY fecha_entrega DESC
    `;
    res.json({ success: true, tareas: result.recordset });
  } catch (err) {
    console.error('Error en getTareasPorFiltro:', err);
    res.status(500).json({ success: false, message: 'Error al listar tareas' });
  }
}

/**
 * POST /api/tareas
 * Crea una nueva tarea
 * Body: { id_materia, id_grado, id_seccion, descripcion, fecha_entrega, estado? }
 */
async function crearTarea(req, res) {
  const {
    id_materia,
    id_grado,
    id_seccion,
    descripcion,
    fecha_entrega
  } = req.body;

  if (!id_materia || !id_grado || !id_seccion || !descripcion || !fecha_entrega) {
    return res.status(400).json({
      success: false,
      message: 'Faltan datos obligatorios para crear la tarea'
    });
  }

  // Validar fecha_entrega >= hoy
  const hoy = new Date();
  hoy.setHours(0,0,0,0);
  const entrega = new Date(fecha_entrega);
  if (entrega < hoy) {
    return res.status(400).json({
      success:false,
      message:'La fecha de entrega no puede ser anterior a hoy'
    });
  }

  try {
    await sql.connect(config);
    await sql.query`
      INSERT INTO tarea
        (id_materia, id_grado, id_seccion, descripcion, fecha_entrega, estado, fecha_asignacion)
      VALUES
        (${id_materia}, ${id_grado}, ${id_seccion}, ${descripcion}, ${fecha_entrega}, 'Pendiente', GETDATE())
    `;
    res.json({ success: true, message: 'Tarea creada correctamente' });
  } catch (err) {
    console.error('Error en crearTarea:', err);
    res.status(500).json({ success: false, message: 'Error al crear tarea' });
  }
}

/**
 * DELETE /api/tareas/:id
 * Elimina una tarea por su ID
 */
async function eliminarTarea(req, res) {
  const id = parseInt(req.params.id, 10);
  if (!id) {
    return res.status(400).json({ success:false, message:'Falta id de tarea' });
  }
  try {
    await sql.connect(config);
    await sql.query`DELETE FROM tarea WHERE id_tarea = ${id}`;
    res.json({ success:true, message:'Tarea eliminada correctamente' });
  } catch (err) {
    console.error('Error eliminando tarea:', err);
    res.status(500).json({ success:false, message:'Error al eliminar la tarea' });
  }
}

module.exports = {
  getTareasPorFiltro,
  crearTarea,
  eliminarTarea
};
