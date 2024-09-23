# Create your models here.
from django.db import models
from django.utils import timezone
class Socio(models.Model):
    num_socio = models.IntegerField()  # Cambia el nombre del campo a num_socio
    nombre = models.CharField(max_length=100)
    dni = models.CharField(max_length=20)
    direccion = models.CharField(max_length=200)
    telefono = models.CharField(max_length=20)
    email = models.EmailField()
    fecha_nacimiento = models.DateField()
    fecha_registro = models.DateField(default=timezone.now)
    baja = models.BooleanField(default=False)
    class Meta:
        db_table = 'socio'
