document.addEventListener('DOMContentLoaded', async function () {
    const API_URL = 'http://localhost:3000/api';

    // Recuperar el id_docente desde el localStorage
    const idDocente = localStorage.getItem('id_usuario');
    
    if (!idDocente) {
        alert('No se encontró el ID del docente. Por favor, inicie sesión.');
        return;
    }

    const tablaAlumnos = document.getElementById('tablaAlumnos');

    // Cargar alumnos con grado desde la nueva ruta
    const res = await fetch(`${API_URL}/alumnos/lista`);
    const data = await res.json();

    if (data.success) {
        tablaAlumnos.innerHTML = "";
        data.result.forEach(alumno => {
            const fila = `
                <tr>
                    <td>${alumno.nombres} ${alumno.apellido_paterno}</td>
                    <td>${alumno.estado}</td>
                </tr>
            `;
            tablaAlumnos.innerHTML += fila;
        });
    }
});
