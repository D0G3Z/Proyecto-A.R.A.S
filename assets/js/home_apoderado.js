// assets/js/home_apoderado.js
document.addEventListener('DOMContentLoaded', () => {
  const API           = 'http://localhost:3000/api';
  const idApo     = localStorage.getItem('id_usuario');
  const selHijo    = document.getElementById('selHijo');
  const tablaHorarios = document.getElementById('tablaHorarios');
  const listaCursos   = document.getElementById('listaCursosApod');
  const listaHorarios = document.getElementById('listaHorariosApod');
  const btnHoy        = document.getElementById('btnHoy');
  const btnManana     = document.getElementById('btnManana');
  const btnVerEventos = document.getElementById('btnVerEventos');

  let currentAlumno = null;

  // 0) Si no hay id en storage, volver al login
  if (!idApo) {
    localStorage.clear();
    window.location.href = 'login.html';
    return;
  }

  // 1) Traer hijos
  async function cargaHijos() {
    try {
      const res = await fetch(`${API}/apoderados/${idApo}/hijos`);
      const { success, hijos } = await res.json();
      if (!success || !hijos.length) {
        selHijo.innerHTML = `<option disabled>No hay hijos</option>`;
        return;
      }
      selHijo.innerHTML = hijos
        .map(h => `<option value="${h.id_alumno}">${h.nombre}</option>`)
        .join('');
      currentAlumno = hijos[0].id_alumno;
    } catch (err) {
      console.error('Error al cargar hijos:', err);
      selHijo.innerHTML = `<option disabled>Error al cargar</option>`;
    }
  }



  selHijo.addEventListener('change', () => {
    currentAlumno = selHijo.value;
    localStorage.setItem('id_alumno', currentAlumno);
    cargaResumenCursos();
    // recarga horarios para hoy
    btnHoy.click();
  });

  // 2) Mis Cursos + Notas del bimestre actual
  async function cargaResumenCursos() {
  const tbody = document.getElementById('listaCursosApod');
  tbody.innerHTML = `
    <tr>
      <td colspan="3" class="text-center py-3">Cargando…</td>
    </tr>`;

  try {
    const res = await fetch(
      `${API}/apoderados/${idApo}/resumen-cursos?alumno=${currentAlumno}`
    );
    const { success, data } = await res.json();
    if (!success) throw new Error();

    if (data.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="3" class="text-center py-3">Sin cursos en este bimestre.</td>
        </tr>`;
      return;
    }

    // Generar una fila por cada curso
    tbody.innerHTML = data.map(c => `
      <tr>
        <td class="text-center"><strong>${c.curso}</strong></td>
        <td class="text-center">${c.faltas || 0}</td>
        <td class="text-center">${Math.round(c.promedio || 0)}</td>
      </tr>
    `).join('');

  } catch {
    tbody.innerHTML = `
      <tr>
        <td colspan="3" class="text-center text-danger py-3">
          Error al cargar datos.
        </td>
      </tr>`;
  }
}

  // 3) Mis Horarios (hoy/mañana)
  async function cargaHorarios(fechaYMD) {
    const cont = document.getElementById('listaHorariosApod');
    cont.innerHTML = '<div class="col-12 text-center">Cargando…</div>';
    try {
      const res = await fetch(`${API}/apoderados/${idApo}/horarios?dia=${fechaYMD}`);
      const jd  = await res.json();
      if (!jd.success) throw new Error(jd.message);

      const [yy, mm, dd] = fechaYMD.split('-').map(Number);
      const dt            = new Date(yy, mm - 1, dd);
      let diaTexto        = dt.toLocaleDateString('es-ES', { weekday: 'long' });
      diaTexto            = diaTexto[0].toUpperCase() + diaTexto.slice(1);

      if (jd.horarios.length === 0) {
        cont.innerHTML = `
          <div class="col-12 text-center">
            Clases para <strong>${diaTexto}</strong>:<br>
            No hay clases programadas.
          </div>`;
        return;
      }

        cont.innerHTML = `
        <div class="col-12 mb-2">
          <h6>Clases para <strong>${diaTexto}</strong>:</h6>
        </div>`;

      jd.horarios.forEach(h => {
        cont.insertAdjacentHTML('beforeend', `
          <div class="col-12 col-md-6">
            <div class="card shadow-sm mb-3">
              <div class="card-body p-3">
                <h5 class="card-title mb-1">${h.curso}</h5>
                <p class="card-text mb-0">
                  <i class="bi bi-clock"></i>
                  ${h.hora_inicio} – ${h.hora_fin}
                </p>
              </div>
            </div>
          </div>
        `);
      });

    } catch (err) {
      console.error('Error al cargar horarios:', err);
      cont.innerHTML = `
        <div class="col-12 text-danger text-center">
          Error al cargar horarios.
        </div>`;
    }
  }

  // Helpers para Hoy/Mañana
  function formatYMD(d) {
    const pad = x => String(x).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
  }
  btnHoy.addEventListener('click', () => {
    btnHoy.classList.add('active');
    btnManana.classList.remove('active');
    cargaHorarios(formatYMD(new Date()));
  });

  btnManana.addEventListener('click', () => {
    btnManana.classList.add('active');
    btnHoy.classList.remove('active');
    const man = new Date();
    man.setDate(man.getDate() + 1);
    cargaHorarios(formatYMD(man));
  });

  // 4) Calendario dinámico
  (function() {
    const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
    let fecha = new Date();
    const mesAnioEl   = document.getElementById('mesAnio');
    const calendarioEl= document.getElementById('calendarioApod');
    const btnPrev     = document.getElementById('prevMes');
    const btnNext     = document.getElementById('nextMes');

    function generar() {
      const año = fecha.getFullYear(), m = fecha.getMonth();
      mesAnioEl.textContent = `${meses[m]} ${año}`;
      const primerDia = new Date(año, m, 1).getDay(),
            diasMes   = new Date(año, m+1, 0).getDate();
      calendarioEl.innerHTML = '';
      let fila = document.createElement('tr');
      const offset = (primerDia + 6) % 7;  // lunes=0
      for (let i = 0; i < offset; i++) fila.appendChild(document.createElement('td'));
      for (let d = 1; d <= diasMes; d++) {
        if (fila.children.length === 7) {
          calendarioEl.appendChild(fila);
          fila = document.createElement('tr');
        }
        const celda = document.createElement('td');
        celda.textContent = d;
        const hoy = new Date();
        if (d === hoy.getDate() && m === hoy.getMonth() && año === hoy.getFullYear()) {
          celda.classList.add('bg-primary','text-white','rounded');
        }
        fila.appendChild(celda);
      }
      while (fila.children.length < 7) fila.appendChild(document.createElement('td'));
      calendarioEl.appendChild(fila);
    }

    btnPrev.addEventListener('click', () => { fecha.setMonth(fecha.getMonth() - 1); generar(); });
    btnNext.addEventListener('click', () => { fecha.setMonth(fecha.getMonth() + 1); generar(); });
    generar();
  })();

  // 5) Cerrar sesión
  document.getElementById('btnLogout')?.addEventListener('click', () => {
    localStorage.clear();
    window.location.href = 'login.html';
  });

    if (btnVerEventos) {
    btnVerEventos.addEventListener('click', (e) => {
      e.preventDefault();
      alert('Próxima funcionalidad: ver todos los eventos del calendario');
    });
  }

  // === Arrancar todo ===
  (async () => {
    await cargaHijos();
    await cargaResumenCursos();
    btnHoy.click();
  })();
});
