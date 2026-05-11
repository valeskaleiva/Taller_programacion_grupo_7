from django.urls import path
from . import views

urlpatterns = [
    path('precio-carta/', views.search_card_price, name='precio-carta'),
    path('inventario/', views.inventory_list, name='inventory-list'),
    path('productos/<int:pk>/', views.product_detail, name='product-detail'),
    path('ventas/', views.sales_list, name='sales-list'),
]
