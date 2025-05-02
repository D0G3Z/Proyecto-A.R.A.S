document.addEventListener('DOMContentLoaded', function () {
    // URL base del backend
    const API_URL       = "http://localhost:3000/api";
    // Elementos donde pondremos los datos
    const totalDocentes = document.getElementById('totalDocentes');
    const totalAlumnos  = document.getElementById('totalAlumnos');
    const tablaHorarios = document.getElementById('tablaHorarios');
    const nivelSelect   = document.getElementById('nivelSelect');
    const gradoSelect   = document.getElementById('gradoSelect');
    const seccionSelect = document.getElementById('seccionSelect');

    // Franjas horarias y recreos
    const HORAS = [
        '7:30 - 8:15', '8:15 - 9:00', '9:00 - 9:45', '9:45 - 10:30',
        '10:30 - 10:45', // recreo
        '10:45 - 11:30', '11:30 - 12:15',
        '12:15 - 12:35', // recreo
        '12:35 - 13:20', '13:20 - 14:05'
    ];
    const RECREOS = new Set(['10:30 - 10:45','12:15 - 12:35']);

    // 1) Cargar grados según nivel
    async function cargarGrados() {
        const idNivel = nivelSelect.value;
        gradoSelect.innerHTML = `<option value="">Seleccionar Grado</option>`;
        if (!idNivel) return;
        try {
            const res  = await fetch(`${API_URL}/grados/nivel/${idNivel}`);
            const data = await res.json();
            if (data.success) {
                data.result.forEach(g => {
                    const opt = document.createElement('option');
                    opt.value       = g.id_grado;
                    opt.textContent = `${g.nombre} ${idNivel==="1"?"Primaria":"Secundaria"}`;
                    gradoSelect.appendChild(opt);
                });
            }
        } catch (e) {
            console.error('Error cargando grados:', e);
        }
    }

    // 2) Cargar TODAS las secciones (sin filtrar)
    async function cargarSecciones() {
        seccionSelect.innerHTML = `<option value="">Seleccionar Sección</option>`;
        try {
            const res  = await fetch(`${API_URL}/secciones`);
            const data = await res.json();
            if (data.success) {
                data.result.forEach(s => {
                    const opt = document.createElement('option');
                    opt.value       = s.id_seccion;
                    opt.textContent = s.letra;
                    seccionSelect.appendChild(opt);
                });
            }
        } catch (e) {
            console.error('Error cargando secciones:', e);
        }
    }

    // 3) Cargar y pintar horarios
    async function cargarHorarios() {
        const idNivel   = nivelSelect.value;
        const idGrado   = gradoSelect.value;
        const idSeccion = seccionSelect.value;
        if (!idNivel || !idGrado || !idSeccion) return;

        let horarios = [];
        try {
            const res  = await fetch(`${API_URL}/horarios/${idNivel}/${idGrado}/${idSeccion}`);
            const data = await res.json();
            if (data.success) horarios = data.horarios;
        } catch (e) {
            console.error('Error cargando horarios:', e);
        }

        tablaHorarios.innerHTML = '';
        HORAS.forEach(hora => {
            const tr = document.createElement('tr');
            // franja
            const tdHora = document.createElement('td');
            tdHora.textContent = hora;
            tr.appendChild(tdHora);

            // columna por día
            ['Lunes','Martes','Miércoles','Jueves','Viernes'].forEach(dia => {
                const td = document.createElement('td');

                if (RECREOS.has(hora)) {
                    td.textContent = 'Recreo';
                    td.classList.add('celda-recreo');
                } else {
                    // buscar clase
                    const clase = horarios.find(h =>
                        h.dia_semana === dia &&
                        (`${h.hora_inicio} - ${h.hora_fin}`) === hora
                    );
                    td.textContent = clase
                        ? `${clase.nombre_materia} (${clase.nombre_docente})`
                        : '';
                }

                tr.appendChild(td);
            });

            tablaHorarios.appendChild(tr);
        });
    }

    // 4) Totales
    function cargarTotalDocentes() {
        fetch(`${API_URL}/director/docentes/total`)
            .then(r=>r.json())
            .then(d=>{
                totalDocentes.textContent = d.success ? d.total : 'Error';
            })
            .catch(e=>{
                console.error(e);
                totalDocentes.textContent = 'Error';
            });
    }
    function cargarTotalAlumnos() {
        fetch(`${API_URL}/director/alumnos/total`)
            .then(r=>r.json())
            .then(d=>{
                totalAlumnos.textContent = d.success ? d.total : 'Error';
            })
            .catch(e=>{
                console.error(e);
                totalAlumnos.textContent = 'Error';
            });
    }

    // 5) Eventos
    nivelSelect.addEventListener('change', () => {
        cargarGrados().then(cargarSecciones);
    });
    gradoSelect.addEventListener('change', cargarSecciones);
    seccionSelect.addEventListener('change', cargarHorarios);

    // 6) Inicialización
    cargarTotalDocentes();
    cargarTotalAlumnos();
    cargarGrados().then(cargarSecciones);

    // 7) Cerrar sesión
    const btnCerrar = document.getElementById('cerrar-sesion');
    if (btnCerrar) {
        btnCerrar.addEventListener('click', e => {
            e.preventDefault();
            localStorage.clear();
            window.location.href = "login.html";
        });
    }
});
