from django.urls import path
from . import views

app_name = 'tcgplayer'

urlpatterns = [
    path('search-card-price/', views.search_card_price, name='search_card_price'),
]
