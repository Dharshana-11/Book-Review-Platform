from rest_framework import serializers
from .models import Rating, Book

class RatingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rating
        fields = ['user', 'book', 'rating']

class BookSerializer(serializers.ModelSerializer):
    class Meta:
        model = Book
        fields = ['google_id', 'title', 'authors']
