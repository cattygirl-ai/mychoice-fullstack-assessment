from django.db import IntegrityError, transaction
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from unittest.mock import patch

from .models import Item
from .serializers import ItemSerializer


# Tests cover both API validation and database level safeguards.
class ItemAPITests(APITestCase):
    # Creating an Item should return its fields and make it listable.
    def test_create_and_list_items(self):
        # reverse() uses the route name from urls.py instead of hard coding a path.
        url = reverse("item-list-create")
        response = self.client.post(
            url, {"name": "Rock", "group": Item.Group.PRIMARY}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["group"], "Primary")
        self.assertIn("created_at", response.data)
        self.assertIn("updated_at", response.data)

        listed = self.client.get(url)
        self.assertEqual(listed.status_code, status.HTTP_200_OK)
        self.assertEqual(len(listed.data), 1)
        self.assertEqual(listed.data[0]["name"], "Rock")

    # Uniqueness is based on the name AND group, not the name alone.
    def test_same_name_allowed_in_different_groups(self):
        url = reverse("item-list-create")
        for group in (Item.Group.PRIMARY, Item.Group.SECONDARY):
            response = self.client.post(
                url, {"name": "Rock", "group": group}, format="json"
            )
            self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Item.objects.count(), 2)

    # The API should reject a differently capitalized duplicate in the same group.
    def test_duplicate_name_in_same_group_is_rejected(self):
        url = reverse("item-list-create")
        self.client.post(url, {"name": "Rock", "group": "Primary"}, format="json")
        response = self.client.post(
            url, {"name": "rock", "group": "Primary"}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Item.objects.count(), 1)

    # Direct model writes bypass the serializer; the database must still reject
    # the case variants tested here on both INSERT and UPDATE.
    def test_database_rejects_case_insensitive_duplicates(self):
        first = Item.objects.create(name="Rock", group="Primary")

        # The inner atomic block rolls back just the failed write, allowing
        # the rest of this test to continue using the test database.
        with self.assertRaises(IntegrityError):
            with transaction.atomic():
                Item.objects.create(name="rock", group="Primary")

        second = Item.objects.create(name="Tree", group="Primary")
        with self.assertRaises(IntegrityError):
            with transaction.atomic():
                Item.objects.filter(pk=second.pk).update(name="ROCK")

        self.assertEqual(Item.objects.get(pk=first.pk).name, "Rock")
        self.assertEqual(Item.objects.get(pk=second.pk).name, "Tree")
        Item.objects.create(name="rock", group="Secondary")

   
    # Ensure The API returns 400 when another write happens between validation and saving 
    def test_database_conflict_returns_400_if_serializer_check_is_bypassed(self):
        Item.objects.create(name="Rock", group="Primary")
        other = Item.objects.create(name="Tree", group="Primary")

        # Temporarily skip the duplicate check so the database
        # constraint and views.save_item() error handling go through.
        with patch.object(ItemSerializer, "validate", lambda self, attrs: attrs):
            create_response = self.client.post(
                reverse("item-list-create"),
                {"name": "rock", "group": "Primary"},
                format="json",
            )
            update_response = self.client.patch(
                reverse("item-detail", kwargs={"pk": other.pk}),
                {"name": "ROCK"},
                format="json",
            )

        self.assertEqual(create_response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(update_response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Item.objects.count(), 2)
        other.refresh_from_db()
        self.assertEqual(other.name, "Tree")

    # An unrelated integrity failure should be logged and return a generic
    # server error, not the duplicate/name validation message.
    def test_unexpected_integrity_error_returns_generic_500(self):
        # Replace serializer.save() only within this test request.
        with patch.object(
            ItemSerializer,
            "save",
            side_effect=IntegrityError("unexpected database constraint"),
        ):
            with self.assertLogs("items.views", level="ERROR"):
                response = self.client.post(
                    reverse("item-list-create"),
                    {"name": "Rock", "group": "Primary"},
                    format="json",
                )

        self.assertEqual(
            response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR
        )
        self.assertEqual(response.data["detail"], "Unable to save the item.")
        self.assertEqual(Item.objects.count(), 0)

    # The group field accepts only the choices defined on the Item model.
    def test_invalid_group_is_rejected(self):
        response = self.client.post(
            reverse("item-list-create"),
            {"name": "Rock", "group": "F"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    # Check both sides of the model's 180 character boundary through the API.
    def test_name_length_limit(self):
        url = reverse("item-list-create")
        accepted = self.client.post(
            url,
            {"name": "A" * 180, "group": "Primary"},
            format="json",
        )
        rejected = self.client.post(
            url,
            {"name": "B" * 181, "group": "Primary"},
            format="json",
        )

        self.assertEqual(accepted.status_code, status.HTTP_201_CREATED)
        self.assertEqual(rejected.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Item.objects.count(), 1)

    # Retrieving and partially updating an existing Item should both work.
    def test_get_and_patch_item(self):
        item = Item.objects.create(name="Rock", group="Primary")
        url = reverse("item-detail", kwargs={"pk": item.pk})
        self.assertEqual(self.client.get(url).data["name"], "Rock")

        response = self.client.patch(url, {"name": "Tree"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        item.refresh_from_db()
        self.assertEqual(item.name, "Tree")

    # DRF should return 404 when the requested primary key does not exist.
    def test_missing_item_returns_404(self):
        response = self.client.get(reverse("item-detail", kwargs={"pk": 9999}))
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
