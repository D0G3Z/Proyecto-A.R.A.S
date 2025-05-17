document.addEventListener('DOMContentLoaded', async () => {
  const API_URL = 'http://localhost:3000/api';
  const params = new URLSearchParams(window.location.search);
  const idMateria = params.get('materia');
  const idGrado = params.get('grado');
  const seccion = params.get('seccion');

  if (!idMateria || !idGrado || !seccion) {
    return alert('Faltan parámetros materia/grado/sección en la URL');
  }

  const tabla = document.getElementById('tablaAlumnos');
  tabla.innerHTML = `<tr><td colspan="6" class="text-center">Cargando...</td></tr>`;

  try {
    // 1) Fetch alumnos
    const resAl = await fetch(
      `${API_URL}/alumnos/por-materia?materia=${idMateria}` +
      `&grado=${idGrado}&seccion=${encodeURIComponent(seccion)}`
    );
    const dataAl = await resAl.json();
    console.log('Respuesta alumnos:', dataAl);
    if (!dataAl.success) throw new Error(dataAl.message);
    const alumnos = dataAl.alumnos;
    console.log('Alumnos array:', alumnos);

    // 2) Fetch promedios para cada bimestre en paralelo
    const promPromises = [1,2,3,4].map(bi =>
      fetch(
        `${API_URL}/notas/bimestre?materia=${idMateria}` +
        `&grado=${idGrado}&seccion=${encodeURIComponent(seccion)}` +
        `&bimestre=${bi}`
      ).then(r => r.json())
    );
    const promResults = await Promise.all(promPromises);
    console.log('Resultados promResults:', promResults);

    // Mapear por bimestre: promMaps[bi] = { id_matricula: promedio }
    const promMaps = {};
    promResults.forEach((jr, idx) => {
      const bi = idx + 1;
      promMaps[bi] = {};
      if (jr.success) {
        jr.data.forEach(item => {
          promMaps[bi][item.id_matricula] = Math.round(item.promedio);
        });
      }
    });
    console.log('Mapas de promedios por bimestre:', promMaps);

    // 3) Render tabla
    tabla.innerHTML = '';
    alumnos.forEach((a, idx) => {
      const idMat = a.id_matricula;
      const nombre = `${a.nombres} ${a.apellido_paterno} ${a.apellido_materno}`;
      console.log(`Alumno ${idMat} ${nombre} ->`, {
        b1: promMaps[1][idMat],
        b2: promMaps[2][idMat],
        b3: promMaps[3][idMat],
        b4: promMaps[4][idMat],
      });
      tabla.insertAdjacentHTML('beforeend', `
        <tr>
          <td>${idx+1}</td>
          <td>${nombre}</td>
          <td>${promMaps[1][idMat] ?? '-'}</td>
          <td>${promMaps[2][idMat] ?? '-'}</td>
          <td>${promMaps[3][idMat] ?? '-'}</td>
          <td>${promMaps[4][idMat] ?? '-'}</td>
        </tr>
      `);
    });

  } catch (err) {
    console.error('Error en ver_alumnos.js:', err);
    tabla.innerHTML = `<tr><td colspan="6" class="text-center text-danger">Error al cargar datos.</td></tr>`;
  }
});
