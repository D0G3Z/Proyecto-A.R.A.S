document.addEventListener('DOMContentLoaded', () => {
  const API_URL      = 'http://localhost:3000/api';
  const params       = new URLSearchParams(window.location.search);
  const idAsignacion = parseInt(params.get('asignacion'), 10);
  const idMateria    = parseInt(params.get('materia'),    10);
  const idGrado      = parseInt(params.get('grado'),      10);
  const idSeccion    = params.get('seccion');
  const displayCurso = params.get('display') || '';

  // Elementos del DOM
  const cursoTitulo  = document.getElementById('cursoTitulo');
  const asignTitulo  = document.getElementById('asignacionTitulo');
  const bodyCal      = document.getElementById('bodyCalificaciones');
  const formCal      = document.getElementById('formCalificaciones');
  const btnVolver    = document.getElementById('btnVolver');

  // Configurar botón Volver solo si existe
  cursoTitulo.textContent = displayCurso;
  if (btnVolver) {
    btnVolver.addEventListener('click', () => window.history.back());
  }

  let students = [];
  let califsMap = {};

  // Cargar datos de la asignación
  fetch(`${API_URL}/asignaciones/${idAsignacion}`)
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        asignTitulo.textContent = data.asignacion.descripcion;
      } else {
        console.error('API:', data.message);
        asignTitulo.textContent = 'Error al cargar asignación';
      }
    })
    .catch(err => {
      console.error('Error fetching asignación:', err);
      asignTitulo.textContent = 'Error al cargar asignación';
    });

  // Obtener alumnos y calificaciones
  async function fetchStudents() {
    const res = await fetch(
      `${API_URL}/alumnos/por-materia?materia=${idMateria}` +
      `&grado=${idGrado}&seccion=${encodeURIComponent(idSeccion)}`
    );
    const jd = await res.json();
    if (!jd.success) throw new Error(jd.message);
    students = jd.alumnos.map(a => ({
      id_matricula:     a.id_matricula,
      nombres:          a.nombres,
      apellido_paterno: a.apellido_paterno,
      apellido_materno: a.apellido_materno
    }));
  }

  async function fetchCalifs() {
    const res = await fetch(`${API_URL}/calificaciones?asignacion=${idAsignacion}`);
    const jd  = await res.json();
    if (!jd.success) throw new Error(jd.message);
    jd.calificaciones.forEach(c => {
      califsMap[c.id_matricula] = c.nota;
    });
  }

  // Renderizar tabla de notas
  async function renderTable() {
    try {
      await fetchStudents();
      await fetchCalifs();
      bodyCal.innerHTML = '';
      students.forEach((s, idx) => {
        const notaVal = califsMap[s.id_matricula] ?? '';
        bodyCal.insertAdjacentHTML('beforeend', `
          <tr>
            <td>${idx + 1}</td>
            <td>${s.nombres} ${s.apellido_paterno} ${s.apellido_materno}</td>
            <td>
              <input type="number" step="1" min="0" max="20"
                     name="nota_${s.id_matricula}"
                     value="${notaVal}"
                     class="form-control form-control-sm" />
            </td>
          </tr>
        `);
      });
    } catch (err) {
      console.error('Error al renderizar tabla:', err);
      bodyCal.innerHTML = `
        <tr>
          <td colspan="3" class="text-center text-danger">
            Error al cargar estudiantes o calificaciones.
          </td>
        </tr>`;
    }
  }

  // Guardar calificaciones
  formCal.addEventListener('submit', async e => {
    e.preventDefault();
    const payload = [];
    students.forEach(s => {
      const input = formCal.querySelector(`input[name="nota_${s.id_matricula}"]`);
      if (input && input.value !== '') {
        const val = parseInt(input.value, 10);
        if (isNaN(val) || val < 0 || val > 20) {
          throw new Error(`Nota inválida para matrícula ${s.id_matricula}`);
        }
        payload.push({ id_asignacion: idAsignacion, id_matricula: s.id_matricula, nota: val });
      }
    });
    try {
      const resp = await fetch(`${API_URL}/calificaciones/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ calificaciones: payload })
      });
      const jd = await resp.json();
      if (!jd.success) throw new Error(jd.message);
      alert('Calificaciones guardadas exitosamente.');
    } catch (err) {
      console.error('Error al guardar calificaciones:', err);
      alert('Error al guardar calificaciones: ' + err.message);
    }
  });

  renderTable();
});