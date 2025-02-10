from django.contrib import admin
from .models import Book, Rating

# Register Book model
@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    list_display = ('google_id', 'title', 'authors')  # Customize which fields to display in the admin panel


# Register Rating model
@admin.register(Rating)
class RatingAdmin(admin.ModelAdmin):
    list_display = ('user', 'book', 'rating')  # List the user, book, and rating in the admin panel
    search_fields = ('user__username', 'book__title')  # Add search functionality for user and book title
