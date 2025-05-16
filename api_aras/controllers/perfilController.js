const sql = require('mssql');
const config = require('../config/db');

// Controlador para obtener datos del perfil
async function obtenerPerfil(req, res) {
    const usuario = req.params.usuario;

    try {
        await sql.connect(config);
        const result = await sql.query`
            SELECT nombres, apellido_paterno, apellido_materno, dni, correo, nivel_academico, telefono, foto
            FROM docente
            WHERE id_docente = (
                SELECT id_docente 
                FROM usuario_web 
                WHERE nombre_usuario = ${usuario} 
                AND estado = 1
            )
        `;

        if (result.recordset.length > 0) {
            res.json({ success: true, usuario: result.recordset[0] });
        } else {
            res.json({ success: false, message: 'Perfil no encontrado' });
        }
    } catch (error) {
        console.error('Error obteniendo perfil:', error);
        res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
}

// Controlador para actualizar contraseña
async function actualizarContrasena(req, res) {
    const { usuario, nuevaContrasena } = req.body;

    try {
        await sql.connect(config);
        const result = await sql.query`
            UPDATE usuario_web
            SET contrasena = ${nuevaContrasena}
            WHERE nombre_usuario = ${usuario} AND estado = 1
        `;

        res.json({ success: true, message: 'Contraseña actualizada correctamente' });
    } catch (error) {
        console.error('Error actualizando contraseña:', error);
        res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
}

module.exports = { obtenerPerfil, actualizarContrasena };
