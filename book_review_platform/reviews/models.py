from django.db import models

# Create your models here.
from django.db import models
from django.contrib.auth.models import User
from ratings.models import Book  # Assuming you have a Book model

class Review(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name="reviews")
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    likes = models.ManyToManyField(User, related_name='liked_reviews', blank=True)

    def __str__(self):
        return f"Review by {self.user.username} - {self.book.title}"

    def get_likes_count(self):
        return self.likes.count()

class Report(models.Model):
    review = models.ForeignKey(Review, on_delete=models.CASCADE, related_name="reports")
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    reason = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Report by {self.user.username} for {self.review.book.title}"
