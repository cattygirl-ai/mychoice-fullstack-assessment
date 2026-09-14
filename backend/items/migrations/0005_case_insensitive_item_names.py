from django.db import migrations, models
from django.db.models import Count
from django.db.models.functions import Lower


def check_for_conflicts(apps, schema_editor):
    Item = apps.get_model("items", "Item")
    conflicts = (
        Item.objects.using(schema_editor.connection.alias)
        .annotate(normalized_name=Lower("name"))
        .values("group", "normalized_name")
        .annotate(count=Count("id"))
        .filter(count__gt=1)
    )
    conflict = next(iter(conflicts[:1]), None)
    if conflict:
        raise ValueError(
            "Cannot enforce case-insensitive item uniqueness: "
            f"multiple items in {conflict['group']} have the name "
            f"{conflict['normalized_name']!r} ignoring case."
        )


class Migration(migrations.Migration):
    dependencies = [("items", "0004_alter_item_name")]

    operations = [
        migrations.RunPython(check_for_conflicts, migrations.RunPython.noop),
        migrations.AddConstraint(
            model_name="item",
            constraint=models.UniqueConstraint(
                Lower("name"),
                "group",
                name="unique_item_name_per_group_ci",
            ),
        ),
        migrations.RemoveConstraint(
            model_name="item",
            name="unique_item_name_per_group",
        ),
    ]
