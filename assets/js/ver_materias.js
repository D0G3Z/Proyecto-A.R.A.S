document.addEventListener('DOMContentLoaded', async function () {
    const API_URL = 'http://localhost:3000/api';
    
    // Recuperar el id_docente desde el localStorage
    const idDocente = localStorage.getItem('id_usuario');
    
    if (!idDocente) {
        alert('No se encontró el ID del docente. Por favor, inicie sesión.');
        return;
    }

    const tablaMaterias = document.getElementById('tablaMaterias');

    try {
        // Obtener materias del docente desde la API
        const res = await fetch(`${API_URL}/materias/docente/${idDocente}`);
        const data = await res.json();

        if (data.success && Array.isArray(data.materias)) {
            tablaMaterias.innerHTML = '';

            data.materias.forEach(m => {
                tablaMaterias.insertAdjacentHTML('beforeend', `
                    <tr>
                        <td><strong>${m.materia}</strong></td>
                        <td>${m.grado_y_nivel}</td>
                        <td>${m.seccion}</td>
                        <td>
                            <button
                                    class="btn ver-alumnos"
                                    data-materia="${m.id_materia}"
                                    data-grado   ="${m.id_grado}"
                                    data-seccion ="${m.id_seccion}"
                            >Ver Alumnos</button>
                            <button 
                                    class="btn marcar-asistencia"  
                                    data-materia="${m.id_materia}"
                                    data-grado   ="${m.id_grado}"
                                    data-seccion ="${m.id_seccion}"
                            >Marcar Asistencia</button>
                            <button
                                    class="btn asignar-tarea" 
                                    data-materia       ="${m.id_materia}"
                                    data-grado         ="${m.id_grado}"
                                    data-seccion    ="${m.id_seccion}"
                                    data-display   ="${m.materia} – ${m.grado_y_nivel} ${m.seccion}"
                            >Asignar Tarea</button>
                            <button
                                    class="btn ingresar-nota"
                                    data-materia   ="${m.id_materia}"
                                    data-grado     ="${m.id_grado}"
                                    data-seccion   ="${m.id_seccion}"
                            >Ingresar Nota</button>
                        </td>
                    </tr>
                `);
            });

            // después de haber pintado la tabla:
            document.querySelectorAll('.ver-alumnos').forEach(btn => {
                btn.addEventListener('click', () => {
                  const params = new URLSearchParams({
                    materia:  btn.dataset.materia,
                    grado:    btn.dataset.grado,
                    seccion:  btn.dataset.seccion
                  });
                  window.location.href = `ver_alumnos.html?${params}`;
                });
            });
            document.querySelectorAll('.marcar-asistencia').forEach(btn => {
                btn.addEventListener('click', () => {
                    const params = new URLSearchParams({
                    materia:  btn.dataset.materia,
                    grado:    btn.dataset.grado,
                    seccion:  btn.dataset.seccion   // ¡éste YA es numérico!
                    });
                    window.location.href = `marcar_asistencia.html?${params}`;
                });
            });
            // en ver_materias.js, justo después de pintar la tabla:
            document.querySelectorAll('.asignar-tarea').forEach(btn => {
            btn.addEventListener('click', () => {
                const params = new URLSearchParams({
                    materia: btn.dataset.materia,
                    grado:   btn.dataset.grado,
                    seccion: btn.dataset.seccion,
                    display: btn.dataset.display
                });
                window.location.href = `asignar_tarea.html?${params}`;
            });
            });

            document.querySelectorAll('.ingresar-nota').forEach(btn => {
                btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                window.location.href = `ingresar_notas.html?materia=${id}`;
                });
            });

        } else {
            alert('No se encontraron materias para este docente.');
            tablaMaterias.innerHTML = `
                <tr>
                  <td colspan="4" style="text-align:center;">
                    No tienes materias asignadas.
                  </td>
                </tr>`;
        }
    } catch (error) {
        console.error('Error al obtener las materias:', error);
        alert('Error al obtener las materias del docente.');
    }

    
    
});
