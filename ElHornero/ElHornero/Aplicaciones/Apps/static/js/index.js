document.addEventListener('DOMContentLoaded', () => {    // Espera a que el DOM esté completamente cargado antes de ejecutar el código.
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
        const mensajeNumSocioExiste = document.getElementById('error_num_socio_existe');
        const mensajeDniExiste = document.getElementById('error_dni_existe');
    
        // Limpiar mensajes al inicio
        grupo.classList.remove('formulario_grupo-incorrecto', 'formulario_grupo-correcto');
        icono.classList.remove('fa-check-circle', 'fa-times-circle');
        mensajeError.classList.remove('formulario_input_error-activo');
        mensajeNumSocioExiste.classList.remove('formulario_input_error-activo');
        mensajeDniExiste.classList.remove('formulario_input_error-activo');
    
        if (input.value.trim() === '') {
            // Campo vacío
            return;
        } else if (expresion.test(input.value)) {
            // Valor válido según la expresión regular
            const existencia = await verificarExistencia(campo === 'dni' ? input.value : null, campo === 'num_socio' ? input.value : null);
            
            if ((campo === 'num_socio' && existencia.existe_num_socio) || (campo === 'dni' && existencia.existe_dni)) {
                // Manejar existencia
                grupo.classList.add('formulario_grupo-incorrecto');
                icono.classList.add('fa-times-circle');
                if (campo === 'num_socio') {
                    mensajeNumSocioExiste.classList.add('formulario_input_error-activo');
                } else {
                    mensajeDniExiste.classList.add('formulario_input_error-activo');
                }
            } else {
                // No hay error
                grupo.classList.add('formulario_grupo-correcto');
                icono.classList.add('fa-check-circle');
            }
        } else {
            // Valor no válido (por ejemplo, letras)
            grupo.classList.add('formulario_grupo-incorrecto');
            icono.classList.add('fa-times-circle');
            mensajeError.classList.add('formulario_input_error-activo');
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
        
        // Verificar existencia en base de datos
        const existencia = await verificarExistencia(dni, num_socio);
        let formIsValid = true;
    
        if (existencia.existe_dni|| existencia.en_bajas) {
            document.getElementById('error_dni_existe').classList.remove('hide');
            formIsValid = false;
        }
    
        if (existencia.existe_num_socio|| existencia.en_bajas) {
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
            const data = await response.json();
            if (response.ok) {
                showAlert('¡SOCIO REGISTRADO CON ÉXITO!', true);
                formulario.reset(); // Reiniciar el formulario
                
                // Ocultar íconos de verificación
                inputs.forEach((input) => {
                    const grupo = document.getElementById(`grupo_${input.name}`);
                    if (grupo) {
                        const icono = grupo.querySelector('i');
                        if (icono) {
                            icono.classList.remove('fa-check-circle', 'fa-times-circle');
                        }
                    }
                });
            
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
    
    
    
    
    
    /* BUSQUEDA*/
    document.getElementById('buscarSocio').addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault(); // Prevenir el envío del formulario
            buscarSocio(event); // Llama a la función buscarSocio
        }
    
    // Evitar que se aplique la validación o el cambio de estilo al hacer clic
    // Agregar un listener para el botón "Limpiar"
document.getElementById('limpiarBoton').addEventListener('click', limpiarCampos);

function limpiarCampos() {
    const campos = ['nombre', 'dni', 'direccion', 'telefono', 'email', 'num_socio', 'fecha_nacimiento'];
    campos.forEach(campo => {
        const input = document.querySelector(`input[name="${campo}"]`);
        if (input) {
            input.value = ''; // Limpiar el valor
            input.readOnly = false; // Permitir que el usuario escriba de nuevo
            input.classList.remove('focus-blue', 'focus-red'); // Limpiar clases de enfoque
        }
    });
    document.getElementById('limpiarBoton').style.display = 'none'; // Ocultar botón "Limpiar"

    // Desenfocar el primer campo
    const primerCampo = document.querySelector(`input[name="${campos[0]}"]`);
    if (primerCampo) {
        primerCampo.blur(); // Desenfocar el primer campo
    }
}

// Mantén el resto de tu código igual

async function buscarSocio(event) {
    event.preventDefault();
    const query = document.getElementById('buscarSocio').value;

    const campos = ['nombre', 'dni', 'direccion', 'telefono', 'email', 'num_socio', 'fecha_nacimiento'];

    

    try {
        const response = await fetch(`/buscar_socio_json/?query=${query}`);
        if (response.ok) {
            const socio = await response.json();

            if (socio.length > 0) {
                const encontrado = socio[0]; // Suponiendo que solo tomas el primer resultado
                
                // Rellenar los campos con los datos del socio
                campos.forEach(campo => {
                    const input = document.querySelector(`input[name="${campo}"]`);
                    if (input) {
                        if (campo === 'fecha_nacimiento') {
                            const partesFecha = encontrado.fecha_nacimiento.split('-'); 
                            const dia = partesFecha[2]; 
                            const mes = partesFecha[1]; 
                            const anio = partesFecha[0]; 
                            input.value = `${dia}-${mes}-${anio}`; 
                        } else {
                            input.value = encontrado[campo] || ''; 
                        }
                        input.readOnly = true; // Mantener en readonly solo si se encuentra un socio
                        input.classList.add(encontrado.baja ? 'focus-red' : 'focus-blue'); 
                    }
                });
                document.getElementById('limpiarBoton').style.display = 'inline'; 
            } else {
                showAlert('Socio no encontrado.', false);
                limpiarCampos(); // Limpiar campos si no se encuentra socio
                mostrarBotonNombreDniNoExiste(); // Mostrar el botón "No existe" por 3 segundos

            }
        } else {
            console.error('Error en la búsqueda del socio:', response.statusText);
            showAlert('Error en la búsqueda del socio.', false);
            limpiarCampos(); // Limpiar campos si hay error
        }
    } catch (error) {
        console.error('Error al buscar socio:', error);
        limpiarCampos(); // Limpiar campos si hay error
    }
}
function mostrarBotonNombreDniNoExiste() {
    const boton = document.getElementById('nombreDniNoExisteBoton');
    boton.style.display = 'inline'; // Mostrar el botón
    setTimeout(() => {
        boton.style.display = 'none'; // Ocultar el botón después de 3 segundos
    }, 3000);
}
function limpiarCampos() {
    const campos = ['nombre', 'dni', 'direccion', 'telefono', 'email', 'num_socio', 'fecha_nacimiento'];
    // Limpiar el campo de búsqueda
    document.getElementById('buscarSocio').value = ''; 
    campos.forEach(campo => {
        const input = document.querySelector(`input[name="${campo}"]`);
        if (input) {
            input.value = '';
            input.readOnly = false; // Devolver a modo editable
            input.classList.remove('focus-red', 'focus-blue'); // Remover clases de estilo
        }
    });
    document.getElementById('limpiarBoton').style.display = 'none'; // Ocultar el botón limpiar
}
    })