document.addEventListener('DOMContentLoaded', () => {
    const formulario = document.getElementById("form-register");
    const inputs = document.querySelectorAll('#form-register input');
    const alertContainer = document.getElementById('alert-container');
    const tablaSocios = document.getElementById('tabla_socios');

    const expresiones = {
        nombre: /^[a-zA-ZÑñÁáÉéÍíÓóÚúÜü\s]+$/,
        dni: /^\d{1,8}$/,
        direccion: /^[a-zA-Z\s]*\d{0,4}[a-zA-Z\s]*$/,
        telefono: /^[\d\-\+\(\)\s]{1,20}$/,
        email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        num_socio: /^\d{1,10}$/,
        fecha_nacimiento: /^\d{2}-\d{2}-\d{4}$/
    };

    const validarFormulario = async (e) => {
        const campo = e.target.name;
        if (expresiones[campo]) {
            await validarCampo(expresiones[campo], e.target, campo);
        }
    };

    const validarCampo = async (expresion, input, campo) => {
        const grupo = document.getElementById(`grupo_${campo}`);
        const icono = grupo.querySelector('i');
        const mensajeError = grupo.querySelector('.formulario_input-error');
        const mensajeNumSocioExiste = grupo.querySelector('#error_num_socio_existe');
        const mensajeDniExiste = grupo.querySelector('#error_dni_existe');
    
        if (input.value.trim() === '') {
            // Si el campo está vacío
            grupo.classList.remove('formulario_grupo-incorrecto', 'formulario_grupo-correcto');
            icono.classList.remove('fa-check-circle', 'fa-times-circle');
            mensajeError.classList.remove('formulario_input_error-activo');
            mensajeNumSocioExiste.classList.remove('formulario_input_error-activo');
            mensajeDniExiste.classList.remove('formulario_input_error-activo');
        } else if (expresion.test(input.value)) {
            // Si el valor es válido, verificar existencia en base de datos
            if (campo === 'num_socio' || campo === 'dni') {
                const existencia = await verificarExistencia(campo === 'dni' ? input.value : null, campo === 'num_socio' ? input.value : null);
                if ((campo === 'num_socio' && existencia.existe_num_socio) || (campo === 'dni' && existencia.existe_dni)) {
                    // Si ya existe en la base de datos
                    grupo.classList.add('formulario_grupo-incorrecto');
                    grupo.classList.remove('formulario_grupo-correcto');
                    icono.classList.add('fa-times-circle');
                    icono.classList.remove('fa-check-circle');
                    if (campo === 'num_socio') {
                        mensajeNumSocioExiste.classList.add('formulario_input_error-activo');
                        mensajeDniExiste.classList.remove('formulario_input_error-activo');
                    } else {
                        mensajeDniExiste.classList.add('formulario_input_error-activo');
                        mensajeNumSocioExiste.classList.remove('formulario_input_error-activo');
                    }
                    mensajeError.classList.add('hide');
                } else {
                    // Valor válido y no existe en la base de datos
                    grupo.classList.remove('formulario_grupo-incorrecto');
                    grupo.classList.add('formulario_grupo-correcto');
                    icono.classList.add('fa-check-circle');
                    icono.classList.remove('fa-times-circle');
                    if (campo === 'num_socio') {
                        mensajeNumSocioExiste.classList.remove('formulario_input_error-activo');
                    } else {
                        mensajeDniExiste.classList.remove('formulario_input_error-activo');
                    }
                    mensajeError.classList.add('hide');
                }
            } else {
                // Para otros campos no especificados
                grupo.classList.remove('formulario_grupo-incorrecto');
                grupo.classList.add('formulario_grupo-correcto');
                icono.classList.add('fa-check-circle');
                icono.classList.remove('fa-times-circle');
                mensajeError.classList.add('hide');
                mensajeNumSocioExiste.classList.add('hide');
                mensajeDniExiste.classList.add('hide');
            }
        } else {
            // Si el valor no cumple con la expresión regular
            grupo.classList.add('formulario_grupo-incorrecto');
            grupo.classList.remove('formulario_grupo-correcto');
            icono.classList.add('fa-times-circle');
            icono.classList.remove('fa-check-circle');
            mensajeError.classList.add('formulario_input_error-activo');
            mensajeNumSocioExiste.classList.add('hide');
            mensajeDniExiste.classList.add('hide');
        }
    };
    
    

    const verificarExistencia = async (dni, num_socio) => {
        try {
            const response = await fetch(`/verificar_existencia/?dni=${dni || ''}&num_socio=${num_socio || ''}`);
            if (!response.ok) {
                throw new Error('Error en la verificación');
            }
            return await response.json();
        } catch (error) {
            console.error('Error al verificar existencia:', error);
            return { existe_dni: false, existe_num_socio: false };
        }
    };

    const lista_socios = () => {
        fetch('/obtener_lista_socios_json/')
            .then(response => response.json())
            .then(data => {
                if (tablaSocios) {
                    tablaSocios.innerHTML = '';
                    data.forEach(socio => {
                        const row = document.createElement('div');
                        row.textContent = `${socio.nombre} - ${socio.dni}`; // Ajusta el formato según sea necesario
                        tablaSocios.appendChild(row);
                    });
                }
            })
            .catch(error => console.error('Error:', error));
    };

    inputs.forEach((input) => {
        input.addEventListener('keyup', validarFormulario);
        input.addEventListener('blur', validarFormulario);
    });

    formulario.addEventListener('submit', async (e) => {
        e.preventDefault();
    
        const formData = new FormData(formulario);
        const dni = formData.get('dni');
        const num_socio = formData.get('num_socio');
    
        document.getElementById('error_dni_existe').classList.add('hide');
        document.getElementById('error_num_socio_existe').classList.add('hide');
    
        const existencia = await verificarExistencia(dni, num_socio);
        let formIsValid = true;
    
        if (existencia.existe_dni) {
            document.getElementById('error_dni_existe').classList.remove('hide');
            formIsValid = false;
        }
    
        if (existencia.existe_num_socio) {
            document.getElementById('error_num_socio_existe').classList.remove('hide');
            formIsValid = false;
        }
    
        if (!formIsValid) {
            showAlert('Por favor, corrija los errores en el formulario.', false);
            return;
        }
    
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
    
            const result = await response.json();
            if (response.ok) {
                showAlert('Socio registrado exitosamente.', true);
                formulario.reset();
                lista_socios();
            } else {
                showAlert('Error al registrar el socio.', false);
            }
        } catch (error) {
            console.error('Error al enviar el formulario:', error);
            showAlert('Error al registrar el socio.', false);
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


    lista_socios(); // Llama a la función para inicializar la lista al cargar la página
});
