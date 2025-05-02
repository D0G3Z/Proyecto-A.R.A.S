document.addEventListener('DOMContentLoaded', async () => {
  const API_URL   = 'http://localhost:3000/api';
  const idDocente = localStorage.getItem('id_usuario');
  const tabla     = document.getElementById('tablaHorarios');

  if (!idDocente) {
    alert('No se encontró el ID del docente. Por favor, inicie sesión.');
    return;
  }

  // Helper: convierte "HH:mm" → minutos
  function timeToMinutes(t) {
    const [h, m] = t.split(':').map(x => parseInt(x, 10));
    return h * 60 + m;
  }

  // Franjas y recreos
  const HORAS = [
    '07:30 - 08:15','08:15 - 09:00','09:00 - 09:45','09:45 - 10:30',
    '10:30 - 10:45', // recreo
    '10:45 - 11:30','11:30 - 12:15',
    '12:15 - 12:35', // recreo
    '12:35 - 13:20','13:20 - 14:05'
  ];
  const RECREOS = new Set(['10:30 - 10:45','12:15 - 12:35']);
  const DIAS    = ['Lunes','Martes','Miércoles','Jueves','Viernes'];

  // 1) Traer horarios del docente
  let horarios = [];
  try {
    const res  = await fetch(`${API_URL}/horarios/docente/${idDocente}`);
    const data = await res.json();
    if (data.success) horarios = data.horarios;
    else throw new Error('Sin datos de horario');
  } catch (err) {
    console.error(err);
    return alert('Error al obtener los horarios del docente.');
  }

  // 2) Creamos un contador para "saltar" filas en cada columna (día)
  const saltos = {};
  DIAS.forEach(d => saltos[d] = 0);

  // 3) Pintamos la tabla
  tabla.innerHTML = '';
  for (let i = 0; i < HORAS.length; i++) {
    const slot = HORAS[i];
    const [inicio, fin] = slot.split(' - ');
    const tr = document.createElement('tr');

    // 3.1 Columna de la franja horaria
    const tdHora = document.createElement('td');
    tdHora.textContent = slot;
    tr.appendChild(tdHora);

    // 3.2 Para cada día
    DIAS.forEach(dia => {
      // si debemos saltar esta celda porque un rowspan anterior la cubre
      if (saltos[dia] > 0) {
        saltos[dia]--;
        return; // NO añadimos <td>
      }

      // recreo
      if (RECREOS.has(slot)) {
        const td = document.createElement('td');
        td.textContent = 'Recreo';
        td.classList.add('celda-recreo');
        tr.appendChild(td);
        return;
      }

      // buscamos un curso que COMIENCE en esta franja
      const clase = horarios.find(h =>
        h.dia_semana === dia &&
        timeToMinutes(h.hora_inicio) === timeToMinutes(inicio)
      );

      if (clase) {
        // calculamos cuántas franjas ocupa (each 45 min slot)
        const dur = timeToMinutes(clase.hora_fin) - timeToMinutes(clase.hora_inicio);
        const filas = Math.round(dur / 45);

        const td = document.createElement('td');
        td.rowSpan = filas;
        // materia + detalle
        const nivelAbbr = clase.nivel === 1 ? 'Prim.' : 'Sec.';
        td.innerHTML = `
          <div><strong>${clase.materia}</strong></div>
          <div class="detalle-curso">${nivelAbbr} ${clase.grado} ${clase.seccion}</div>
        `;
        tr.appendChild(td);

        // marcamos para saltar las siguientes (filas − 1) franjas
        saltos[dia] = filas - 1;
      } else {
        // no hay clase → celda vacía
        const td = document.createElement('td');
        tr.appendChild(td);
      }
    });

    tabla.appendChild(tr);
  }
});
