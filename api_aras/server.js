const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const loginRoutes = require('./routes/loginRoutes');
const perfilRoutes = require('./routes/perfilRoutes');
const directorRoutes = require('./routes/directorRoutes');
const horarioRoutes = require('./routes/horarioRoutes');
const materiaRoutes = require('./routes/materiaRoutes');
const seccionesRoutes = require('./routes/seccionesRoutes');
const alumnoRoutes = require('./routes/alumnoRoutes'); 
const asistenciaRoutes = require('./routes/asistenciaRoutes');

const app = express();
const PORT = 3000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Rutas
app.use('/api', loginRoutes);
app.use('/api', perfilRoutes);
app.use('/api', directorRoutes);
app.use('/api', horarioRoutes);
app.use('/api', materiaRoutes);
app.use('/api', seccionesRoutes);
app.use('/api', alumnoRoutes);
app.use('/api', asistenciaRoutes);


// Servidor escuchando
app.listen(PORT, () => {
    console.log(`Servidor API escuchando en http://localhost:${PORT}`);
});
