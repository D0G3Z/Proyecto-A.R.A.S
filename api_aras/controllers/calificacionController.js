// controllers/calificacionController.js
const sql    = require('mssql');
const config = require('../config/db');

// GET /api/calificaciones?asignacion={id}
async function getCalificaciones(req, res) {
  const asignacion = parseInt(req.query.asignacion, 10);
  if (!asignacion) {
    return res.status(400).json({ success: false, message: 'Falta parámetro asignacion' });
  }
  try {
    await sql.connect(config);
    const result = await sql.query`
      SELECT
        id_calificacion,
        id_matricula,
        nota,
        CONVERT(varchar(16), fecha_registro, 120) AS fecha_registro
      FROM calificacion
      WHERE id_asignacion = ${asignacion}`;
    res.json({ success: true, calificaciones: result.recordset });
  } catch (err) {
    console.error('Error en getCalificaciones:', err);
    res.status(500).json({ success: false, message: 'Error al obtener calificaciones' });
  }
}

// POST /api/calificaciones/bulk
// Body: { calificaciones: [ { id_asignacion, id_matricula, nota }, ... ] }
async function bulkCalificaciones(req, res) {
  const items = req.body.calificaciones;
  if (!Array.isArray(items)) {
    return res.status(400).json({ success: false, message: 'Payload inválido: calificaciones debe ser un arreglo' });
  }
  let transaction;
  try {
    await sql.connect(config);
    transaction = new sql.Transaction();
    await transaction.begin();

    for (const c of items) {
      const { id_asignacion, id_matricula, nota } = c;
      if (!id_asignacion || !id_matricula || typeof nota !== 'number') {
        throw new Error('Datos incompletos en calificación: ' + JSON.stringify(c));
      }
      // Upsert: si existe, update; sino insert
      const request = new sql.Request(transaction);
      await request.query`
        IF EXISTS (
          SELECT 1 FROM calificacion
          WHERE id_asignacion = ${id_asignacion}
            AND id_matricula = ${id_matricula}
        )
          UPDATE calificacion
          SET nota = ${nota}, fecha_registro = GETDATE()
          WHERE id_asignacion = ${id_asignacion}
            AND id_matricula = ${id_matricula}
        ELSE
          INSERT INTO calificacion
            (id_asignacion, id_matricula, nota, fecha_registro)
          VALUES
            (${id_asignacion}, ${id_matricula}, ${nota}, GETDATE());
      `;
    }

    await transaction.commit();
    res.json({ success: true, message: 'Calificaciones guardadas correctamente' });
  } catch (err) {
    console.error('Error en bulkCalificaciones:', err);
    if (transaction) await transaction.rollback();
    res.status(500).json({ success: false, message: 'Error al guardar calificaciones' });
  }
}

module.exports = {
  getCalificaciones,
  bulkCalificaciones
};