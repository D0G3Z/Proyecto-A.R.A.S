// assets/js/asignar_tarea.js
document.addEventListener('DOMContentLoaded', () => {
  const API_URL = 'http://localhost:3000/api';
  const params  = new URLSearchParams(window.location.search);
  const idMateria   = params.get('materia');
  const idGrado     = params.get('grado');
  const idSeccion   = params.get('seccion');
  // opcional: nombre a mostrar (p.ej. "Inglés 1ro A")
  const displayCurso = params.get('display') || '-';

  // Referencias DOM
    const tablaTareas   = document.getElementById('tablaTareas');
    const formTarea     = document.getElementById('formTarea');
    const descInput     = document.getElementById('descripcion');
    const fechaInput = document.getElementById('fechaEntrega');
    const ahora = new Date();
    const dosCifras = n => String(n).padStart(2,'0');
    const yyyy = ahora.getFullYear();
    const mm   = dosCifras(ahora.getMonth()+1);
    const dd   = dosCifras(ahora.getDate());
    const hh   = dosCifras(ahora.getHours());
    const min  = dosCifras(ahora.getMinutes());
    fechaInput.min = `${yyyy}-${mm}-${dd}T${hh}:${min}`;

  // Mostrar nombre del curso
  document.getElementById('tituloMateria').textContent = displayCurso;

  // Función para recargar la lista de tareas
  async function cargarTareas() {
    try {
      const res  = await fetch(
        `${API_URL}/tareas?materia=${idMateria}` +
        `&grado=${idGrado}&seccion=${encodeURIComponent(idSeccion)}`
      );
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Error al cargar tareas');
      tablaTareas.innerHTML = '';

      data.tareas.forEach(t => {
        tablaTareas.insertAdjacentHTML('beforeend', `
          <tr>
            <td>${t.descripcion}</td>
            <td>${t.fecha_entrega}</td>
            <td>${t.estado}</td>
            <td>
              <button class="btn btn-sm btn-danger eliminar" data-id="${t.id_tarea}">
                🗑️
              </button>
            </td>
          </tr>
        `);
      });

      // Asociar eventos de eliminar
      document.querySelectorAll('.eliminar').forEach(btn => {
        btn.addEventListener('click', async () => {
          if (!confirm('¿Eliminar esta tarea?')) return;
          const id = btn.dataset.id;
          const resp = await fetch(`${API_URL}/tareas/${id}`, { method: 'DELETE' });
          const result = await resp.json();
          if (result.success) cargarTareas();
          else alert('Error al eliminar: ' + result.message);
        });
      });

    } catch (err) {
      console.error(err);
      tablaTareas.innerHTML = `
        <tr><td colspan="4" class="text-center text-danger">
          Error cargando tareas
        </td></tr>`;
    }
  }

  // Manejar envío de nueva tarea
  formTarea.addEventListener('submit', async e => {
    e.preventDefault();
    const descripcion   = descInput.value.trim();
    const fecha_entrega = fechaInput.value;
    if (!descripcion || !fecha_entrega) {
      return alert('Completa descripción y fecha de entrega.');
    }
    try {
      const resp = await fetch(`${API_URL}/tareas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_materia:   parseInt(idMateria, 10),
          id_grado:     parseInt(idGrado,   10),
          id_seccion:   idSeccion,
          descripcion,
          fecha_entrega
        })
      });
      const result = await resp.json();
      if (result.success) {
        descInput.value  = '';
        fechaInput.value = '';
        cargarTareas();
      } else {
        alert('Error: ' + result.message);
      }
    } catch (err) {
      console.error(err);
      alert('Error guardando la tarea.');
    }
  });

  // Inicializar
  cargarTareas();
});
