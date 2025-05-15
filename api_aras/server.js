const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const loginRoutes = require('./routes/loginRoutes');
const perfilRoutes = require('./routes/perfilRoutes');
const directorRoutes = require('./routes/directorRoutes');
const horarioRoutes = require('./routes/horarioRoutes');
const materiaRoutes = require('./routes/materiaRoutes');
const seccionesRoutes = require('./routes/seccionesRoutes');

const app = express();
const PORT = 3000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Rutas API
app.use('/api', loginRoutes);
app.use('/api', perfilRoutes);
app.use('/api', directorRoutes);
app.use('/api', horarioRoutes);
app.use('/api', materiaRoutes);
app.use('/api', seccionesRoutes);

// Servir HTML desde /pages
app.use('/pages', express.static(path.join(__dirname, '..', 'pages')));

app.use('/assets', express.static(path.join(__dirname, '..', 'assets')));
// Ruta raíz por defecto
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname,'..', 'pages', 'pass_login.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor API escuchando en http://localhost:${PORT}`);
});
