from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Category, Transaction, Budget, Rule

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer para el modelo de usuario.
    """
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'phone', 'currency', 
                  'start_day_of_month', 'notifications_enabled',
                  'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class UserCreateSerializer(serializers.ModelSerializer):
    """
    Serializer para crear usuarios.
    """
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password_confirm', 
                  'phone', 'currency']

    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError("Las contraseñas no coinciden")
        return data

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        return user


class CategorySerializer(serializers.ModelSerializer):
    """
    Serializer para categorías.
    """
    class Meta:
        model = Category
        fields = ['id', 'name', 'type', 'created_at']
        read_only_fields = ['id', 'created_at']


class TransactionSerializer(serializers.ModelSerializer):
    """
    Serializer para transacciones.
    """
    category_name = serializers.CharField(source='category.name', read_only=True)
    
    class Meta:
        model = Transaction
        fields = ['id', 'date', 'description', 'amount', 'type', 
                  'category', 'category_name', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class TransactionCreateSerializer(serializers.ModelSerializer):
    """
    Serializer para crear transacciones.
    """
    class Meta:
        model = Transaction
        fields = ['date', 'description', 'amount', 'type', 'category']


class BudgetSerializer(serializers.ModelSerializer):
    """
    Serializer para presupuestos.
    """
    category_name = serializers.CharField(source='category.name', read_only=True)
    spent = serializers.SerializerMethodField()
    remaining = serializers.SerializerMethodField()
    percentage = serializers.SerializerMethodField()

    class Meta:
        model = Budget
        fields = ['id', 'category', 'category_name', 'amount', 'period',
                  'description', 'spent', 'remaining', 'percentage',
                  'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_spent(self, obj):
        """Calcula el total gastado en la categoría del presupuesto."""
        from django.utils import timezone
        from datetime import timedelta
        
        today = timezone.now().date()
        
        # Filtrar por período
        if obj.period == 'weekly':
            start_date = today - timedelta(days=today.weekday())
        elif obj.period == 'monthly':
            start_date = today.replace(day=1)
        else:  # annual
            start_date = today.replace(month=1, day=1)
        
        transactions = Transaction.objects.filter(
            user=obj.user,
            category=obj.category,
            type='expense',
            date__gte=start_date
        )
        
        total = sum(abs(t.amount) for t in transactions)
        return float(total)

    def get_remaining(self, obj):
        spent = self.get_spent(obj)
        return float(obj.amount) - spent

    def get_percentage(self, obj):
        spent = self.get_spent(obj)
        if obj.amount > 0:
            return min(100, round((spent / float(obj.amount)) * 100, 1))
        return 0


class RuleSerializer(serializers.ModelSerializer):
    """
    Serializer para reglas.
    """
    category_name = serializers.CharField(source='category.name', read_only=True)
    
    class Meta:
        model = Rule
        fields = ['id', 'keyword', 'type', 'category', 'category_name', 'created_at']
        read_only_fields = ['id', 'created_at']