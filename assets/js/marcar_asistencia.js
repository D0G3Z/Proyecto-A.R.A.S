// assets/js/marcar_asistencia.js

document.addEventListener('DOMContentLoaded', async () => {
  const API_URL       = 'http://localhost:3000/api';
  const debugHoraEl   = document.getElementById('debugHoraActual');
  const debugDiaEl    = document.getElementById('debugDiaHoy');
  const debugFranjaEl = document.getElementById('debugFranja');
  const debugSesionEl = document.getElementById('debugSesion');
  const mensajeFuera  = document.getElementById('mensajeFuera');
  const formAsis      = document.getElementById('formAsistencia');
  const tblAsis       = document.getElementById('tblAsistencias');

  // 1) Leer parámetros de URL
  const params     = new URLSearchParams(window.location.search);
  const idMateria  = parseInt(params.get('materia'), 10);
  const idGrado    = parseInt(params.get('grado'),   10);
  const idSeccion  = parseInt(params.get('seccion'), 10);
  const idDocente  = parseInt(localStorage.getItem('id_usuario'), 10);

  if (!idDocente || !idMateria || !idGrado || !idSeccion) {
    return alert('Faltan datos de materia, grado o sección, o no has iniciado sesión.');
  }

  // 2) Hora y día actuales
  const ahora   = new Date();
  const hh      = String(ahora.getHours()).padStart(2,'0');
  const mm      = String(ahora.getMinutes()).padStart(2,'0');
  const horaStr = `${hh}:${mm}`;
  const dias    = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
  const hoyDia  = dias[ahora.getDay()];

  // Rellenar debug
  debugHoraEl.textContent   = horaStr;
  debugDiaEl.textContent    = hoyDia;

  try {
    // 3) Traer todos los horarios del docente, incluyendo IDs
    const resHor  = await fetch(`${API_URL}/horarios/docente/${idDocente}`);
    const dataHor = await resHor.json();
    if (!dataHor.success) throw new Error('No se pudieron cargar horarios');

    // 4) Buscar la sesión que encaje con materia, grado, sección, día y hora
    const sesion = dataHor.horarios.find(h =>
      h.dia_semana  === hoyDia &&
      // convertir a número en caso de venir como string
      parseInt(h.id_materia,10) === idMateria &&
      parseInt(h.id_grado,  10) === idGrado &&
      parseInt(h.id_seccion,10) === idSeccion &&
      horaStr >= h.hora_inicio &&
      horaStr <= h.hora_fin
    );

    if (!sesion) {
      // Fuera de franja → mensaje y salir
      mensajeFuera.style.display = 'block';
      mensajeFuera.textContent    = `No estás en la franja de esta clase (${hoyDia} ${horaStr}).`;
      debugFranjaEl.textContent   = '—';
      debugSesionEl.textContent   = 'ninguna';
      return;
    }

    // Dentro de la franja → mostrar form
    debugFranjaEl.textContent = `${sesion.hora_inicio} → ${sesion.hora_fin}`;
    debugSesionEl.textContent = 'encontrada';
    formAsis.style.display     = 'block';

    // 5) Traer alumnos activos de esta materia/grado/sección
    const idGradoReal   = sesion.id_grado;
    const idSeccionReal = sesion.id_seccion;
    const urlAl = `${API_URL}/alumnos/por-materia`
                + `?materia=${idMateria}`
                + `&grado=${idGradoReal}`
                + `&seccion=${encodeURIComponent(idSeccionReal)}`;
    const resAl = await fetch(urlAl);
    const dataAl = await resAl.json();
    if (!dataAl.success) throw new Error('No hay alumnos o error al cargarlos');

    // 6) Rellenar la tabla de asistencias
    tblAsis.innerHTML = '';
    dataAl.alumnos.forEach((al, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${idx + 1}</td>
        <td>${al.nombres} ${al.apellido_paterno} ${al.apellido_materno}</td>
        <td><input type="radio"
              name="asis_${al.id_alumno}"
              value="falta"
              checked></td>
        <td><input type="radio"
                  name="asis_${al.id_alumno}"
                  value="tardanza"></td>
        <td><input type="radio"
                  name="asis_${al.id_alumno}"
                  value="presente"></td>
      `;
      tblAsis.appendChild(tr);
    });

    // 7) Manejar envío de asistencia
    formAsis.addEventListener('submit', async e => {
      e.preventDefault();

      const filas     = Array.from(tblAsis.querySelectorAll('tr'));
      const registros = filas.map(row => {
      const idAl = parseInt(row.querySelector('input[type="radio"]').name.split('_')[1], 10);
      const estado = row.querySelector(`input[name="asis_${idAl}"]:checked`).value;
      return {
        id_alumno: idAl,
        falta:     estado === 'falta'    ? 1 : 0,
        tardanza:  estado === 'tardanza' ? 1 : 0,
        presente:  estado === 'presente' ? 1 : 0
      };
    });

      // Aquí iría tu fetch para guardar la asistencia:
      // await fetch(`${API_URL}/asistencias`, { method:'POST', headers:{...}, body:JSON.stringify({ horario_id: sesion.id_horario, registros }) });

      console.log('Asistencia lista para enviar:', { horario_id: sesion.id_horario, registros });
      alert('Asistencia preparada (ver consola).');
    });

  } catch (err) {
    console.error('Error en marcar_asistencia.js:', err);
    mensajeFuera.style.display = 'block';
    mensajeFuera.textContent    = 'Ocurrió un error cargando la asistencia.';
  }
});
