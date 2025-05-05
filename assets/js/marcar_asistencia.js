// assets/js/marcar_asistencia.js
document.addEventListener('DOMContentLoaded', async () => {
  const API_URL      = 'http://localhost:3000/api';
  const horaActualEl = document.getElementById('horaActual');
  const fechaHoyEl   = document.getElementById('fechaHoy');
  const mensajeFuera = document.getElementById('mensajeFuera');
  const formAsis     = document.getElementById('formAsistencia');
  const tblAsis      = document.getElementById('tblAsistencias');

  // 1) Hora y fecha en tiempo real
  function updateDateTime() {
    const ahora = new Date();
    const hh    = String(ahora.getHours()).padStart(2,'0');
    const mm    = String(ahora.getMinutes()).padStart(2,'0');
    horaActualEl.textContent = `${hh}:${mm}`;

    const optFecha = {
      weekday: 'long', year: 'numeric',
      month: 'long', day: 'numeric'
    };
    fechaHoyEl.textContent = ahora.toLocaleDateString('es-ES', optFecha);
  }
  updateDateTime();
  setInterval(updateDateTime, 1000);

  // 2) Leer params
  const params    = new URLSearchParams(window.location.search);
  const idMateria = parseInt(params.get('materia'), 10);
  const idGrado   = parseInt(params.get('grado'),   10);
  const idSeccion = parseInt(params.get('seccion'), 10);
  const idDoc     = parseInt(localStorage.getItem('id_usuario'), 10);

  if (!idDoc || !idMateria || !idGrado || !idSeccion) {
    return alert('Faltan datos de materia/grado/sección o no has iniciado sesión.');
  }

  try {
    // 3) Traer horarios del docente
    const resHor  = await fetch(`${API_URL}/horarios/docente/${idDoc}`);
    const dataHor = await resHor.json();
    if (!dataHor.success) throw new Error('No se pudieron cargar horarios');

    // 4) Buscar la sesión activa
    const ahora   = new Date();
    const hh      = String(ahora.getHours()).padStart(2,'0');
    const mm      = String(ahora.getMinutes()).padStart(2,'0');
    const horaStr = `${hh}:${mm}`;
    const dias    = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
    const hoyDia  = dias[ahora.getDay()];

    const sesion = dataHor.horarios.find(h =>
      h.dia_semana  === hoyDia &&
      parseInt(h.id_materia, 10) === idMateria &&
      parseInt(h.id_grado,   10) === idGrado &&
      parseInt(h.id_seccion, 10) === idSeccion &&
      horaStr >= h.hora_inicio &&
      horaStr <= h.hora_fin
    );

    if (!sesion) {
      mensajeFuera.classList.remove('d-none');
      mensajeFuera.textContent = `No estás en la franja de esta clase (${hoyDia} ${horaStr}).`;
      return;
    }

    // 5) Mostrar formulario y ocultar mensaje
    formAsis.classList.remove('d-none');
    mensajeFuera.classList.add('d-none');

    // 6) Traer alumnos activos
    const urlAl = (
      `${API_URL}/alumnos/por-materia`
      + `?materia=${idMateria}`
      + `&grado=${sesion.id_grado}`
      + `&seccion=${encodeURIComponent(sesion.id_seccion)}`
    );
    const resAl  = await fetch(urlAl);
    const dataAl = await resAl.json();
    if (!dataAl.success) throw new Error('No hay alumnos o error al cargarlos');

    // **AQUÍ** definimos la variable alumnos
    const alumnos = dataAl.alumnos;

    // 7) Traer asistencias ya registradas hoy
    const fechaISO = ahora.toISOString().slice(0,10);
    const resAs    = await fetch(
      `${API_URL}/asistencias/horario/${sesion.id_horario}?fecha=${fechaISO}`
    );
    const dAs      = await resAs.json();
    const mapAs    = {};
    if (dAs.success) {
      dAs.asistencias.forEach(a => { mapAs[a.id_alumno] = a.estado; });
    }

    // 8) Pintar tabla: un <td> por radio
    tblAsis.innerHTML = '';
    alumnos.forEach((al, idx) => {
      const prev = mapAs[al.id_alumno] || 'F';
      const name = `asis_${al.id_alumno}`;

      const tr = document.createElement('tr');

      // índice
      tr.innerHTML += `<td>${idx+1}</td>`;
      // nombre
      tr.innerHTML += `<td>${al.nombres} ${al.apellido_paterno} ${al.apellido_materno}</td>`;
      // falta
      tr.innerHTML += `
        <td><input type="radio" name="${name}" value="F" ${prev==='F'?'checked':''}></td>
      `;
      // tardanza
      tr.innerHTML += `
        <td><input type="radio" name="${name}" value="T" ${prev==='T'?'checked':''}></td>
      `;
      // presente
      tr.innerHTML += `
        <td><input type="radio" name="${name}" value="P" ${prev==='P'?'checked':''}></td>
      `;

      tblAsis.appendChild(tr);
    });

    // 9) Enviar asistencias
    formAsis.addEventListener('submit', async e => {
      e.preventDefault();
      const filas = Array.from(tblAsis.querySelectorAll('tr'));
      const regs  = filas.map(row => {
        const anyRadio = row.querySelector('input[type="radio"]');
        const idAl     = +anyRadio.name.split('_')[1];
        const val      = row.querySelector(`input[name="asis_${idAl}"]:checked`).value;
        return {
          id_alumno: idAl,
          falta:     val==='F'?1:0,
          tardanza:  val==='T'?1:0,
          presente:  val==='P'?1:0
        };
      });

      const resp = await fetch(`${API_URL}/asistencias`, {
        method:  'POST',
        headers: {'Content-Type':'application/json'},
        body:    JSON.stringify({
          horario_id: sesion.id_horario,
          fecha:      fechaISO,
          registros:  regs
        })
      });
      const jd = await resp.json();
      if (jd.success) {
        alert('Asistencia guardada correctamente');
      } else {
        alert('Error al guardar asistencia: ' + jd.message);
      }
    });

  } catch (err) {
    console.error('Error en marcar_asistencia.js:', err);
    mensajeFuera.classList.remove('d-none');
    mensajeFuera.textContent = 'Ocurrió un error cargando la asistencia.';
  }
});
