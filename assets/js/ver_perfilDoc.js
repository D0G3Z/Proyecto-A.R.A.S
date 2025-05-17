document.addEventListener('DOMContentLoaded', async () => {
  const API_URL = 'http://localhost:3000/api';

  // Supongo que el ID del docente viene guardado en el localStorage o en el token
  // Aquí lo saco desde localStorage como ejemplo:
  const docenteId = localStorage.getItem('id_usuario');

  if (!docenteId) {
    alert('No se encontró el ID del docente. Por favor, inicia sesión.');
    window.location.href = 'login.html';
    return;
  }

  try {
    const res = await fetch(`${API_URL}/docentes/${docenteId}`);
    const data = await res.json();

    if (!data.success) {
      throw new Error(data.message || 'Error al cargar perfil');
    }

    const docente = data.docente;

    document.getElementById('fotoDocente').src = docente.foto || '../assets/img/default_profile.png';
    document.getElementById('nombreDocente').textContent = `${docente.nombres} ${docente.apellido_paterno} ${docente.apellido_materno}`;
    document.getElementById('correoDocente').textContent = docente.correo || 'No especificado';
    document.getElementById('estadoDocente').textContent = docente.estado || 'Desconocido';

  } catch (err) {
    console.error('Error al cargar perfil del docente:', err);
    alert('No se pudo cargar la información del perfil.');
  }

  // Manejo del formulario de cambio de contraseña
  const form = document.getElementById('formCambiarClave');
  const mensajeError = document.getElementById('mensajeError');
  const mensajeExito = document.getElementById('mensajeExito');

  form.addEventListener('submit', async (e) => {
  e.preventDefault();

  mensajeError.style.display = 'none';
  mensajeExito.style.display = 'none';

  const claveActual = document.getElementById('claveActual').value.trim();
  const nuevaClave = document.getElementById('nuevaClave').value.trim();
  const confirmarClave = document.getElementById('confirmarClave').value.trim();

  if (!claveActual || !nuevaClave || !confirmarClave) {
    mensajeError.textContent = 'Por favor, completa todos los campos.';
    mensajeError.style.display = 'block';
    return;
  }

  if (nuevaClave.length < 6) {
    mensajeError.textContent = 'La nueva contraseña debe tener al menos 6 caracteres.';
    mensajeError.style.display = 'block';
    return;
  }

  if (nuevaClave !== confirmarClave) {
    mensajeError.textContent = 'La confirmación no coincide con la nueva contraseña.';
    mensajeError.style.display = 'block';
    return;
  }

  try {
    const res = await fetch(`${API_URL}/docentes/cambiar-contrasena`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_usuario: docenteId, // Cambiado aquí
        clave_actual: claveActual,
        nueva_clave: nuevaClave,
      }),
    });

    const data = await res.json();
    if (data.success) {
      mensajeExito.textContent = 'Contraseña cambiada correctamente.';
      mensajeExito.style.display = 'block';
      form.reset();

      setTimeout(() => {
        const modal = bootstrap.Modal.getInstance(document.getElementById('modalCambiarClave'));
        modal.hide();
        mensajeExito.style.display = 'none';
      }, 2500);
    } else {
      mensajeError.textContent = data.message || 'Error al cambiar contraseña.';
      mensajeError.style.display = 'block';
    }
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    mensajeError.textContent = 'Error al cambiar contraseña. Inténtalo de nuevo.';
    mensajeError.style.display = 'block';
  }
});
});
