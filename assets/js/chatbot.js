document.addEventListener('DOMContentLoaded', function () {
    // ----------------------------
    // CREACIÓN DE ELEMENTOS DEL CHAT
    // ----------------------------

     // Icono flotante del chatbot
    const chatIcon = document.createElement('div');
    chatIcon.id = 'chat-icon';
    chatIcon.textContent = '💬';
    chatIcon.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #007bff;
        color: #fff;
        padding: 10px;
        border-radius: 50%;
        cursor: pointer;
        font-size: 24px;
        z-index: 1000;
        text-align: center;
    `;
    document.body.appendChild(chatIcon);

    // Caja del chatbot
    const chatBox = document.createElement('div');
    chatBox.id = 'chat-box';
    chatBox.style.cssText = `
        position: fixed;
        bottom: 80px;
        right: 20px;
        width: 320px;
        max-width: 90%;
        height: 400px;
        background: #fff;
        border: 1px solid #ccc;
        border-radius: 10px;
        display: none;
        flex-direction: column;
        overflow: hidden;
        box-shadow: 0 4px 10px rgba(0,0,0,0.1);
        z-index: 1000;
    `;

    // Estructura interna del chat (título, mensajes y entrada de texto)
    chatBox.innerHTML = `
        <div id="chat-header" style="background: #007bff; color: #fff; padding: 10px; cursor: move;">
        EduAsistente
        </div>
        <div id="chat-log" style="flex:1; padding:10px; overflow-y:auto; font-size:0.9rem;"></div>
        <div style="border-top:1px solid #ddd; padding:8px;">
        <input id="chat-input" type="text" placeholder="Escribe tu mensaje..." 
                style="width:100%; border:1px solid #ccc; border-radius:4px; padding:8px;">  
        </div>
    `;
    document.body.appendChild(chatBox);

    // Mostrar u ocultar el chatbot al hacer clic en el icono
    chatIcon.addEventListener('click', () => {
        chatBox.style.display = chatBox.style.display === 'none' ? 'flex' : 'none';
    });

    const chatLog = document.getElementById('chat-log');
    const chatInput = document.getElementById('chat-input');

    // ----------------------------
    // DICCIONARIO DE RESPUESTAS
    // ----------------------------

    const respuestas = [
        {
            palabrasClave: ['horario', 'hora', 'clases', 'timetable', 'jornada',
                 'agenda', 'itinerario', 'rutina', 'programación', 'programa de clases',
                  'plan de clases', 'sesión', 'turno'],
            respuesta: '🕒 Puedes revisar el horario de clases accediendo a la sección "Ver Horarios". Si necesitas ayuda para interpretarlo, con gusto puedo asistirte.'
        },
        {
            palabrasClave: ['asistencia', 'faltas', 'inasistencia', 'presente',
                 'ausente', 'registro de asistencia', 'control de asistencia', 
                 'justificación', 'ausencias', 'llegadas', 'retardos', 'marcar asistencia', 
                 'checar asistencia'],
            respuesta: '✅ Para ver la asistencia de tu hijo/a, visita la sección "Ver Asistencia". Recuerda que puedes justificar faltas desde el perfil del estudiante.'
        },
        {
            palabrasClave: ['calificación', 'calificaciones', 'nota', 'notas', 
                'boleta', 'evaluación', 'puntuación','resultado', 'rendimiento', 'puntaje', 'nivel', 'desempeño', 
                 'examen', 'promedio', 'notificación de notas', 'reporte académico', 'informe de notas'],
            respuesta: '📚 Las calificaciones están disponibles en la sección "Mis Estudios". Si tienes dudas sobre alguna materia, puedes contactar al docente desde "Ver Docentes".'
        },
        {
            palabrasClave: ['beca', 'becas', 'ayuda económica', 'subsidio', 'apoyo escolar', 
                'becas académicas', 'financiamiento', 'beneficio estudiantil', 'descuento',
                 'becas por mérito', 'convocatoria', 'inscripción a beca'],
            respuesta: '🎓 Para postular a una beca, dirígete al área administrativa o revisa las convocatorias en la sección de "Perfil".'
        },
        {
            palabrasClave: ['docente', 'profesor', 'maestro', 'director', 'educador', 'instructor',
                 'tutor', 'coordinador', 'personal docente', 'jefe de estudios', 'orientador',
                  'responsable de grupo', 'catedrático', 'facilitador'],
            respuesta: '👨‍🏫 Puedes contactar a los docentes desde la sección "Ver Docentes", o agendar una cita con el director en "Home Director".'
        }
    ];

    // ----------------------------
    // FUNCIONES AUXILIARES
    // ----------------------------

    // Inserta una pregunta sugerida en el input
    function insertarPreguntaSugerida(texto) {
        chatInput.value = texto;
        chatInput.focus();
    }

    // Genera botones de respuestas rápidas debajo de cada respuesta del bot
    function generarBotonesRapidos() {
        const sugerencias = [
            { texto: '¿Dónde veo las calificaciones?', emoji: '📚' },
            { texto: '¿Cómo justifico una falta?', emoji: '✅' },
            { texto: '¿Cómo contacto al docente?', emoji: '👨‍🏫' }
        ];

        let html = '<div style="margin-top:10px;">';
        sugerencias.forEach(s => {
            html += `<button onclick="insertarPreguntaSugerida('${s.texto}')" 
                        style="margin:2px; padding:5px 10px; border:none; background:#eee; border-radius:5px; cursor:pointer;">
                        ${s.emoji} ${s.texto}
                    </button>`;
        });
        html += '</div>';
        return html;
    }

    // Limpia texto de entrada para evitar XSS
    function sanitizarTexto(texto) {
        const div = document.createElement('div');
        div.innerText = texto;
        return div.innerHTML;
    }
    //para los acentos y signos 
    function normalizarTexto(texto) {
        return texto
        .toLowerCase()
        .normalize("NFD")               // Quitar acentos
        .replace(/[\u0300-\u036f]/g, '') 
        .replace(/[^a-z0-9\s]/g, '');   // Quitar signos
}

    // ----------------------------
    // EVENTO DE ENVÍO DE MENSAJES
    // ----------------------------

    chatInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            let userMessage = chatInput.value.trim();
            if (!userMessage) return;

            // Mostrar mensaje del usuario
            const mensajeSanitizado = sanitizarTexto(userMessage);
            chatLog.innerHTML += `<div><strong>Tú:</strong> ${mensajeSanitizado}</div>`;
            chatInput.value = '';

            // Buscar coincidencias en el diccionario
            let botResponse = '🤖 Lo siento, aún estoy aprendiendo. Puedes preguntar por horarios, asistencia, calificaciones, becas o docentes.';
            // Normalización aplicada
        const mensajeNormalizado = normalizarTexto(userMessage);

        for (const item of respuestas) {
            if (item.palabrasClave.some(p => mensajeNormalizado.includes(normalizarTexto(p)))) {
                botResponse = item.respuesta + '<br><br>¿Te puedo ayudar con algo más?';
                break;
            }
        }


            // Mostrar respuesta del bot y botones sugeridos
            chatLog.innerHTML += `<div><strong>Bot:</strong> ${botResponse}</div>`;
            chatLog.innerHTML += generarBotonesRapidos();
            chatLog.scrollTop = chatLog.scrollHeight;
        }
    });

    // Exponer función al global para usar en botones
    window.insertarPreguntaSugerida = insertarPreguntaSugerida;
});
