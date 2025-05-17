// controllers/docenteController.js
const sql = require('mssql');
const config = require('../config/db');

async function getDocentePorId(req, res) {
  const idDocente = parseInt(req.params.id, 10);
  if (!idDocente) {
    return res.status(400).json({ success: false, message: 'ID de docente inválido' });
  }

  try {
    await sql.connect(config);
    const result = await sql.query`
      SELECT id_docente, codigo, dni, nombres, apellido_paterno, apellido_materno,
             genero, fecha_nacimiento, direccion, telefono, correo, estado,
             foto, nivel_academico, observaciones, id_nivel
      FROM docente
      WHERE id_docente = ${idDocente}
    `;
    if (!result.recordset.length) {
      return res.status(404).json({ success: false, message: 'Docente no encontrado' });
    }
    res.json({ success: true, docente: result.recordset[0] });
  } catch (err) {
    console.error('Error en getDocentePorId:', err);
    res.status(500).json({ success: false, message: 'Error al obtener datos del docente' });
  }
}

async function cambiarContrasena(req, res) {
  const { id_usuario, clave_actual, nueva_clave } = req.body;

  if (!id_usuario || !clave_actual || !nueva_clave) {
    return res.status(400).json({ success: false, message: 'Faltan datos' });
  }

  try {
    await sql.connect(config);

    // Verificar clave actual en usuario_web
    const result = await sql.query`
      SELECT * FROM usuario_web WHERE id_usuario = ${id_usuario} AND contrasena = ${clave_actual}
    `;

    if (result.recordset.length === 0) {
      return res.status(401).json({ success: false, message: 'La contraseña actual es incorrecta' });
    }

    // Actualizar la nueva contraseña
    await sql.query`
      UPDATE usuario_web SET contrasena = ${nueva_clave} WHERE id_usuario = ${id_usuario}
    `;

    res.json({ success: true, message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    console.error('Error en cambiarContrasena:', error);
    res.status(500).json({ success: false, message: 'Error interno en el servidor' });
  }
}



module.exports = { getDocentePorId, cambiarContrasena };
