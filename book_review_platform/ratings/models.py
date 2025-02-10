from django.db import models
from django.contrib.auth.models import User

class Book(models.Model):
    google_id = models.CharField(max_length=255, unique=True)  # Unique identifier for the book
    title = models.CharField(max_length=200)
    authors = models.TextField()

    def __str__(self):
        return self.title

class Rating(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)  # Link to the user who rated
    book = models.ForeignKey(Book, on_delete=models.CASCADE)  # Link to the book
    rating = models.FloatField()  # User's rating

    def __str__(self):
        return f"{self.user.username} - {self.book.title} ({self.rating})"

    class Meta:
        unique_together = ('user', 'book')  # Prevent duplicate ratings by the same user for the same book
