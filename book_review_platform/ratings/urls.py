from django.urls import path
from .views import rate_book, get_book_ratings

urlpatterns = [
    path('rate-book/', rate_book, name='rate-book'),  # URL for submitting/updating a rating
    path('get-book-ratings/', get_book_ratings, name='get-book-ratings'),  # URL for retrieving ratings
]
