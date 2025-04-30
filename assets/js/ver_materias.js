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

        console.log('Respuesta de la API:', data);  // Agrega esto para ver la respuesta completa del backend

        if (data.success) {
            tablaMaterias.innerHTML = "";
            // Cargar las materias en la tabla
            data.materias.forEach(materia => {
                const fila = `
                    <tr>
                        <td>${materia.materia}</td>
                        <td>${materia.grado_y_nivel}</td>  
                    </tr>
                `;
                tablaMaterias.innerHTML += fila;
            });
        } else {
            alert('No se encontraron materias para este docente.');
        }
    } catch (error) {
        console.error('Error al obtener las materias:', error);
        alert('Error al obtener las materias del docente.');
    }
});
