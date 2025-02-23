from django.contrib import admin
from .models import Profile, Genre

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'bio', 'get_favorite_genres', 'profile_pic','profile_complete','is_verified')  
    
    # Custom method to display favorite genres as a comma-separated string
    def get_favorite_genres(self, obj):
        return ", ".join([genre.name for genre in obj.favorite_genres.all()])
    get_favorite_genres.short_description = 'Favorite Genres'  # Custom label for the column

@admin.register(Genre)
class GenreAdmin(admin.ModelAdmin):
    list_display = ('key', 'name') 