from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Rating, Book
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes

@permission_classes([IsAuthenticated])
@api_view(['POST'])
def rate_book(request):
    """
    Endpoint to submit or update a rating for a book.
    """
    user = request.user
    book_id = request.data.get('bookId')
    rating_value = request.data.get('rating')
    title = request.data.get('title', "Unknown Title")  # Default to "Unknown Title"
    authors = request.data.get('authors', "Unknown Author")  # Default to "Unknown Author"

    if not book_id or rating_value is None:
        return Response({"error": "bookId and rating are required"}, status=status.HTTP_400_BAD_REQUEST)

    # Validate rating value
    try:
        rating_value = float(rating_value)
        if rating_value < 0 or rating_value > 5:
            return Response({"error": "Rating must be between 0 and 5"}, status=status.HTTP_400_BAD_REQUEST)
    except ValueError:
        return Response({"error": "Invalid rating value"}, status=status.HTTP_400_BAD_REQUEST)

    # Get or create the book record
    book, created = Book.objects.get_or_create(
        google_id=book_id,
        defaults={"title": title, "authors": authors}
    )

    if not created:
        # Update the book details if they are "Unknown" or outdated
        if book.title == "Unknown Title" and title != "Unknown Title":
            book.title = title
        if book.authors == "Unknown Author" and authors != "Unknown Author":
            book.authors = authors
        book.save()

    # Get or create the rating
    rating, created = Rating.objects.get_or_create(
        user=user,
        book=book,
        defaults={"rating": rating_value}
    )

    if not created:
        # Update the existing rating
        rating.rating = rating_value
        rating.save()
        return Response({"message": "Rating updated successfully"}, status=status.HTTP_200_OK)
    else:
        return Response({"message": "Rating submitted successfully"}, status=status.HTTP_201_CREATED)

@permission_classes([IsAuthenticated])
@api_view(['GET'])
def get_book_ratings(request):
    """
    Endpoint to get the average rating and all ratings for a book.
    """
    book_id = request.query_params.get('bookId')

    if not book_id:
        return Response({"error": "bookId is required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        book = Book.objects.get(google_id=book_id)
    except Book.DoesNotExist:
        return Response({"error": "Book not found"}, status=status.HTTP_404_NOT_FOUND)

    ratings = Rating.objects.filter(book=book)
    if ratings.exists():
        # Calculate the cumulative rating (average rating)
        average_rating = sum(r.rating for r in ratings) / ratings.count()
        cumulative_rating = average_rating  # This is the same as the average_rating
        all_ratings = [{"user": r.user.username, "rating": r.rating} for r in ratings]
        return Response({
            "book": {"id": book.google_id, "title": book.title, "authors": book.authors},
            "average_rating": average_rating,
            "cumulative_rating": cumulative_rating,  # Add cumulative rating here
            "ratings": all_ratings
        }, status=status.HTTP_200_OK)
    else:
        return Response({"message": "No ratings for this book yet"}, status=status.HTTP_404_NOT_FOUND)
