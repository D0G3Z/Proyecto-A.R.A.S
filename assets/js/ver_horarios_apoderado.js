document.addEventListener('DOMContentLoaded', async () => {
  const API       = 'http://localhost:3000/api';
  const apoderado = localStorage.getItem('id_usuario');
  if (!apoderado) {
    alert('Falta información de sesión.');
    return;
  }

  const selHijo = document.getElementById('selHijo');
  const tbody   = document.querySelector('#tablaHorariosApod tbody');

  // Franjas horarias y días configurables
  const FRANJAS = [
    '07:30 - 08:15','08:15 - 09:00','09:00 - 09:45','09:45 - 10:30',
    '10:30 - 10:45','10:45 - 11:30','11:30 - 12:15','12:15 - 12:35',
    '12:35 - 13:20','13:20 - 14:05'
  ];
  const DIAS = ['Lunes','Martes','Miércoles','Jueves','Viernes'];
  const RECREOS = new Set(['10:30 - 10:45','12:15 - 12:35']);

  // Convierte "HH:mm" en minutos para cálculos
  function timeToMinutes(t) {
    const [h, m] = t.split(':').map(x => parseInt(x, 10));
    return h * 60 + m;
  }

  let currentAlumno = null;

  // 1) Carga la lista de hijos del apoderado
  async function cargaHijos() {
    try {
      const res = await fetch(`${API}/apoderados/${apoderado}/hijos`);
      const jd  = await res.json();
      if (!jd.success) throw new Error(jd.message);
      // Llena el select con las opciones
      selHijo.innerHTML = jd.hijos.map(h =>
        `<option value="${h.id_alumno}">${h.nombre}</option>`
      ).join('');
      currentAlumno = jd.hijos[0]?.id_alumno;
    } catch (err) {
      console.error('Error al obtener hijos:', err);
      alert('Error al obtener lista de hijos.');
    }
  }

  selHijo.addEventListener('change', () => {
    currentAlumno = selHijo.value;
    cargaHorariosSemanal();
  });

  // 2) Dibuja el horario semanal completo
  async function cargaHorariosSemanal() {
    // Mensaje de carga
    tbody.innerHTML = '<tr><td colspan="6" class="text-center">Cargando…</td></tr>';
    if (!currentAlumno) return;

    try {
      const res = await fetch(
        `${API}/apoderados/${apoderado}/horarios-semanal?alumno=${currentAlumno}`
      );
      const jd = await res.json();
      if (!jd.success) throw new Error(jd.message);
      const horarios = jd.horarios;

      // Contador para rowspan por día
      const saltos = {};
      DIAS.forEach(d => saltos[d] = 0);

      // Limpia tabla
      tbody.innerHTML = '';
      // Crea cada fila por franja
      FRANJAS.forEach(slot => {
        const [ini, fin] = slot.split(' - ');
        const tr = document.createElement('tr');
        // Celda de la franja horaria
        const tdTime = document.createElement('td');
        tdTime.textContent = slot;
        tdTime.classList.add('text-center','align-middle');
        tr.appendChild(tdTime);

        DIAS.forEach(dia => {
          // Si es recreo, color especial
          if (RECREOS.has(slot)) {
            const td = document.createElement('td');
            td.textContent = 'Recreo';
            td.classList.add('celda-recreo','bg-warning','text-dark','fw-bold','text-center','align-middle');
            tr.appendChild(td);
            return;
          }
          // Si hay rowspan activo, agrega celda vacía
          if (saltos[dia] > 0) {
            saltos[dia]--;
            const td = document.createElement('td');
            td.classList.add('text-center','align-middle');
            return;
          }
          // Busca clase para este día y hora de inicio
          const cls = horarios.find(h =>
            h.dia_semana === dia &&
            timeToMinutes(h.hora_inicio) === timeToMinutes(ini)
          );
          if (cls) {
            const dur   = timeToMinutes(cls.hora_fin) - timeToMinutes(cls.hora_inicio);
            const filas = Math.round(dur / 45);
            const td    = document.createElement('td');
            td.rowSpan = filas;
            td.innerHTML = `<strong>${cls.curso}</strong>`;
            td.classList.add('text-center','align-middle');
            tr.appendChild(td);
            saltos[dia] = filas - 1;
          } else {
            const td = document.createElement('td');
            td.classList.add('text-center','align-middle');
            tr.appendChild(td);
          }
        });
        tbody.appendChild(tr);
      });
    } catch (err) {
      console.error('Error al cargar horario semanal:', err);
      tbody.innerHTML = '<tr><td colspan="6" class="text-center text-danger">Error al cargar horario.</td></tr>';
    }
  }

  // Inicializa
  await cargaHijos();
  cargaHorariosSemanal();
});
