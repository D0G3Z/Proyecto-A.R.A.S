document.addEventListener('DOMContentLoaded', async function () {
    const API_URL = 'http://localhost:3000/api';

    const tablaDocentes = document.getElementById('tablaDocentes');

    // Cargar docentes desde la nueva ruta
    const res = await fetch(`${API_URL}/docentes/lista`);
    const data = await res.json();

    if (data.success) {
        tablaDocentes.innerHTML = "";
        data.result.forEach(docente => {
            const fila = `
                <tr>
                    <td>${docente.nombres} ${docente.apellido_paterno}</td>
                    <td>${docente.dni}</td>
                    <td>${docente.estado}</td>
                </tr>
            `;
            tablaDocentes.innerHTML += fila;
        });
    }
});
