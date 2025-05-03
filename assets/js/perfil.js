document.addEventListener('DOMContentLoaded', function () {
    const datosPerfil = document.getElementById('datosPerfil');
    const formCambiarContrasena = document.getElementById('formCambiarContrasena');

    // Simulamos que tenemos guardado el nombre_usuario en localStorage
    const nombre_usuario = localStorage.getItem('nombre_usuario'); // esto debes guardarlo cuando hagan login

    if (!nombre_usuario) {
        alert("No se encontró sesión activa.");
        window.location.href = "login.html";
        return;
    }

    // Cargar datos del perfil
    fetch(`http://localhost:3000/api/perfil/${nombre_usuario}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const u = data.usuario;
                datosPerfil.innerHTML = `
                    <div style="text-align:center; margin-bottom:20px;">
                    <img src="../assets/img/docentes/${u.foto}" alt="Foto de perfil" style="width:100px; height:100px; border-radius:50%;">
                    </div>
                    <p><strong>Nombre:</strong> ${u.nombres} ${u.apellido_paterno} ${u.apellido_materno}</p>
                    <p><strong>DNI:</strong> ${u.dni}</p>
                    <p><strong>Correo:</strong> ${u.correo}</p>
                    <p><strong>Nivel Académico:</strong> ${u.nivel_academico}</p>
                    <p><strong>Teléfono:</strong> ${u.telefono}</p>
                `;
            } else {
                datosPerfil.innerHTML = `<p>Error cargando perfil.</p>`;
            }
        })
        .catch(error => {
            console.error('Error cargando perfil:', error);
        });

    // Actualizar contraseña
    formCambiarContrasena.addEventListener('submit', function (e) {
        e.preventDefault();
        const nuevaContrasena = document.getElementById('nuevaContrasena').value;

        fetch('http://localhost:3000/api/actualizar-contrasena', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                usuario: nombre_usuario,
                nuevaContrasena
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Contraseña actualizada correctamente.');
                formCambiarContrasena.reset();
            } else {
                alert('Error al actualizar la contraseña.');
            }
        })
        .catch(error => {
            console.error('Error actualizando contraseña:', error);
        });
    });
});
