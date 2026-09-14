from django.urls import path

from .views import ItemDetailView, ItemListCreateView


# config/urls.py mounts this file at /items/, so these paths are relative to it.
urlpatterns = [
    # GET /items/ lists Items 
    # POST /items/ creates one.
    path("", ItemListCreateView.as_view(), name="item-list-create"),

    # GET /items/<id>/ retrieves one Item
    # PATCH updates it.
    # The integer id is passed to the view as pk (private key).
    path("<int:pk>/", ItemDetailView.as_view(), name="item-detail"),
]
