const sql = require('mssql');

const config = {
    user: 'aras_admin',
    password: 'aras1234',
    server: 'DESKTOP-PN15LOT',
    database: 'db_ARAS',
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

module.exports = config;

