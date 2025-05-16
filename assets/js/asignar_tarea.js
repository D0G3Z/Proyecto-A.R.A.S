document.addEventListener('DOMContentLoaded', () => {
  const API_URL    = 'http://localhost:3000/api';
  const params     = new URLSearchParams(window.location.search);
  const idAsign    = params.get('id');
  const isEdit     = Boolean(idAsign);
  const idMateria  = parseInt(params.get('materia'), 10);
  const idGrado    = parseInt(params.get('grado'),   10);
  const idSeccion  = parseInt(params.get('seccion'), 10);
  const display    = params.get('display') || '';

  const tituloEl   = document.getElementById('tituloMateria');
  const formEl     = document.getElementById('formTarea');
  const descEl     = document.getElementById('descripcion');
  const tipoEl     = document.getElementById('tipo');
  const fechaEl    = document.getElementById('fechaEntrega');
  const btnSubmit  = formEl.querySelector('button[type="submit"]');

  tituloEl.textContent  = display;
  btnSubmit.textContent = isEdit ? 'Actualizar' : 'Guardar';

  const now = new Date();
  const pad = n => String(n).padStart(2,'0');
  fechaEl.min =
    `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}` +
    `T${pad(now.getHours())}:${pad(now.getMinutes())}`;

  if (isEdit) {
    fetch(`${API_URL}/asignaciones/${idAsign}`)
      .then(res => res.json())
      .then(data => {
        if (!data.success) throw new Error(data.message);
        const a = data.asignacion;
        descEl.value = a.descripcion;
        tipoEl.value = a.tipo;
        fechaEl.value = a.fecha_entrega.replace(' ', 'T');
      })
      .catch(err => {
        console.error(err);
        alert('Error cargando la asignación para editar.');
      });
  }

  formEl.addEventListener('submit', async e => {
    e.preventDefault();
    const descripcion  = descEl.value.trim();
    const tipo         = tipoEl.value;
    const fechaEntrega = fechaEl.value; // string "YYYY-MM-DDThh:mm"

    if (!descripcion || !tipo || !fechaEntrega) {
      return alert('Completa todos los campos.');
    }
    if (new Date(fechaEntrega) < new Date()) {
      return alert('La fecha de entrega no puede ser anterior al momento actual.');
    }

    const payload = { descripcion, tipo, fecha_entrega: fechaEntrega };
    if (!isEdit) {
      payload.id_materia = idMateria;
      payload.id_grado   = idGrado;
      payload.id_seccion = idSeccion;
    }

    try {
      const url    = isEdit ?
        `${API_URL}/asignaciones/${idAsign}` :
        `${API_URL}/asignaciones`;
      const method = isEdit ? 'PUT' : 'POST';
      const resp   = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const jd     = await resp.json();
      if (!jd.success) return alert('Error: ' + jd.message);
      alert(`Asignación ${isEdit ? 'actualizada' : 'creada'} correctamente.`);
      window.history.back();
    } catch (err) {
      console.error(err);
      alert('Error al guardar la asignación.');
    }
  });
});