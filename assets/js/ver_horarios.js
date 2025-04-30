document.addEventListener('DOMContentLoaded', async function () {
    const API_URL = 'http://localhost:3000/api';
    
    // Recuperar el id_docente desde el localStorage
    const idDocente = localStorage.getItem('id_usuario');  // Aquí obtenemos el id_docente del localStorage
    
    if (!idDocente) {
        alert('No se encontró el ID del docente. Por favor, inicie sesión.');
        return;
    }

    const tablaHorarios = document.getElementById('tablaHorarios');

    try {
        // Obtener horarios del docente desde la API
        const res = await fetch(`${API_URL}/horarios/docente/${idDocente}`);
        const data = await res.json();

        if (data.success) {
            // Limpiar la tabla antes de agregar nuevos datos
            tablaHorarios.innerHTML = "";
            
            // Cargar los horarios en la tabla
            data.horarios.forEach(horario => {
                const fila = `
                    <tr>
                        <td>${horario.materia}</td>
                        <td>${horario.grado}</td>
                        <td>${horario.dia_semana}</td>
                        <td>${horario.hora_inicio}</td>
                        <td>${horario.hora_fin}</td>
                    </tr>
                `;
                tablaHorarios.innerHTML += fila;
            });
        } else {
            alert('No se encontraron horarios para este docente.');
        }
    } catch (error) {
        console.error('Error al obtener horarios:', error);
        alert('Error al obtener los horarios del docente.');
    }
});
