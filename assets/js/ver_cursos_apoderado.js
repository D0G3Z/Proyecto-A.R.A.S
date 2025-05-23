// assets/js/ver_cursos_apoderado.js
document.addEventListener('DOMContentLoaded', async () => {
  const API       = 'http://localhost:3000/api';
  const apoderado = localStorage.getItem('id_usuario');
  if (!apoderado) return alert('Falta información de sesión.');

  const selHijo       = document.getElementById('selHijo');
  const contCursos    = document.getElementById('cursosContainer');
  let currentAlumno   = null;

  // 1) Cargo lista de hijos
  async function cargaHijos() {
    const res = await fetch(`${API}/apoderados/${apoderado}/hijos`);
    const jd  = await res.json();
    if (!jd.success) return alert('Error al obtener hijos.');
    selHijo.innerHTML = jd.hijos
      .map(h => `<option value="${h.id_alumno}">${h.nombre}</option>`)
      .join('');
    currentAlumno = jd.hijos[0]?.id_alumno;
  }

  selHijo.addEventListener('change', () => {
    currentAlumno = selHijo.value;
    renderCursos();
  });

  // 2) Traigo y renderizo cursos + tareas + asistencias
  async function renderCursos() {
    contCursos.innerHTML = `<p>Cargando…</p>`;
    if (!currentAlumno) return;
    // 2.1) cursos del alumno
    const res1 = await fetch(`${API}/apoderados/${apoderado}/cursos?alumno=${currentAlumno}`);
    const j1   = await res1.json();
    if (!j1.success) {
        return contCursos.innerHTML = `<p class="text-danger">Error al cargar cursos.</p>`;
    }

    if (j1.cursos.length === 0) {
      contCursos.innerHTML = `<p>No hay cursos asignados.</p>`;
      return;
    }

    // **Deduplicar cursos por id_materia**
    const cursosUnicos = Array.from(
        new Map(j1.cursos.map(c => [c.id_materia, c])).values()
    );

    // y luego iteras sobre `cursosUnicos` en lugar de `j1.cursos`:
    contCursos.innerHTML = '';
    for (let c of cursosUnicos) {
    const tarjeta = document.createElement('div');
    tarjeta.className = 'card mb-4 shadow-sm';
    tarjeta.innerHTML = `
        <div class="card-header bg-azul1 text-ecf0f1">
        <h5 class="mb-0">${c.curso}</h5>
        </div>
        <div class="card-body">
        <h6>Tareas / Notas</h6>
        <ul class="list-group mb-3" id="tareas-${c.id_materia}">
            <li class="list-group-item">Cargando…</li>
        </ul>
        <h6>Asistencia</h6>
        <ul class="list-group" id="asis-${c.id_materia}">
            <li class="list-group-item">Cargando…</li>
        </ul>
        </div>
    `;
    contCursos.appendChild(tarjeta);

      // 2.3) cargo tareas
      (async () => {
        const res2 = await fetch(
          `${API}/apoderados/${apoderado}/tareas?alumno=${currentAlumno}&materia=${c.id_materia}`
        );
        const j2 = await res2.json();
        const ulT = document.getElementById(`tareas-${c.id_materia}`);
        if (!j2.success) {
          ulT.innerHTML = `<li class="list-group-item text-danger">Error.</li>`;
        } else if (j2.tareas.length === 0) {
          ulT.innerHTML = `<li class="list-group-item">No hay tareas/notas.</li>`;
        } else {
          ulT.innerHTML = j2.tareas.map(t => `
            <li class="list-group-item d-flex justify-content-between">
              <span>${t.tarea} <small class="text-muted">(${t.fecha_entrega})</small></span>
              <span>${t.nota!==null? t.nota : '<em>-</em>'}</span>
            </li>
          `).join('');
        }
      })();

      // 2.4) cargo asistencias
      (async () => {
        const res3 = await fetch(
          `${API}/apoderados/${apoderado}/asistencias?alumno=${currentAlumno}&materia=${c.id_materia}`
        );
        const j3 = await res3.json();
        const ulA = document.getElementById(`asis-${c.id_materia}`);
        if (!j3.success) {
          ulA.innerHTML = `<li class="list-group-item text-danger">Error.</li>`;
        } else if (j3.asistencias.length === 0) {
          ulA.innerHTML = `<li class="list-group-item">No hay registros.</li>`;
        } else {
          ulA.innerHTML = j3.asistencias.map(a => `
            <li class="list-group-item d-flex justify-content-between">
              <span>${a.fecha}</span>
              <span>${a.estado === 'P' ? '✅' : '❌'}</span>
            </li>
          `).join('');
        }
      })();
    }
  }

  // arranca
  await cargaHijos();
  renderCursos();
});
