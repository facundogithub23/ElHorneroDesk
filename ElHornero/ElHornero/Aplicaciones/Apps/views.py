from django.shortcuts import get_object_or_404, render, redirect
from django.http import HttpResponse, JsonResponse
from .models import Socio
#from .forms import SocioForm
import json
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import render
from django.http import JsonResponse
from django.contrib import messages
from .models import Socio
from datetime import datetime
from django.db.models import Q


from django.contrib import messages

from django.shortcuts import get_object_or_404, render, redirect
from django.http import HttpResponse, JsonResponse
from .models import Socio
#from .forms import SocioForm
import json
from django.views.decorators.csrf import csrf_exempt
from django.contrib import messages
from datetime import datetime

def index(request):
    if request.method == 'POST':
        nombre = request.POST.get('nombre')
        dni = request.POST.get('dni')
        direccion = request.POST.get('direccion')
        telefono = request.POST.get('telefono')
        email = request.POST.get('email')
        num_socio = request.POST.get('num_socio')
        fecha_nacimiento_str = request.POST.get('fecha_nacimiento')

        try:
            fecha_nacimiento = datetime.strptime(fecha_nacimiento_str, '%d/%m/%Y').date()
            nuevo_socio = Socio(
                nombre=nombre, 
                dni=dni, 
                direccion=direccion, 
                telefono=telefono, 
                email=email, 
                num_socio=num_socio, 
                fecha_nacimiento=fecha_nacimiento
            )
            nuevo_socio.full_clean()  # Validar los campos del modelo
            nuevo_socio.save()
            messages.success(request, '¡SOCIO REGISTRADO CON ÉXITO!')
        except Exception as e:
            messages.error(request, f'Ocurrió un error al registrar al socio: {str(e)}')
        return JsonResponse({'status': 'success', 'message': '¡SOCIO REGISTRADO CON ÉXITO!'})

    return render(request, 'index.html', {})

def verificar_existencia(request):
    dni = request.GET.get('dni', None)
    num_socio = request.GET.get('num_socio', None)
    existe_dni = Socio.objects.filter(dni=dni).exists() if dni else False
    existe_num_socio = Socio.objects.filter(num_socio=num_socio).exists() if num_socio else False
    return JsonResponse({'existe_dni': existe_dni, 'existe_num_socio': existe_num_socio})

# Las demás funciones se mantienen iguales...

def lista_socios(request):
    socios = Socio.objects.filter(baja=False)  # Solo socios activos
    return render(request, 'lista.html', {'socios': socios})

def verificar_existencia(request):
    dni = request.GET.get('dni', None)
    num_socio = request.GET.get('num_socio', None)
    existe_dni = Socio.objects.filter(dni=dni).exists() if dni else False
    existe_num_socio = Socio.objects.filter(num_socio=num_socio).exists() if num_socio else False
    return JsonResponse({'existe_dni': existe_dni, 'existe_num_socio': existe_num_socio})
def lista_bajas(request):
    socios_bajas = Socio.objects.filter(baja=True)
    return render(request, 'baja.html', {'socios': socios_bajas})

