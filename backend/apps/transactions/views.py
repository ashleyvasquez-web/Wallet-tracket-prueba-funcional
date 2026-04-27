from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import get_user_model

from .models import Category, Transaction, Budget, Rule
from .serializers import (
    UserSerializer, UserCreateSerializer,
    CategorySerializer, TransactionSerializer, TransactionCreateSerializer,
    BudgetSerializer, RuleSerializer
)

User = get_user_model()


class UserViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar usuarios.
    """
    queryset = User.objects.all()
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        return UserSerializer

    def get_queryset(self):
        return User.objects.filter(id=self.request.user.id)

    @action(detail=False, methods=['get'])
    def me(self, request):
        """Obtener información del usuario actual."""
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    @action(detail=False, methods=['put'])
    def update_settings(self, request):
        """Actualizar configuración del usuario."""
        user = request.user
        user.currency = request.data.get('currency', user.currency)
        user.start_day_of_month = request.data.get('start_day_of_month', user.start_day_of_month)
        user.notifications_enabled = request.data.get('notifications_enabled', user.notifications_enabled)
        user.save()
        serializer = UserSerializer(user)
        return Response(serializer.data)


class CategoryViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar categorías.
    """
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Category.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class TransactionViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar transacciones.
    """
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Transaction.objects.filter(user=self.request.user)
        
        # Filtros
        type_filter = self.request.query_params.get('type')
        if type_filter:
            queryset = queryset.filter(type=type_filter)
        
        # Filtrar por rango de fechas
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        if start_date:
            queryset = queryset.filter(date__gte=start_date)
        if end_date:
            queryset = queryset.filter(date__lte=end_date)
        
        # Búsqueda
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(description__icontains=search)
        
        return queryset

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return TransactionCreateSerializer
        return TransactionSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Obtener resumen de transacciones."""
        queryset = self.get_queryset()
        
        # Total ingresos
        total_income = sum(
            t.amount for t in queryset.filter(type='income')
        )
        
        # Total gastos
        total_expenses = sum(
            abs(t.amount) for t in queryset.filter(type='expense')
        )
        
        # Transacciones recientes
        recent = queryset.order_by('-date', '-created_at')[:5]
        
        return Response({
            'total_income': float(total_income),
            'total_expenses': float(total_expenses),
            'balance': float(total_income) - float(total_expenses),
            'recent_transactions': TransactionSerializer(recent, many=True).data
        })


class BudgetViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar presupuestos.
    """
    serializer_class = BudgetSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Budget.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Obtener resumen de presupuestos."""
        queryset = self.get_queryset()
        return Response(BudgetSerializer(queryset, many=True).data)


class RuleViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar reglas.
    """
    serializer_class = RuleSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Rule.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)