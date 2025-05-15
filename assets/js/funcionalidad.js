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
            const width = items[0].offsetWidth; // Mejor que getBoundingClientRect().width
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
            menuPerfil.style.display = (menuPerfil.style.display === 'block') ? 'none' : 'block';
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

            const usuario = document.getElementById('login_usuario').value.trim();
            const contrasena = document.getElementById('login_contraseña').value.trim();

            // Validación básica en el frontend
            if (!usuario || !contrasena) {
                alert('Por favor complete todos los campos');
                return;
            }

            try {
                const res = await fetch('http://localhost:3000/api/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ usuario, contrasena })
                });

                const data = await res.json();

                if (data.success) {
                    // Si el login es exitoso, guarda los datos en localStorage
                    localStorage.setItem('id_usuario', data.usuario.id_docente || null);
                    localStorage.setItem('nombre_usuario', data.usuario.nombres);
                    localStorage.setItem('rol', data.usuario.rol);

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
                    }
                } else {
                    alert(data.message || 'Usuario o contraseña incorrectos');
                }

            } catch (error) {
                console.error('Error de red:', error);
                alert('No se pudo conectar con el servidor. Intente nuevamente más tarde.');
            }
        });
    }

});
    // ========================
    // Modal de Términos y Condiciones
    // ========================
    const modal = document.getElementById("modal");
    const abrirModal = document.getElementById("abrirModal");
    const cerrarModal = document.querySelector(".cerrar");

    if (abrirModal && cerrarModal && modal) {
        abrirModal.addEventListener("click", function () {
            modal.style.display = "block";
        });

        cerrarModal.addEventListener("click", function () {
            modal.style.display = "none";
        });

        window.addEventListener("click", function (e) {
            if (e.target === modal) {
                modal.style.display = "none";
            }
        });
    }
