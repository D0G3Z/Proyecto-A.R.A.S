document.addEventListener('DOMContentLoaded', function () {
    const API_URL = 'http://localhost:3000/api';

    const nivelSelect = document.getElementById('nivel');
    const docenteSelect = document.getElementById('docente');
    const materiaSelect = document.getElementById('materia');
    const gradoSelect = document.getElementById('grado');
    const tablaHorarios = document.getElementById('tablaHorarios');
    const formHorario = document.getElementById('formHorario');
    const SECCION_FIJA_ID = 1; // ID de sección "U"

    // === Función para convertir hora (HH:mm) a minutos ===
    function timeToMinutes(time) {
        const [hours, minutes] = time.split(':');
        return parseInt(hours) * 60 + parseInt(minutes); // Convierte a minutos
    }

    // === Cargar grados (no depende del nivel en este caso) ===
    async function cargarGrados() {
        const res = await fetch(`${API_URL}/grados`);
        const data = await res.json();
        if (data.success) {
            gradoSelect.innerHTML = `<option value="">Seleccionar Grado</option>`;
            data.result.forEach(g => {
                const option = document.createElement('option');
                option.value = g.id_grado;
                option.textContent = g.nombre;
                gradoSelect.appendChild(option);
            });
        }
    }

    // === Al cambiar nivel, cargar docentes filtrados ===
    nivelSelect.addEventListener('change', async function () {
        const idNivel = this.value;
        if (!idNivel) return;

        // === DOCENTES POR NIVEL ===
        const docentesRes = await fetch(`${API_URL}/docentes/nivel/${idNivel}`);
        const docentesData = await docentesRes.json();
        docenteSelect.innerHTML = `<option value="">Seleccionar Docente</option>`;
        materiaSelect.innerHTML = `<option value="">Seleccionar Materia</option>`;
        if (docentesData.success) {
            docentesData.result.forEach(d => {
                const option = document.createElement('option');
                option.value = d.id_docente;
                option.textContent = d.nombre_completo;
                docenteSelect.appendChild(option);
            });
        }

        // === GRADOS POR NIVEL ===
        const gradosRes = await fetch(`${API_URL}/grados/nivel/${idNivel}`);
        const gradosData = await gradosRes.json();
        gradoSelect.innerHTML = `<option value="">Seleccionar Grado</option>`;
        if (gradosData.success) {
            gradosData.result.forEach(g => {
                const option = document.createElement('option');
                option.value = g.id_grado;
                option.textContent = g.nombre;
                gradoSelect.appendChild(option);
            });
        }
    });

    // === Al cambiar docente, cargar sus materias ===
    docenteSelect.addEventListener('change', async function () {
        const idDocente = this.value;
        if (!idDocente) return;

        const res = await fetch(`${API_URL}/docente/${idDocente}/materias`);
        const data = await res.json();

        materiaSelect.innerHTML = `<option value="">Seleccionar Materia</option>`;

        if (data.success) {
            data.result.forEach(m => {
                const option = document.createElement('option');
                option.value = m.id_materia;
                option.textContent = m.nombre;
                materiaSelect.appendChild(option);
            });
        }
    });

    // === Cargar horarios existentes ===
    async function cargarHorarios() {
        const res = await fetch(`${API_URL}/horarios`);
        const data = await res.json();

        if (data.success) {
            tablaHorarios.innerHTML = "";
            data.horarios.forEach(h => {
                const fila = `
                    <tr>
                        <td>${h.nombre_docente}</td>
                        <td>${h.nombre_materia}</td>
                        <td>${h.nombre_grado}</td>
                        <td>${h.dia_semana}</td>
                        <td>${h.hora_inicio}</td>
                        <td>${h.hora_fin}</td>
                        <td>
                            <button onclick="eliminarHorario(${h.id_horario})" style="background:red; color:white;">Eliminar</button>
                        </td>
                    </tr>
                `;
                tablaHorarios.innerHTML += fila;
            });
        }
    }

    // === Registrar nuevo horario ===
    formHorario.addEventListener('submit', async function (e) {
        e.preventDefault();

        const horaInicio = document.getElementById('hora_inicio').value;
        const horaFin = document.getElementById('hora_fin').value;

        // Verificar que todos los campos estén llenos
        if (!docenteSelect.value || !materiaSelect.value || !gradoSelect.value || !nivelSelect.value || !document.getElementById('dia').value || !horaInicio || !horaFin) {
            alert('Por favor complete todos los campos');
            return;
        }

        // Validar que la hora de fin sea mayor que la hora de inicio
        if (timeToMinutes(horaFin) <= timeToMinutes(horaInicio)) {
            alert('La hora de fin debe ser posterior a la hora de inicio');
            return;
        }

        const nuevoHorario = {
            id_docente: docenteSelect.value,
            id_materia: materiaSelect.value,
            id_grado: gradoSelect.value,
            id_seccion: SECCION_FIJA_ID,  // Sección siempre fija
            dia_semana: document.getElementById('dia').value,
            hora_inicio: horaInicio,
            hora_fin: horaFin
        };

        const res = await fetch(`${API_URL}/horarios`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevoHorario)
        });

        const data = await res.json();
        if (data.success) {
            alert('Horario registrado correctamente');
            formHorario.reset();
            cargarHorarios();
        } else {
            alert('Error al registrar horario');
        }
    });

    cargarGrados();
    cargarHorarios();
});

// === Función global para eliminar ===
async function eliminarHorario(id) {
    if (confirm("¿Seguro que deseas eliminar este horario?")) {
        const res = await fetch(`http://localhost:3000/api/horarios/${id}`, {
            method: 'DELETE'
        });
        const data = await res.json();

        if (data.success) {
            alert('Horario eliminado');
            document.querySelector('#tablaHorarios').innerHTML = "";
            document.dispatchEvent(new Event('DOMContentLoaded'));
        } else {
            alert('Error al eliminar horario');
        }
    }
}
