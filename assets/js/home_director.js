document.addEventListener('DOMContentLoaded', function () {
    // Elementos donde pondremos los datos
    const totalDocentes = document.getElementById('totalDocentes');
    const totalAlumnos = document.getElementById('totalAlumnos');
    const tablaHorarios = document.getElementById('tablaHorarios');

    // URL base del backend
    const API_URL = "http://localhost:3000/api"; // Si luego cambias a Azure, solo modificas aquí

    // Función para traer total de docentes
    function cargarTotalDocentes() {
        fetch(`${API_URL}/director/docentes/total`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    totalDocentes.textContent = data.total;
                } else {
                    totalDocentes.textContent = "Error";
                }
            })
            .catch(error => {
                console.error('Error cargando docentes:', error);
                totalDocentes.textContent = "Error";
            });
    }

    // Función para traer total de alumnos
    function cargarTotalAlumnos() {
        fetch(`${API_URL}/director/alumnos/total`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    totalAlumnos.textContent = data.total;
                } else {
                    totalAlumnos.textContent = "Error";
                }
            })
            .catch(error => {
                console.error('Error cargando alumnos:', error);
                totalAlumnos.textContent = "Error";
            });
    }

    // Función para traer y mostrar horarios
    function cargarHorarios() {
        fetch(`${API_URL}/director/horarios`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    tablaHorarios.innerHTML = ""; // Limpiar antes de llenar

                    data.horarios.forEach(horario => {
                        const fila = `
                            <tr>
                                <td>${horario.nombre_materia}</td>
                                <td>${horario.nombre_docente}</td>
                                <td>${horario.nombre_grado}</td>
                                <td>${horario.dia_semana}</td>
                                <td>${horario.hora_inicio}</td>
                                <td>${horario.hora_fin}</td>
                            </tr>
                        `;
                        tablaHorarios.innerHTML += fila;
                    });
                } else {
                    tablaHorarios.innerHTML = "<tr><td colspan='6'>No hay horarios registrados</td></tr>";
                }
            })
            .catch(error => {
                console.error('Error cargando horarios:', error);
                tablaHorarios.innerHTML = "<tr><td colspan='6'>Error al cargar horarios</td></tr>";
            });
    }

    // Cerrar sesión
    const btnCerrarSesion = document.getElementById('cerrar-sesion');
    if (btnCerrarSesion) {
        btnCerrarSesion.addEventListener('click', function (e) {
            e.preventDefault();
            localStorage.clear();
            window.location.href = "login.html";
        });
    }

    // Ejecutar funciones al cargar página
    cargarTotalDocentes();
    cargarTotalAlumnos();
    cargarHorarios();
});
