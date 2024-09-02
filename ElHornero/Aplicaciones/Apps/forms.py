from django import forms
from .models import Socio

class SocioForm(forms.ModelForm):
    nombre = forms.CharField(min_length=3, max_length=25, required=True, error_messages={
        'required': 'El nombre es obligatorio.',
        'min_length': 'El nombre debe tener al menos 3 caracteres.',
        'max_length': 'El nombre no puede exceder los 25 caracteres.',
    })
    dni = forms.CharField(min_length=8, max_length=8, required=True, error_messages={
        'required': 'El DNI es obligatorio.',
        'min_length': 'El DNI debe tener 8 caracteres.',
        'max_length': 'El DNI debe tener 8 caracteres.',
    })
    num_socio = forms.CharField(max_length=10, required=True, error_messages={
        'required': 'El número de socio es obligatorio.',
        'max_length': 'El número de socio no puede exceder los 10 caracteres.',
    })

    class Meta:
        model = Socio
        fields = '__all__'
        widgets = {
            'fecha_nacimiento': forms.DateInput(attrs={'class': 'datepicker', 'placeholder': 'dd/mm/aaaa'}),
        }