@csrf_exempt
def registrar_socio(request):
    if request.method == 'POST':
        print("Datos recibidos:", request.POST)
        nombre = request.POST.get('nombre')
        dni = request.POST.get('dni')
        direccion = request.POST.get('direccion')
        telefono = request.POST.get('telefono')
        email = request.POST.get('email')
        num_socio = request.POST.get('num_socio')
        fecha_nacimiento_str = request.POST.get('fecha_nacimiento')

        try:
            fecha_nacimiento = datetime.strptime(fecha_nacimiento_str, '%d-%m-%Y').date()
            nuevo_socio = Socio(
                nombre=nombre, 
                dni=dni, 
                direccion=direccion, 
                telefono=telefono, 
                email=email, 
                num_socio=num_socio, 
                fecha_nacimiento=fecha_nacimiento
            )
            nuevo_socio.full_clean()
            nuevo_socio.save()

            return JsonResponse({'success': True, 'message': '¡SOCIO REGISTRADO CON ÉXITO!'})
        except ValueError:
            return JsonResponse({'error': 'Formato de fecha inválido'}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    return JsonResponse({'error': 'Método no permitido'}, status=405)




def validar_dni_num_socio(request):
    dni = request.GET.get('dni', None)
    num_socio = request.GET.get('num_socio', None)
    
    data = {
        'dni_existe': Socio.objects.filter(dni=dni).exists(),
        'num_socio_existe': Socio.objects.filter(num_socio=num_socio).exists(),
    }
    return JsonResponse(data)
def obtener_lista_socios_json(request):
    socios = list(Socio.objects.values('nombre', 'dni'))
    return JsonResponse(socios, safe=False)

def obtener_datos_json(request):
    socios = Socio.objects.all().values('id', 'num_socio', 'nombre', 'dni', 'direccion', 'telefono', 'email', 'fecha_nacimiento', 'fecha_registro')
    data = list(socios)
    return JsonResponse(data, safe=False)

def edicion_socio(request, id):
    socio = Socio.objects.get(id=id)
    return render(request, 'edicionSocio.html', {'socio': socio})


def editar_socio(request):
    if request.method == 'POST':
        try:
            id = request.POST.get('id')
            socio = Socio.objects.get(id=id)
            socio.nombre = request.POST.get('nombre')
            socio.direccion = request.POST.get('direccion')
            socio.telefono = request.POST.get('telefono')
            socio.email = request.POST.get('email')
            socio.save()

            # Utilizar messages.success para enviar un mensaje de éxito
            messages.success(request, '¡SOCIO MODIFICADO CON ÉXITO!')

            # Devuelve una respuesta JSON indicando éxito
            return JsonResponse({'status': 'success', 'message': '¡SOCIO MODIFICADO CON ÉXITO!'})

        except Exception as e:
            # Utilizar messages.error para enviar un mensaje de error
            messages.error(request, f'Ocurrió un error al modificar el socio: {str(e)}')
            # Devuelve una respuesta JSON indicando error
            return JsonResponse({'status': 'error', 'message': str(e)})

    # Devuelve una respuesta JSON indicando que el método no está permitido
    return JsonResponse({'status': 'error', 'message': 'Método no permitido'})


def obtener_datos_json_edicion(request, id):
    # Buscar el socio por ID
    socio = get_object_or_404(Socio, id=id)
    
    # Preparar los datos en formato JSON
    data = {
        'id': socio.id,
        'num_socio': socio.num_socio,
        'nombre': socio.nombre,
        'dni': socio.dni,
        'direccion': socio.direccion,
        'telefono': socio.telefono,
        'email': socio.email,
        'fecha_nacimiento': socio.fecha_nacimiento.strftime('%d-%m-%Y'),
        'fecha_registro': socio.fecha_registro.strftime('%d-%m-%Y'),
    }

    return JsonResponse(data)

def dar_baja_socio(request, socio_id):
    socio = get_object_or_404(Socio, id=socio_id)
    socio.baja = True  # Marca al socio como dado de baja
    socio.save()
    return redirect('lista_socios')  # Redirige usando el nombre de la ruta

def dar_alta_socio(request, socio_id):
    socio = get_object_or_404(Socio, id=socio_id)
    socio.baja = False  # Marca al socio como dado de baja
    socio.save()
    return redirect('lista_bajas')  # Redirige usando el nombre de la ruta


def eliminar_socio(request, id):
    print(f"ID recibido: {id}")  # Agrega esto para depuración
    socio = get_object_or_404(Socio, id=id)
    socio.delete()
    return redirect('lista_socios')  # Redirige usando el nombre de la ruta
def eliminar_socio_baja(request, id):
    print(f"ID recibido: {id}")  # Agrega esto para depuración
    socio = get_object_or_404(Socio, id=id)
    socio.delete()
    return redirect('lista_bajas')  # Redirige usando el nombre de la ruta

def buscar_socio_json(request):
    query = request.GET.get('query', '')
    socios = Socio.objects.filter(
        Q(nombre__icontains=query) | Q(dni__icontains=query) | Q(num_socio__icontains=query)
    ).values('nombre', 'dni', 'direccion', 'telefono', 'email', 'num_socio', 'fecha_nacimiento','baja')  # Ajusta los campos según necesites
    return JsonResponse(list(socios), safe=False)
def buscar_socio(request):
    query = request.GET.get('query', '')
    socios = Socio.objects.filter(
        Q(nombre__icontains=query) | Q(dni__icontains=query) | Q(num_socio__icontains=query)
    )
    # Enviar los resultados a una plantilla
    return render(request, 'index.html', {'socios': socios, 'query': query})