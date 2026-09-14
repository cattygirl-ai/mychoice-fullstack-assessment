import logging

from django.db import IntegrityError, transaction
from rest_framework import generics
from rest_framework.exceptions import APIException, ValidationError

from .models import Item
from .serializers import ItemSerializer

# Use this module's logger for database errors that are not duplicate Items.
logger = logging.getLogger(__name__)


def save_item(serializer):
    # Both create and update use this function after serializer validation.
    # The transaction rolls back a failed write before we inspect the database.
    try:
        with transaction.atomic():
            serializer.save()
    except IntegrityError as exc:
        # Another request could have saved the same name/group pair after
        # validation but before this save. Reconstruct the complete pair;
        # PATCH may have omitted either field.
        name = serializer.validated_data.get(
            "name", serializer.instance.name if serializer.instance else None
        )
        group = serializer.validated_data.get(
            "group", serializer.instance.group if serializer.instance else None
        )
        matches = Item.objects.filter(name__iexact=name, group=group)
        if serializer.instance:
            # On update, exclude the Item being edited from duplicate matches.
            matches = matches.exclude(pk=serializer.instance.pk)
        if matches.exists():
            # A duplicate is a client validation error, even when the database
            # constraint was the first part of the code to detect it.
            raise ValidationError(
                "An item with this name already exists in this group."
            ) from exc

        # Do not mislabel an unrelated database failure as a duplicate.
        # Log the details on the server and return a generic API error.
        logger.exception("Unexpected integrity error while saving an item")
        raise APIException("Unable to save the item.") from exc


# DRF supplies GET and POST behavior for the /items/ collection endpoint.
class ItemListCreateView(generics.ListCreateAPIView):
    # Newest Items appear first; serializer_class controls JSON and validation.
    queryset = Item.objects.all().order_by("-created_at")
    serializer_class = ItemSerializer

    def perform_create(self, serializer):
        # Override DRF's default save to handle database conflicts consistently.
        save_item(serializer)


# DRF supplies GET, PATCH, and PUT behavior plus 404 lookup for /items/<id>/.
class ItemDetailView(generics.RetrieveUpdateAPIView):
    queryset = Item.objects.all()
    serializer_class = ItemSerializer

    def perform_update(self, serializer):
        # Updates need the same race-condition handling as creates.
        save_item(serializer)
