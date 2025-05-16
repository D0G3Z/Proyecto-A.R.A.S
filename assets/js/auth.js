function verificarRol(rolEsperado) {
    const rol = localStorage.getItem('rol');
    const usuario = localStorage.getItem('nombre_usuario');

    if (!usuario || rol !== rolEsperado) {
        window.location.href = "login.html";
    }
}
