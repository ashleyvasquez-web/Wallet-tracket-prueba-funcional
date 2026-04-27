from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import get_user_model

from .serializers import (
    UserSerializer, UserCreateSerializer,
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