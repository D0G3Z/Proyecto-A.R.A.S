const sql = require('mssql/msnodesqlv8');
const config = require('../config/db');

async function login(req, res) {
    const { usuario, contrasena } = req.body;

    try {
        await sql.connect(config);
        const result = await sql.query`
            SELECT * FROM usuario_web
            WHERE nombre_usuario = ${usuario}
              AND contrasena = ${contrasena}
              AND estado = 1
        `;

        if (result.recordset.length > 0) {
            res.json({ success: true, usuario: result.recordset[0] });
        } else {
            res.json({ success: false, message: 'Usuario o contraseña incorrectos' });
        }
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        res.status(500).send('Error en el servidor');
    }
}

module.exports = { login };
