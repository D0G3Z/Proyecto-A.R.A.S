// Espera a que todo el DOM cargue
document.addEventListener('DOMContentLoaded', function () {

    // ========================
    // Carrusel de imágenes
    // ========================
    const track = document.querySelector('.carousel-track');
    const items = document.querySelectorAll('.carousel-item');
    const prevBtn = document.querySelector('.carousel-btn.prev');
    const nextBtn = document.querySelector('.carousel-btn.next');
    let currentIndex = 0;

    function updateCarousel() {
        if (items.length > 0) {
            const width = items[0].getBoundingClientRect().width;
            track.style.transform = `translateX(-${width * currentIndex}px)`;
        }
    }

    if (nextBtn && prevBtn) {
        nextBtn.addEventListener('click', () => {
            if (currentIndex < items.length - 1) {
                currentIndex++;
                updateCarousel();
            }
        });

        prevBtn.addEventListener('click', () => {
            if (currentIndex > 0) {
                currentIndex--;
                updateCarousel();
            }
        });

        window.addEventListener('resize', updateCarousel);
    }

    // ========================
    // Menú desplegable del perfil
    // ========================
    const perfilIcon = document.getElementById('perfil-icon');
    const menuPerfil = document.getElementById('menu-perfil');

    if (perfilIcon && menuPerfil) {
        perfilIcon.addEventListener('click', (e) => {
            e.stopPropagation(); // Previene que se cierre inmediatamente al hacer clic en el ícono
            if (menuPerfil.style.display === 'block') {
                menuPerfil.style.display = 'none';
            } else {
                menuPerfil.style.display = 'block';
            }
        });

        document.addEventListener('click', function (e) {
            if (!perfilIcon.contains(e.target) && !menuPerfil.contains(e.target)) {
                menuPerfil.style.display = 'none';
            }
        });
    }


    // ========================
    // Fetch de login
    // ========================

    const loginForm = document.getElementById('login_sesion');
    
    if (loginForm) {
        loginForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const usuario = document.getElementById('login_usuario').value;
            const contrasena = document.getElementById('login_contraseña').value;

            // Realizar la solicitud de login al backend
            const res = await fetch('http://localhost:3000/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    usuario: usuario,
                    contrasena: contrasena
                })
            });

            const data = await res.json();

            if (data.success) {
                // Si el login es exitoso, guarda el id_docente y el rol en localStorage
                localStorage.setItem('id_usuario', data.usuario.id_docente || null);  // Guarda el id_docente (si es docente)
                localStorage.setItem('nombre_usuario', data.usuario.nombres);  // Guarda el nombre del usuario
                localStorage.setItem('rol', data.usuario.rol);  // Guarda el rol (Director, Docente, Apoderado)

                // Redirige a la página correspondiente según el rol
                switch (data.usuario.rol) {
                    case "DIRECTOR":
                        window.location.href = "../pages/home_director.html";
                        break;
                    case "DOCENTE":
                        window.location.href = "../pages/home_docente.html";
                        break;
                    case "APODERADO":
                        window.location.href = "../pages/home_apoderado.html";
                        break;
                    default:
                        alert("Rol no reconocido");
                        break;
                }
            } else {
                // Si el login falla, muestra un mensaje de error
                alert(data.message || 'Usuario o contraseña incorrectos');
            }
        });
    }

});
