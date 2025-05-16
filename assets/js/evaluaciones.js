document.addEventListener('DOMContentLoaded', () => {
  const API_URL          = 'http://localhost:3000/api';
  const params           = new URLSearchParams(window.location.search);
  const idMateria        = parseInt(params.get('materia'), 10);
  const idGrado          = parseInt(params.get('grado'),   10);
  const idSeccion        = parseInt(params.get('seccion'), 10);
  const displayCurso     = params.get('display') || '';

  const cursoTitulo      = document.getElementById('cursoTitulo');
  const filtroTipoEl     = document.getElementById('filtroTipo');
  const btnNuevaEval     = document.getElementById('btnCrearAsignacion');
  const bodyAsignaciones = document.getElementById('bodyAsignaciones');

  cursoTitulo.textContent = displayCurso;

  async function cargaAsignaciones(tipo = '') {
    try {
      let url = `${API_URL}/asignaciones?materia=${idMateria}&grado=${idGrado}&seccion=${idSeccion}`;
      if (tipo) url += `&tipo=${tipo}`;

      const res  = await fetch(url);
      const jd   = await res.json();
      if (!jd.success) throw new Error(jd.message);

      bodyAsignaciones.innerHTML = '';
      jd.asignaciones.forEach((a, idx) => {
        bodyAsignaciones.insertAdjacentHTML('beforeend', `
          <tr>
            <td>${idx + 1}</td>
            <td>${a.descripcion}</td>
            <td>${a.tipo}</td>
            <td>${a.fecha_entrega}</td>
            <td>
              <button class="btn btn-sm btn-primary editar"    data-id="${a.id_asignacion}">✏️</button>
              <button class="btn btn-sm btn-success calificar" data-id="${a.id_asignacion}">📋</button>
              <button class="btn btn-sm btn-danger eliminar"   data-id="${a.id_asignacion}">🗑️</button>
            </td>
          </tr>
        `);
      });

      document.querySelectorAll('.eliminar').forEach(btn =>
        btn.addEventListener('click', async () => {
          if (!confirm('¿Seguro de borrar esta evaluación?')) return;
          const id = btn.dataset.id;
          const resp = await fetch(`${API_URL}/asignaciones/${id}`, { method: 'DELETE' });
          const respJ= await resp.json();
          if (respJ.success) cargaAsignaciones(filtroTipoEl.value);
          else alert('Error al eliminar: ' + respJ.message);
        })
      );

      document.querySelectorAll('.editar').forEach(btn =>
        btn.addEventListener('click', () => {
          const id = btn.dataset.id;
          window.location.href = `asignar_tarea.html?id=${id}` +
                                 `&materia=${idMateria}&grado=${idGrado}&seccion=${idSeccion}` +
                                 `&display=${encodeURIComponent(displayCurso)}`;
        })
      );

      document.querySelectorAll('.calificar').forEach(btn =>
        btn.addEventListener('click', () => {
          const id = btn.dataset.id;
          window.location.href = `calificar.html?asignacion=${id}` +
                                 `&materia=${idMateria}&grado=${idGrado}&seccion=${idSeccion}` +
                                 `&display=${encodeURIComponent(displayCurso)}`;
        })
      );

    } catch (err) {
      console.error('Error al cargar asignaciones:', err);
      bodyAsignaciones.innerHTML = `
        <tr>
          <td colspan="5" class="text-center text-danger">
            Error al cargar las evaluaciones/tareas.
          </td>
        </tr>`;
    }
  }

  filtroTipoEl.addEventListener('change', () => cargaAsignaciones(filtroTipoEl.value));

  btnNuevaEval.addEventListener('click', () => {
    window.location.href = `asignar_tarea.html?materia=${idMateria}` +
                           `&grado=${idGrado}&seccion=${idSeccion}` +
                           `&display=${encodeURIComponent(displayCurso)}`;
  });

  cargaAsignaciones();
});