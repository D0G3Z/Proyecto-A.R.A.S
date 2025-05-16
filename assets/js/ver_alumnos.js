document.addEventListener('DOMContentLoaded', async () => {
  const API_URL = 'http://localhost:3000/api';
  const params  = new URLSearchParams(window.location.search);
  const id_materia = params.get('materia');
  const id_grado   = params.get('grado');
  const seccion    = params.get('seccion');

  if (!id_materia || !id_grado || !seccion) {
    return alert('Faltan parámetros materia/grado/sección en la URL');
  }

  try {
    const res  = await fetch(
      `${API_URL}/alumnos/por-materia?materia=${id_materia}` +
      `&grado=${id_grado}&seccion=${encodeURIComponent(seccion)}`
    );
    const data = await res.json();

    const tabla = document.getElementById('tablaAlumnos');
    tabla.innerHTML = ''; // limpia antes

    if (data.success && data.alumnos.length > 0) {
      data.alumnos.forEach((a, idx) => {
        tabla.insertAdjacentHTML('beforeend', `
          <tr>
            <td style="text-align:center;">${idx + 1}</td>
            <td>${a.nombres} ${a.apellido_paterno} ${a.apellido_materno}</td>
          </tr>
        `);
      });
    } else {
      tabla.innerHTML = `
        <tr>
          <td colspan="2" style="text-align:center;">
            No hay alumnos activos en esta materia/grado/sección.
          </td>
        </tr>`;
    }
  } catch (err) {
    console.error('Error en getAlumnosPorMateria:', err);
    alert('Error al cargar la lista de alumnos.');
  }
});
