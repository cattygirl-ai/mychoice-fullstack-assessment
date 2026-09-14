from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("items", "0003_restore_imported_timestamps")]

    operations = [
        migrations.AlterField(
            model_name="item",
            name="name",
            field=models.CharField(max_length=180),
        ),
    ]
