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
    // Formulario de Login
    // ========================
    /*const loginForm = document.getElementById("login_sesion");

    if (loginForm) {
        loginForm.addEventListener("submit", function (e) {
            e.preventDefault();
            window.location.href = "home.html";
        });
    }*/

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

        const loginForm = document.getElementById("login_sesion");
    
        if (loginForm) {
            loginForm.addEventListener("submit", function (e) {
                e.preventDefault();
    
                const usuario = document.getElementById("login_usuario").value;
                const contrasena = document.getElementById("login_contraseña").value;
    
                fetch('http://localhost:3000/api/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ usuario, contrasena })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        window.location.href = "../pages/home.html"; // Redirigir al home
                    } else {
                        alert(data.message || 'Usuario o contraseña incorrectos');
                    }
                })
                .catch(error => {
                    console.error('Error en la solicitud:', error);
                });
            });
        }
    

});
