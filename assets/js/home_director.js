document.addEventListener('DOMContentLoaded', function () {
    const API_URL       = "http://localhost:3000/api";
    const totalDocentes = document.getElementById('totalDocentes');
    const totalAlumnos  = document.getElementById('totalAlumnos');
    const tablaHorarios = document.getElementById('tablaHorarios');
    const nivelSelect   = document.getElementById('nivelSelect');
    const gradoSelect   = document.getElementById('gradoSelect');
    const seccionSelect = document.getElementById('seccionSelect');
  
    // Definimos las franjas horarias con ceros a la izquierda
    const HORAS = [
        '7:30 - 8:15', '8:15 - 9:00', '9:00 - 9:45', '9:45 - 10:30',
        '10:30 - 10:45', // recreo
        '10:45 - 11:30', '11:30 - 12:15',
        '12:15 - 12:35', // recreo
        '12:35 - 13:20', '13:20 - 14:05'
    ];
    const RECREOS = new Set(['10:30 - 10:45','12:15 - 12:35']);
  
    // 1) Traer y pintar totales
    function cargarTotalDocentes() {
      fetch(`${API_URL}/director/docentes/total`)
        .then(r=>r.json())
        .then(d=> totalDocentes.textContent = d.success ? d.total : 'Error')
        .catch(_=> totalDocentes.textContent = 'Error');
    }
    function cargarTotalAlumnos() {
      fetch(`${API_URL}/director/alumnos/total`)
        .then(r=>r.json())
        .then(d=> totalAlumnos.textContent = d.success ? d.total : 'Error')
        .catch(_=> totalAlumnos.textContent = 'Error');
    }
  
    // 2) Cargar grados según nivel
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
            opt.textContent = `${g.nombre} ${idNivel==="1"? "Primaria":"Secundaria"}`;
            gradoSelect.appendChild(opt);
          });
        }
      } catch (e) {
        console.error('Error cargando grados:', e);
      }
    }
  
    // 3) Cargar TODAS las secciones
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
  
    // 4) Cargar y pintar el horario filtrado
    async function cargarHorarios() {
        const idNivel   = nivelSelect.value;
        const idGrado   = gradoSelect.value;
        const idSeccion = seccionSelect.value;
        if (!idNivel || !idGrado || !idSeccion) {
          tablaHorarios.innerHTML = '';
          return;
        }
      
        // 1) Traer datos
        let raw;
        try {
          const res  = await fetch(`${API_URL}/horarios/${idNivel}/${idGrado}/${idSeccion}`);
          const data = await res.json();
          raw = data.success ? data.horarios : [];
        } catch (e) {
          console.error('Error cargando horarios:', e);
          raw = [];
        }
      
        // 2) Preparar lista de franjas y recreos
        const SLOTS = [
          '07:30','08:15','09:00','09:45',
          '10:30','10:45','11:30','12:15',
          '12:35','13:20'
        ];
        const LABELS = [
          '7:30 – 8:15','8:15 – 9:00','9:00 – 9:45','9:45 – 10:30',
          '10:30 – 10:45','10:45 – 11:30','11:30 – 12:15','12:15 – 12:35',
          '12:35 – 13:20','13:20 – 14:05'
        ];
        const RECREOS = new Set(['10:30 – 10:45','12:15 – 12:35']);
      
        // 3) Mapear raw → objetos con start/end en "HH:mm"
        const clases = raw.map(h => {
          const start = h.hora_inicio.slice(11,16);
          const end   = h.hora_fin  .slice(11,16);
          return { ...h, start, end };
        });
      
        // 4) Helper de minutos
        function toMin(t) {
          const [h,m] = t.split(':').map(x=>parseInt(x,10));
          return h*60 + m;
        }
      
        // 5) Preparar skipMap: para cada día un Set de índices ya cubiertos
        const dias = ['Lunes','Martes','Miércoles','Jueves','Viernes'];
        const skip = {};
        dias.forEach(d=> skip[d] = new Set());
      
        // 6) Limpiar tabla
        tablaHorarios.innerHTML = '';
      
        // 7) Recorrer cada fila (slot)
        LABELS.forEach((label,i) => {
          const tr = document.createElement('tr');
          // columna de hora
          const td0 = document.createElement('td');
          td0.textContent = label;
          tr.appendChild(td0);
      
          dias.forEach(dia => {
            // si este slot está cubierto por un rowspan previo, saltar
            if (skip[dia].has(i)) return;
      
            const td = document.createElement('td');
      
            // caso recreo
            if (RECREOS.has(label)) {
              td.textContent = 'Recreo';
              td.classList.add('celda-recreo');
              tr.appendChild(td);
              return;
            }
      
            // buscar si arranca clase aquí
            const clase = clases.find(c => c.dia_semana === dia && c.start === SLOTS[i]);
            if (!clase) {
              // no hay clase → celda vacía
              tr.appendChild(td);
              return;
            }
      
            // calcular rowspan: contar cuántos slots ocupa
            const dur = toMin(clase.end) - toMin(clase.start);
            let rows = 0;
            for (let j = i; j < SLOTS.length; j++) {
              // si el inicio de slot j es antes de end
              if (toMin(SLOTS[j]) < toMin(clase.end)) rows++;
              else break;
            }
            td.rowSpan = rows;
            td.innerHTML = `<strong>${clase.nombre_materia}</strong><br><small>${clase.nombre_docente}</small>`;
      
            // marcar skip para los siguientes rows-1 índices
            for (let k = i+1; k < i+rows; k++) {
              skip[dia].add(k);
            }
      
            tr.appendChild(td);
          });
      
          tablaHorarios.appendChild(tr);
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
  