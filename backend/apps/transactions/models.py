from django.db import models
from django.conf import settings


class Category(models.Model):
    """
    Modelo para categorías de transacciones.
    """
    TYPE_CHOICES = [
        ('income', 'Ingreso'),
        ('expense', 'Gasto'),
    ]
    
    name = models.CharField(max_length=100)
    type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='categories'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'categories'
        verbose_name = 'Categoría'
        verbose_name_plural = 'Categorías'
        unique_together = ['name', 'type', 'user']

    def __str__(self):
        return f"{self.name} ({self.type})"


class Transaction(models.Model):
    """
    Modelo para transacciones financieras.
    """
    TYPE_CHOICES = [
        ('income', 'Ingreso'),
        ('expense', 'Gasto'),
    ]
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='transactions'
    )
    date = models.DateField()
    description = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        related_name='transactions'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'transactions'
        verbose_name = 'Transacción'
        verbose_name_plural = 'Transacciones'
        ordering = ['-date', '-created_at']

    def __str__(self):
        return f"{self.description} - {self.amount}"


class Budget(models.Model):
    """
    Modelo para presupuestos.
    """
    PERIOD_CHOICES = [
        ('weekly', 'Semanal'),
        ('monthly', 'Mensual'),
        ('annual', 'Anual'),
    ]
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='budgets'
    )
    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name='budgets'
    )
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    period = models.CharField(max_length=10, choices=PERIOD_CHOICES, default='monthly')
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'budgets'
        verbose_name = 'Presupuesto'
        verbose_name_plural = 'Presupuestos'
        unique_together = ['user', 'category', 'period']

    def __str__(self):
        return f"{self.category.name} - {self.amount}"


class Rule(models.Model):
    """
    Modelo para reglas automáticas de categorización.
    """
    TYPE_CHOICES = [
        ('income', 'Ingreso'),
        ('expense', 'Gasto'),
    ]
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='rules'
    )
    keyword = models.CharField(max_length=100)
    type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name='rules'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'rules'
        verbose_name = 'Regla'
        verbose_name_plural = 'Reglas'
        unique_together = ['user', 'keyword']

    def __str__(self):
        return f"{self.keyword} -> {self.category.name}"