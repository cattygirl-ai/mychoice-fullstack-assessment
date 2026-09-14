from django.db import models
from django.db.models.functions import Lower


class Item(models.Model):
    # Define the valid categories for an item.
    # The first value is stored in the database, the second is displayed to users.
    class Group(models.TextChoices):
        PRIMARY = "Primary", "Primary"
        SECONDARY = "Secondary", "Secondary"

    # Name of the item. Django validates the maximum length at the model level.
    name = models.CharField(max_length=180)

    # Restrict the group field to the predefined Primary/Secondary choices.
    group = models.CharField(max_length=20, choices=Group.choices)

    # auto_now_add: Set automatically when the record is first created.
    # The value does not change when updated.
    created_at = models.DateTimeField(auto_now_add=True)

    # auto_now: Automatically updates whenever a model instance is saved.
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        # This allows the same book name in different groups,
        # but prevents duplicate names in the same group.
        constraints = [
            models.UniqueConstraint(
                Lower("name"), # case insensitivity is handled at model level
                "group",
                name="unique_item_name_per_group_ci",
            )
        ]

    def __str__(self):
        # Provide a readable string representation when the object is displayed
        return f"{self.name} ({self.group})"
