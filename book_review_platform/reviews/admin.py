from django.contrib import admin
from .models import Review

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('get_user', 'get_book_title', 'content', 'created_at', 'get_likes_count')
    search_fields = ('user__username', 'book__title', 'content')

    def get_user(self, obj):
        return obj.user.username  # username from the related user model
    get_user.short_description = 'Username'  # custom label

    def get_book_title(self, obj):
        return obj.book.title  #  book title from the related book model
    get_book_title.short_description = 'Book Title'  # Custom label

    def get_likes_count(self, obj):
        return obj.likes.count()  # `likes` is a related field (ManyToMany, etc.)
    get_likes_count.short_description = 'Likes Count'  # Custom label 
