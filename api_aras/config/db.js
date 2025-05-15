const sql = require('mssql');

const config = {
    user: 'admin_aras',
    password: 'aras1234',
    server: 'DESKTOP-6GT7ILU',
    database: 'db_ARAS',
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

module.exports = config;

