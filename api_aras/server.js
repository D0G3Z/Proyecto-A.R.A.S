const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const loginRoutes = require('./routes/loginRoutes');

const app = express();
const PORT = 3000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Rutas
app.use('/api', loginRoutes);

// Servidor escuchando
app.listen(PORT, () => {
    console.log(`Servidor API escuchando en http://localhost:${PORT}`);
});
