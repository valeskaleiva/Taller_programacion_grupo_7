from django.shortcuts import render
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Venta, DetalleVenta
from .serializers import VentaSerializer, VentaCreateSerializer, DetalleVentaSerializer
from django.db.models import Sum
from django.utils import timezone
from datetime import timedelta


class VentaViewSet(viewsets.ModelViewSet):
    queryset = Venta.objects.all()
