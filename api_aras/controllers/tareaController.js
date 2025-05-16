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

  if (![id_materia,id_grado,id_seccion,descripcion,fecha_entrega].every(x => x != null)) {
    return res
      .status(400)
      .json({ success:false, message:'Faltan parámetros materia, grado, sección, descripción o fecha_entrega' });
  }

  // Validar fecha_entrega >= hoy
  const fechaEntrega = new Date(fecha_entrega);
  // restamos la diferencia con UTC (en minutos)
  fechaEntrega.setMinutes( fechaEntrega.getMinutes() - fechaEntrega.getTimezoneOffset() );
  if (isNaN(fechaEntrega)) {
    return res.status(400).json({ success:false, message:'Fecha inválida' });
  }
  if (fechaEntrega < new Date()) {
    return res.status(400).json({ success:false, message:'La entrega debe ser en el futuro' });
  }

  try {
    // 3) Conectar y crear Request
    const pool    = await sql.connect(config);
    const request = pool.request();

    // 4) Pasar cada parámetro con su tipo
    request.input('id_materia',    sql.Int,      id_materia);
    request.input('id_grado',      sql.Int,      id_grado);
    request.input('id_seccion',    sql.Int,      id_seccion);
    request.input('descripcion',   sql.VarChar(500), descripcion);
    request.input('fecha_entrega', sql.DateTime2, fechaEntrega);
    // vamos a usar GETDATE() para la fecha de asignación

    // 5) Ejecutar el INSERT
    await request.query(`
      INSERT INTO tarea
        (id_materia, id_grado, id_seccion, descripcion, fecha_entrega, estado, fecha_asignacion)
      VALUES
        (@id_materia, @id_grado, @id_seccion, @descripcion, @fecha_entrega, 'Pendiente', GETDATE())
    `);

    return res.json({ success:true, message:'Tarea creada correctamente' });

  } catch (err) {
    console.error('Error creando tarea:', err);
    return res
      .status(500)
      .json({ success:false, message:'Error interno al crear la tarea' });
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
