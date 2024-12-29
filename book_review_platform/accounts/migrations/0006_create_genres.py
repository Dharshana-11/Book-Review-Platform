from django.db import migrations

def create_genres(apps, schema_editor):
    Genre = apps.get_model('accounts', 'Genre')
    genres = [
        ("Action", "action"),
        ("Adventure", "adventure"),
        ("Art", "art"),
        ("Biography", "biography"),
        ("Children's", "children's"),
        ("Classic", "classic"),
        ("Comedy", "comedy"),
        ("Crime", "crime"),
        ("Drama", "drama"),
        ("Fantasy", "fantasy"),
        ("Historical Fiction", "historical-fiction"),
        ("Horror", "horror"),
        ("Humor", "humor"),
        ("Literary Fiction", "literary-fiction"),
        ("Mystery", "mystery"),
        ("Non-Fiction", "non-fiction"),
        ("Philosophy", "philosophy"),
        ("Poetry", "poetry"),
        ("Romance", "romance"),
        ("Science Fiction", "science-fiction"),
        ("Self-Help", "self-help"),
        ("Thriller", "thriller"),
        ("Young Adult", "young-adult"),
        ("Psychological Thriller", "psychological-thriller"),
        ("Dystopian", "dystopian"),
        ("Cookbooks", "cookbooks"),
        ("True Crime", "true-crime"),
        ("Health & Wellness", "health-wellness"),
        ("Travel", "travel"),
        ("Religion & Spirituality", "religion-spirituality"),
        ("Politics", "politics"),
        ("Business & Economics", "business-economics"),
        ("Science & Nature", "science-nature"),
        ("Sports & Outdoors", "sports-outdoors"),
        ("Technology & Computers", "technology-computers"),
        ("Art & Photography", "art-photography")
    ]
    
    for name, key in genres:
        # Check if the genre with the specific key exists, if not, create it
        Genre.objects.get_or_create(key=key, defaults={'name': name})

class Migration(migrations.Migration):
    dependencies = [
        ('accounts', '0005_genre_key_alter_genre_name'),  # Replace with your last migration's name
    ]

    operations = [
        migrations.RunPython(create_genres),
    ]
