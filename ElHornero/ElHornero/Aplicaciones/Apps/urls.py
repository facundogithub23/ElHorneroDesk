from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('lista_socios/', views.lista_socios, name='lista_socios'),
    path('registrar_socio/', views.registrar_socio, name='registrar_socio'),
    path('obtener_lista_socios_json/', views.obtener_datos_json, name='obtener_lista_socios_json'),
    path('edicion_socio/<int:id>/', views.edicion_socio, name='edicion_socio'),
    path('editar_socio', views.editar_socio, name='editar_socio'),
    path('obtener_datos_json_edicion/<int:id>/', views.obtener_datos_json_edicion, name='obtener_datos_json_edicion'),
    path('validar_dni_num_socio/', views.validar_dni_num_socio, name='validar_dni_num_socio'),
    path('dar_baja_socio/<int:socio_id>/', views.dar_baja_socio, name='dar_baja_socio'),
    path('baja/', views.lista_bajas, name='lista_bajas'),
    path('eliminar_socio/<int:id>/', views.eliminar_socio, name='eliminar_socio'),
    path('eliminar_socio_baja/<int:id>/', views.eliminar_socio_baja, name='eliminar_socio_baja'),
    path('dar_alta_socio/<int:socio_id>/', views.dar_alta_socio, name='dar_alta_socio'),
    path('verificar_existencia/', views.verificar_existencia, name='verificar_existencia'),
    path('buscar_socio/', views.buscar_socio, name='buscar_socio'),
    path('buscar_socio_json/', views.buscar_socio_json, name='buscar_socio_json'),
    ]
