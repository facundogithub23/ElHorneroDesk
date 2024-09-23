function showModal(message, confirmCallback, cancelCallback) {
    // Asigna el mensaje personalizado al contenido del modal
    document.getElementById('modalMessage').innerText = message;

    // Muestra el modal
    const modal = document.getElementById('customModal');
    modal.style.display = 'block';

    // Maneja el clic en el botón de confirmar
    document.getElementById('confirmButton').onclick = function() {
        modal.style.display = 'none';
        if (confirmCallback) confirmCallback(); // Llama a la función de callback si se proporciona
    };

    // Maneja el clic en el botón de cancelar
    document.getElementById('cancelButton').onclick = function() {
        modal.style.display = 'none';
        if (cancelCallback) cancelCallback(); // Llama a la función de callback si se proporciona
    };
}

// Funciones de confirmación
function confirmBaja(socioId) {
    showModal(
        '¿Estás seguro de que deseas dar de baja a este socio?',
        function() {
            // Redirige para dar de baja al socio
            window.location.href = `/dar_baja_socio/${socioId}/`;
        }
    );
}

function confirmEditar(socioId) {
    showModal(
        '¿Está seguro de que desea modificar el socio?',
        function() {
            window.location.href = `/edicion_socio/${socioId}/`;
        }
    );
}

function confirmDelete(socioId) {
    showModal(
        '¿Está seguro de que desea eliminar al socio?',
        function() {
            window.location.href = `/eliminar_socio/${socioId}/`;
        }
    );
}


function confirmAlta(socioId) {
    showModal(
        '¿Está seguro de que desea dar de alta a este socio?',
        function() {
            window.location.href = `/dar_alta_socio/${socioId}/`;
        }
    );
}