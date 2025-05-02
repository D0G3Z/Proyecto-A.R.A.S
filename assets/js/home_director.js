document.addEventListener('DOMContentLoaded', function () {
    // URL base del backend
    const API_URL = "http://localhost:3000/api"; 
    // Elementos donde pondremos los datos
    const totalDocentes = document.getElementById('totalDocentes');
    const totalAlumnos = document.getElementById('totalAlumnos');
    const tablaHorarios = document.getElementById('tablaHorarios');
    const nivelSelect = document.getElementById('nivelSelect');
    const gradoSelect = document.getElementById('gradoSelect');
    const seccionSelect = document.getElementById('seccionSelect');

    // Cargar grados según el nivel seleccionado
    async function cargarGrados() {
        const idNivel = nivelSelect.value;
        const res = await fetch(`${API_URL}/grados/nivel/${idNivel}`);
        const data = await res.json();

        gradoSelect.innerHTML = `<option value="">Seleccionar Grado</option>`; // Reset grados

        if (data.success) {
            data.result.forEach(g => {
                const option = document.createElement('option');
                option.value = g.id_grado;
                option.textContent = `${g.nombre} ${idNivel === "1" ? "Primaria" : "Secundaria"}`;
                gradoSelect.appendChild(option);
            });
        }
    }

    // Cargar las secciones según el grado seleccionado
    async function cargarSecciones() {
        const idGrado = gradoSelect.value;

        if (!idGrado) return;

        const res = await fetch(`${API_URL}/secciones/grado/${idGrado}`);
        const data = await res.json();
        seccionSelect.innerHTML = `<option value="">Seleccionar Sección</option>`; // Reset secciones

        if (data.success) {
            data.result.forEach(s => {
                const option = document.createElement('option');
                option.value = s.id_seccion;
                option.textContent = s.letra;
                seccionSelect.appendChild(option);
            });
        }
    }

    // Cargar horarios de acuerdo al filtro de grado, sección y nivel
    async function cargarHorarios() {
        const idGrado = gradoSelect.value;
        const idSeccion = seccionSelect.value;
        const idNivel = nivelSelect.value;

        if (!idGrado || !idSeccion || !idNivel) return;

        const res = await fetch(`${API_URL}/horarios/${idNivel}/${idGrado}/${idSeccion}`);
        const data = await res.json();

        if (data.success) {
            tablaHorarios.innerHTML = ''; // Limpiar tabla antes de cargar nuevos datos

            const horas = [
                '7:30 - 8:15', '8:15 - 9:00', '9:00 - 9:45', '9:45 - 10:30',
                '10:30 - 10:45', '10:45 - 11:30', '11:30 - 12:15', '12:15 - 12:35',
                '12:35 - 1:20', '1:20 - 2:05'
            ];

            horas.forEach((hora, index) => {
                const row = document.createElement('tr');

                // Columna de hora
                const horaCell = document.createElement('td');
                horaCell.textContent = hora;
                row.appendChild(horaCell);

                // Crear columnas de días
                ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'].forEach(dia => {
                    const cell = document.createElement('td');
                    const horario = data.horarios.find(h => h.dia_semana === dia && h.hora_inicio === hora);

                    if (horario) {
                        cell.textContent = `${horario.nombre_materia} (${horario.nombre_docente})`;
                    } else {
                        cell.textContent = 'Sin Clase';
                    }
                    row.appendChild(cell);
                });

                // Agregar la fila a la tabla
                tablaHorarios.appendChild(row);
            });
        }
    }

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
    
    // Cargar grados y secciones al inicio
    nivelSelect.addEventListener('change', cargarGrados);
    gradoSelect.addEventListener('change', cargarSecciones);
    seccionSelect.addEventListener('change', cargarHorarios);

    // Cargar grados y secciones al inicio
    cargarGrados();

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
});
