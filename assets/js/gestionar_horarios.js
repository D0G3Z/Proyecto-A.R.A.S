document.addEventListener('DOMContentLoaded', function () {
    const API_URL       = 'http://localhost:3000/api';
    const nivelSelect   = document.getElementById('nivel');
    const docenteSelect = document.getElementById('docente');
    const materiaSelect = document.getElementById('materia');
    const gradoSelect   = document.getElementById('grado');
    const seccionSelect = document.getElementById('seccion');
    const tablaHorarios = document.getElementById('tablaHorarios');
    const formHorario   = document.getElementById('formHorario');

    const RECREOS = [
        { start: "10:30", end: "10:45" },
        { start: "12:15", end: "12:35" }
      ];

    // Convierte "HH:mm" → minutos totales
    function timeToMinutes(time) {
        const [h, m] = time.split(':');
        return parseInt(h, 10) * 60 + parseInt(m, 10);
    }

    // Carga TODAS las secciones
    async function cargarSecciones() {
        try {
            const res  = await fetch(`${API_URL}/secciones`);
            const data = await res.json();

            seccionSelect.innerHTML = `<option value="">Seleccionar Sección</option>`;
            if (data.success) {
                data.result.forEach(s => {
                    const o = document.createElement('option');
                    o.value       = s.id_seccion;
                    o.textContent = s.letra;
                    seccionSelect.appendChild(o);
                });
            } else {
                alert('No se encontraron secciones');
            }
        } catch (err) {
            console.error('Error al cargar secciones:', err);
            alert('Error al cargar secciones');
        }
    }

    // Cuando cambia el nivel, recarga docentes y grados
    nivelSelect.addEventListener('change', async () => {
        const idNivel = nivelSelect.value;
        if (!idNivel) return;

        // Docentes por nivel
        try {
            const r1 = await fetch(`${API_URL}/docentes/nivel/${idNivel}`);
            const d1 = await r1.json();
            docenteSelect.innerHTML = `<option value="">Seleccionar Docente</option>`;
            materiaSelect.innerHTML = `<option value="">Seleccionar Materia</option>`;
            if (d1.success) {
                d1.result.forEach(d => {
                    const o = document.createElement('option');
                    o.value       = d.id_docente;
                    o.textContent = d.nombre_completo;
                    docenteSelect.appendChild(o);
                });
            }
        } catch (e) {
            console.error('Error al cargar docentes:', e);
        }

        // Grados por nivel
        try {
            const r2 = await fetch(`${API_URL}/grados/nivel/${idNivel}`);
            const d2 = await r2.json();
            gradoSelect.innerHTML = `<option value="">Seleccionar Grado</option>`;
            if (d2.success) {
                d2.result.forEach(g => {
                    const o = document.createElement('option');
                    o.value       = g.id_grado;
                    o.textContent = g.nombre;
                    gradoSelect.appendChild(o);
                });
            }
        } catch (e) {
            console.error('Error al cargar grados:', e);
        }
    });

    // Cuando cambia el docente, recarga sus materias
    docenteSelect.addEventListener('change', async () => {
        const idDoc = docenteSelect.value;
        if (!idDoc) return;

        try {
            const r  = await fetch(`${API_URL}/docente/${idDoc}/materias`);
            const d  = await r.json();
            materiaSelect.innerHTML = `<option value="">Seleccionar Materia</option>`;
            if (d.success) {
                d.result.forEach(m => {
                    const o = document.createElement('option');
                    o.value       = m.id_materia;
                    o.textContent = m.nombre;
                    materiaSelect.appendChild(o);
                });
            }
        } catch (e) {
            console.error('Error al cargar materias:', e);
        }
    });

    // Carga y pinta todos los horarios
    async function cargarHorarios() {
        try {
            const res  = await fetch(`${API_URL}/horarios`);
            const data = await res.json();
            tablaHorarios.innerHTML = '';
            if (data.success) {
                data.horarios.forEach(h => {
                    tablaHorarios.innerHTML += `
                        <tr>
                          <td>${h.nombre_docente}</td>
                          <td>${h.nombre_materia}</td>
                          <td>${h.nombre_grado}</td>
                          <td>${h.dia_semana}</td>
                          <td>${h.hora_inicio}</td>
                          <td>${h.hora_fin}</td>
                          <td>
                            <button onclick="eliminarHorario(${h.id_horario})" 
                                    style="background:red;color:white;border:none;padding:5px 10px;cursor:pointer;">
                              Eliminar
                            </button>
                          </td>
                        </tr>`;
                });
            }
        } catch (err) {
            console.error('Error al obtener horarios:', err);
        }
    }

    // Envía el formulario para crear un nuevo horario
    formHorario.addEventListener('submit', async (e) => {
        e.preventDefault();

        const dia        = document.getElementById('dia').value;
        const inicio     = document.getElementById('hora_inicio').value;
        const fin        = document.getElementById('hora_fin').value;
        const idDocente  = docenteSelect.value;
        const idMat      = materiaSelect.value;
        const idGr       = gradoSelect.value;
        const idSec      = seccionSelect.value;
        const idNi       = nivelSelect.value;

        // Validación
        if (!idDocente || !idMat || !idGr || !idSec || !idNi || !dia || !inicio || !fin) {
            alert('Por favor complete todos los campos');
            return;
        }
        if (timeToMinutes(fin) <= timeToMinutes(inicio)) {
            alert('La hora de fin debe ser posterior a la hora de inicio');
            return;
        }

        const RECREOS = [
            { start: "10:30", end: "10:45" },
            { start: "12:15", end: "12:35" }
          ];
          for (const { start, end } of RECREOS) {
            const r0 = timeToMinutes(start), r1 = timeToMinutes(end);
            if (timeToMinutes(inicio) < r1 && timeToMinutes(fin) > r0) {
              alert(`No puedes agendar en recreo (${start}–${end})`);
              return;
            }
          }

        // Construimos el objeto
        const nuevoHorario = {
            id_docente:  idDocente,
            id_materia:  idMat,
            id_grado:    idGr,
            id_seccion:  idSec,
            dia_semana:  dia,
            hora_inicio: inicio,
            hora_fin:    fin
        };

        // Lo enviamos
        try {
            const r  = await fetch(`${API_URL}/horarios`, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify(nuevoHorario)
            });
            const d  = await r.json();
            if (d.success) {
                alert('Horario registrado correctamente');
                formHorario.reset();
                cargarHorarios();
            } else {
                alert('Error al registrar horario: ' + (d.message || ''));
            }
        } catch (err) {
            console.error('Error al registrar horario:', err);
            alert('Error al registrar horario');
        }
    });

    // Función global para eliminar
    window.eliminarHorario = async function (id) {
        if (!confirm('¿Seguro que deseas eliminar este horario?')) return;
        try {
            const r = await fetch(`${API_URL}/horarios/${id}`, { method: 'DELETE' });
            const d = await r.json();
            if (d.success) {
                alert('Horario eliminado');
                cargarHorarios();
            } else {
                alert('Error al eliminar horario');
            }
        } catch (err) {
            console.error('Error al eliminar horario:', err);
            alert('Error al eliminar horario');
        }
    };

    // Inicialización
    cargarSecciones();
    cargarHorarios();
});
