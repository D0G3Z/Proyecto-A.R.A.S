const sql = require('mssql/msnodesqlv8');

const config = {
    server: 'DESKTOP-PN15LOT',
    database: 'db_ARAS',
    driver: 'msnodesqlv8',
    options: {
        trustedConnection: true
    }
};

module.exports = config;
