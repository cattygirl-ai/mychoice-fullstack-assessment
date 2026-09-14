from django.db import migrations


def import_existing_records(apps, schema_editor):
    connection = schema_editor.connection
    if "books_book" not in connection.introspection.table_names():
        return

    Item = apps.get_model("items", "Item")
    source = connection.ops.quote_name("books_book")
    target = connection.ops.quote_name(Item._meta.db_table)
    with connection.cursor() as cursor:
        cursor.execute(f"SELECT id, name, \"group\", created_at, updated_at FROM {source}")
        records = cursor.fetchall()

    groups = {"F": "Primary", "NF": "Secondary"}
    with connection.cursor() as cursor:
        cursor.executemany(
            f"INSERT INTO {target} (id, name, \"group\", created_at, updated_at) "
            "VALUES (%s, %s, %s, %s, %s)",
            [
                (identifier, name, groups[group], created_at, updated_at)
                for identifier, name, group, created_at, updated_at in records
            ],
        )


class Migration(migrations.Migration):
    dependencies = [("items", "0001_initial")]

    operations = [migrations.RunPython(import_existing_records, migrations.RunPython.noop)]
