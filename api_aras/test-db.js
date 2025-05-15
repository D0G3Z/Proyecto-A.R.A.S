const sql = require('mssql');
const config = require('./config/db');

sql.connect(config).then(pool => {
    console.log('✅ Conexión exitosa a SQL Server');
    return pool.close();
}).catch(err => {
    console.error('❌ Error de conexión:', err);
});
