document.addEventListener('DOMContentLoaded', async function () {
    const API_URL      = 'http://localhost:3000/api';
  const params       = new URLSearchParams(window.location.search);
  const idMateria    = parseInt(params.get('materia'), 10);
  const idGrado      = parseInt(params.get('grado'),   10);
  const idSeccion    = params.get('seccion');

  const btnVolver    = document.getElementById('btnVolver');
  const selectBim    = document.getElementById('selectBimestre');
  const bodyProm     = document.getElementById('bodyPromedios');

  if (btnVolver) btnVolver.addEventListener('click', () => window.history.back());

  async function fetchPromedios(bimestre) {
    const res = await fetch(
      `${API_URL}/notas/bimestre?materia=${idMateria}` +
      `&grado=${idGrado}&seccion=${encodeURIComponent(idSeccion)}` +
      `&bimestre=${bimestre}`
    );
    return res.json();
  }

  async function render() {
    const b = parseInt(selectBim.value, 10);
    let startMonth, endMonth;
    if (b < 4) {
      startMonth = b * 2 + 1;
      endMonth   = b * 2 + 2;
    } else {
      startMonth = 9;
      endMonth   = 12;
    }

    bodyProm.innerHTML = '<tr><td colspan="3" class="text-center">Cargando…</td></tr>';
    try {
      const jd = await fetchPromedios(b);
      if (!jd.success) throw new Error(jd.message);
      const data = jd.data;
      if (!data.length) {
        bodyProm.innerHTML = '<tr><td colspan="3" class="text-center">No hay notas para este bimestre.</td></tr>';
        return;
      }
      bodyProm.innerHTML = '';
      data.forEach((item, idx) => {
        // el controller ya filtra por MONTH(a.fecha_entrega) BETWEEN startMonth AND endMonth
        bodyProm.insertAdjacentHTML('beforeend', `
          <tr>
            <td>${idx + 1}</td>
            <td>${item.nombre_completo}</td>
            <td>${Math.round(item.promedio)}</td>
          </tr>
        `);
      });
    } catch (err) {
      console.error('Error al cargar promedios:', err);
      bodyProm.innerHTML = '<tr><td colspan="3" class="text-center text-danger">Error cargando datos.</td></tr>';
    }
  }

  selectBim.addEventListener('change', render);
  render();
})();