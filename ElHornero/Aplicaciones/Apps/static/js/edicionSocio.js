document.addEventListener('DOMContentLoaded', () => {
    const formulario = document.getElementById("form-register");
    const inputs = document.querySelectorAll('#form-register input');
    const alertContainer = document.getElementById('alert-container');
    const tablaSocios = document.getElementById('tabla-socios');

    // Definir expresiones regulares para validación
    const expresiones = {
        nombre: /^[a-zA-ZÑñÁáÉéÍíÓóÚúÜü\s]+$/, // Acepta letras, espacios, ñ y acentos
        dni: /^\d{1,8}$/,
        direccion: /^[a-zA-Z\s\d]{1,50}$/,
        telefono: /^[\d+\-\(\)\s]{1,20}$/,
        email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        num_socio: /^\d{1,10}$/,
        fecha_nacimiento: /^\d{2}-\d{2}-\d{4}$/
    };

    inputs.forEach(input => {
        input.addEventListener('input', () => validarCampo(input));
    });

    function validarCampo(input) {
        const campo = input.name;
        const grupo = document.getElementById(`grupo_${campo}`);
        const inputError = grupo.querySelector('.formulario_input-error');
        const estadoIcono = grupo.querySelector('.formulario_validacion-estado');
        const valor = input.value;

        if (expresiones[campo] && !expresiones[campo].test(valor)) {
            grupo.classList.add('formulario_grupo-incorrecto');
            grupo.classList.remove('formulario_grupo-correcto');
            estadoIcono.classList.add('fa-times-circle');
            estadoIcono.classList.remove('fa-check-circle');
            inputError.textContent = `${campo.toUpperCase()} INVÁLIDO`;
        } else {
            grupo.classList.add('formulario_grupo-correcto');
            grupo.classList.remove('formulario_grupo-incorrecto');
            estadoIcono.classList.add('fa-check-circle');
            estadoIcono.classList.remove('fa-times-circle');
            inputError.textContent = '';
        }
    }

    formulario.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(formulario);
        let formIsValid = true; // Declarar la variable formIsValid

        inputs.forEach(input => {
            const campo = input.name;
            if (expresiones[campo] && !expresiones[campo].test(input.value)) {
                formIsValid = false;
            }
        });

        /*if (!formIsValid) {
            showAlert('Por favor, corrija los errores en el formulario.', false);
            return;
        }*/

        const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

        try {
            const response = await fetch(formulario.action, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': csrfToken,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams(formData).toString()
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`); // Corregir el error de sintaxis
            }

            const data = await response.json();
            if (data.status === 'success') {
                showAlert(data.message, true);

                // Reseteo manual de campos
                inputs.forEach(input => {
                    input.value = '';

            const grupo = document.getElementById(`grupo_${input.name}`);
            if (grupo) {
                grupo.classList.remove('formulario_grupo-correcto', 'formulario_grupo-incorrecto');
                const estadoIcono = grupo.querySelector('.formulario_validacion-estado');
                if (estadoIcono) {
                    estadoIcono.classList.remove('fa-check-circle', 'fa-times-circle');
                }
            }
        });

             
                
                lista_socios();
            } else {
                showAlert(data.message, false);
            }
        } catch (error) {
            console.error('Error:', error);
            showAlert('Ocurrió un error al editar el socio', false);
        }
    });

    function showAlert(message, success) {
        if (alertContainer) {
            alertContainer.textContent = message;
            alertContainer.classList.remove('hide');
            alertContainer.classList.toggle('alert-success', success);
            alertContainer.classList.toggle('alert-danger', !success);
            setTimeout(() => {
                alertContainer.classList.add('hide');
            }, 3000);
        }
    }

    function lista_socios() {
        fetch('/obtener_lista_socios_json/')
            .then(response => response.json())
            .then(data => {
                if (tablaSocios) {
                    tablaSocios.innerHTML = '';
                    data.forEach(socio => {
                        const row = document.createElement('div');
                        row.textContent = `${socio.nombre} - ${socio.dni}`; // Corregir interpolación de cadenas
                        tablaSocios.appendChild(row);
                    });
                }
            })
            .catch(error => console.error('Error:', error));
    }

    lista_socios();
});
