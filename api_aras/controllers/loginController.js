const sql = require('mssql');
const config = require('../config/db');

async function login(req, res) {
    const { usuario, contrasena } = req.body;

    try {
         console.log("Conectando a la base de datos...");

        await sql.connect(config);
        
        // Realizamos la consulta para verificar el usuario y la contraseña
        const result = await sql.query`
            SELECT * FROM usuario_web 
            WHERE nombre_usuario = ${usuario}
              AND contrasena = ${contrasena}
              AND estado = 1
        `;
        console.log("Resultado de la consulta:", result);
        // Si el usuario existe, devolvemos su id_docente, rol y otros detalles
        if (result.recordset.length > 0) {
            const usuario = result.recordset[0];
            res.json({
                success: true,
                message: 'Login exitoso',
                usuario: usuario  // Devolvemos los datos del usuario (incluido el rol)
            });
        } else {
            res.json({
                success: false,
                message: 'Usuario o contraseña incorrectos'
            });
        }
    } catch (error) {
        console.error('Error en el login:', error);
        res.status(500).send('Error en el servidor');
    }
}

module.exports = { login };
