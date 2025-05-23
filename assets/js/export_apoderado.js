// assets/js/export_apoderado.js
document.getElementById('btnExportPDF').addEventListener('click', () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'pt', format: 'letter' });
  
  doc.setFontSize(16);
  doc.text('Reporte de Cursos y Notas', 40, 50);
  
  doc.autoTable({
    startY: 80,
    html: '#tablaResumenCursos',
    theme: 'grid',
    headStyles: { fillColor: [40,116,166] },
    styles: { fontSize: 10, cellPadding: 4 },
    margin: { left: 40, right: 40 }
  });
  
  const fecha = new Date().toISOString().slice(0,10);
  doc.save(`reporte_cursos_notas_${fecha}.pdf`);
});
