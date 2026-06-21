from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('properties', '0002_property_advance_amount_property_approval_type_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='property',
            name='map_url',
            field=models.URLField(blank=True, max_length=500),
        ),
    ]
