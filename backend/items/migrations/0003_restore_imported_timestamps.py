from django.db import migrations


def restore_imported_timestamps(apps, schema_editor):
    connection = schema_editor.connection
    if "books_book" not in connection.introspection.table_names():
        return

    Item = apps.get_model("items", "Item")
    source = connection.ops.quote_name("books_book")
    target = connection.ops.quote_name(Item._meta.db_table)
    with connection.cursor() as cursor:
        cursor.execute(
            f"SELECT id, name, \"group\", created_at, updated_at FROM {source}"
        )
        records = cursor.fetchall()

    groups = {"F": "Primary", "NF": "Secondary"}
    with connection.cursor() as cursor:
        cursor.executemany(
            f"UPDATE {target} SET created_at = %s, updated_at = %s "
            "WHERE id = %s AND name = %s AND \"group\" = %s",
            [
                (created_at, updated_at, identifier, name, groups[group])
                for identifier, name, group, created_at, updated_at in records
            ],
        )


class Migration(migrations.Migration):
    dependencies = [("items", "0002_import_existing_records")]

    operations = [
        migrations.RunPython(
            restore_imported_timestamps, migrations.RunPython.noop
        )
    ]
