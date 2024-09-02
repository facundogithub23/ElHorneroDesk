# Aplicaciones/Apps/apps.py

from django.apps import AppConfig

class AppsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'Aplicaciones.Apps'  # Esto debe ser una cadena de texto, no una tupla
