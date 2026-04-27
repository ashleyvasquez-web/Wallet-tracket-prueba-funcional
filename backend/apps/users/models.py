from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Modelo de usuario personalizado.
    Extiende el modelo de usuario de Django para incluir campos adicionales.
    """
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    currency = models.CharField(
        max_length=3,
        choices=[
            ('USD', 'Dólar Estadounidense'),
            ('NIO', 'Córdoba Nicaragüense'),
        ],
        default='USD'
    )
    start_day_of_month = models.IntegerField(default=1)
    notifications_enabled = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'users'
        verbose_name = 'Usuario'
        verbose_name_plural = 'Usuarios'

    def __str__(self):
        return self.username