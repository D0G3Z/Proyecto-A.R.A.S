// controllers/asignacionController.js
const sql    = require('mssql');
const config = require('../config/db');

// Listar
async function getAsignaciones(req, res) {
  const { materia, grado, seccion, tipo } = req.query;
  if (!materia || !grado || !seccion) {
    return res.status(400).json({ success: false, message: 'Faltan parámetros materia, grado o sección' });
  }
  try {
    await sql.connect(config);
    let result;
    if (tipo) {
      result = await sql.query`
        SELECT id_asignacion, descripcion, tipo,
               CONVERT(varchar(16), fecha_asignacion,120) AS fecha_asignacion,
               CONVERT(varchar(16), fecha_entrega,   120) AS fecha_entrega
        FROM asignacion
        WHERE id_materia=${materia} AND id_grado=${grado} AND id_seccion=${seccion} AND tipo=${tipo}
        ORDER BY fecha_entrega DESC`;
    } else {
      result = await sql.query`
        SELECT id_asignacion, descripcion, tipo,
               CONVERT(varchar(16), fecha_asignacion,120) AS fecha_asignacion,
               CONVERT(varchar(16), fecha_entrega,   120) AS fecha_entrega
        FROM asignacion
        WHERE id_materia=${materia} AND id_grado=${grado} AND id_seccion=${seccion}
        ORDER BY fecha_entrega DESC`;
    }
    res.json({ success: true, asignaciones: result.recordset });
  } catch (err) {
    console.error('Error en getAsignaciones:', err);
    res.status(500).json({ success: false, message: 'Error al listar asignaciones' });
  }
}

// Obtener uno
async function getAsignacion(req, res) {
  const id = parseInt(req.params.id,10);
  try {
    await sql.connect(config);
    const result = await sql.query`
      SELECT id_asignacion, id_materia, id_grado, id_seccion,
             descripcion, tipo,
             CONVERT(varchar(16), fecha_asignacion,120) AS fecha_asignacion,
             CONVERT(varchar(16), fecha_entrega,   120) AS fecha_entrega
      FROM asignacion WHERE id_asignacion=${id}`;
    if (!result.recordset.length) return res.status(404).json({ success:false, message:'No encontrada' });
    res.json({ success:true, asignacion: result.recordset[0] });
  } catch(err) {
    console.error('Error en getAsignacion:', err);
    res.status(500).json({ success:false, message:'Error al obtener asignación' });
  }
}

// Crear
async function createAsignacion(req, res) {
  const { id_materia, id_grado, id_seccion, descripcion, tipo, fecha_entrega } = req.body;
  if (!id_materia||!id_grado||!id_seccion||!descripcion||!tipo||!fecha_entrega) {
    return res.status(400).json({ success:false, message:'Faltan datos obligatorios' });
  }
  if (new Date(fecha_entrega) < new Date().setHours(0,0,0,0)) {
    return res.status(400).json({ success:false, message:'Fecha de entrega no puede ser anterior a hoy' });
  }
  try {
    await sql.connect(config);
    const fechaStr = fecha_entrega.replace('T',' ') + ':00';
    const result = await sql.query`
      INSERT INTO asignacion (id_materia,id_grado,id_seccion,descripcion,tipo,fecha_asignacion,fecha_entrega)
      VALUES (${id_materia},${id_grado},${id_seccion},${descripcion},${tipo},GETDATE(),${fechaStr});
      SELECT SCOPE_IDENTITY() AS id_asignacion;`;
    res.json({ success:true, message:'Asignación creada', id_asignacion: result.recordset[0].id_asignacion });
  } catch(err) {
    console.error('Error en createAsignacion:', err);
    res.status(500).json({ success:false, message:'Error al crear asignación' });
  }
}

// Actualizar
async function updateAsignacion(req, res) {
  const id = parseInt(req.params.id,10);
  const { descripcion, tipo, fecha_entrega } = req.body;
  if (!descripcion||!tipo||!fecha_entrega) {
    return res.status(400).json({ success:false, message:'Faltan datos para actualizar' });
  }
  if (new Date(fecha_entrega) < new Date().setHours(0,0,0,0)) {
    return res.status(400).json({ success:false, message:'Fecha de entrega no puede ser anterior a hoy' });
  }
  try {
    await sql.connect(config);
    const fechaStr = fecha_entrega.replace('T',' ') + ':00';
    await sql.query`
      UPDATE asignacion SET descripcion=${descripcion}, tipo=${tipo}, fecha_entrega=${fechaStr}
      WHERE id_asignacion=${id};`;
    res.json({ success:true, message:'Asignación actualizada' });
  } catch(err) {
    console.error('Error en updateAsignacion:', err);
    res.status(500).json({ success:false, message:'Error al actualizar asignación' });
  }
}

// Eliminar
async function deleteAsignacion(req, res) {
  const id = parseInt(req.params.id,10);
  try {
    await sql.connect(config);
    await sql.query`DELETE FROM asignacion WHERE id_asignacion=${id}`;
    res.json({ success:true, message:'Asignación eliminada' });
  } catch(err) {
    console.error('Error en deleteAsignacion:', err);
    res.status(500).json({ success:false, message:'Error al eliminar asignación' });
  }
}

module.exports = {
  getAsignaciones,
  getAsignacion,
  createAsignacion,
  updateAsignacion,
  deleteAsignacion
};
