document.addEventListener('DOMContentLoaded', async function () {
    const API_URL = 'http://localhost:3000/api';
    const tablaAsistencia = document.getElementById('tablaAsistencia');

    // Cargar alumnos
    const res = await fetch(`${API_URL}/alumnos`);
    const data = await res.json();

    if (data.success) {
        tablaAsistencia.innerHTML = "";
        data.result.forEach(alumno => {
            const fila = `
                <tr>
                    <td>${alumno.nombres} ${alumno.apellido_paterno}</td>
                    <td>
                        <select id="asistencia_${alumno.id_alumno}">
                            <option value="presente">Presente</option>
                            <option value="ausente">Ausente</option>
                            <option value="tardio">Tardío</option>
                        </select>
                    </td>
                    <td><input type="text" id="observacion_${alumno.id_alumno}" /></td>
                </tr>
            `;
            tablaAsistencia.innerHTML += fila;
        });
    }
});

// Función para guardar asistencia
async function marcarAsistencia() {
    const API_URL = 'http://localhost:3000/api';

    const asistencia = [];
    const rows = document.getElementById('tablaAsistencia').rows;
    
    for (let row of rows) {
        const alumnoId = row.cells[0].textContent.split(' ')[0]; // Extrae el ID del alumno
        const estado = document.getElementById(`asistencia_${alumnoId}`).value;
        const observacion = document.getElementById(`observacion_${alumnoId}`).value;

        asistencia.push({
            alumnoId: alumnoId,
            estado: estado,
            observacion: observacion
        });
    }

    const res = await fetch(`${API_URL}/asistencia`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ asistencia })
    });

    const data = await res.json();
    if (data.success) {
        alert('Asistencia marcada correctamente');
    } else {
        alert('Error al marcar asistencia');
    }
}
