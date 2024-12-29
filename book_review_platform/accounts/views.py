from django.shortcuts import render

# Create your views here.
# views.py

from django.contrib.auth.models import User
from django.http import JsonResponse, QueryDict
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate, login
from .models import Profile, Genre
import base64
from django.core.files.base import ContentFile
import json
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import ProfileSerializer,GenreSerializer
from django.shortcuts import get_object_or_404
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import viewsets
from rest_framework.parsers import MultiPartParser, JSONParser
from rest_framework.permissions import IsAuthenticated

@csrf_exempt
def signup_view(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data.get('username')
            email = data.get('email')
            password = data.get('password')

            # Validate the data
            if not username or not email or not password:
                return JsonResponse({'error': 'All fields are required'}, status=400)

            if User.objects.filter(username=username).exists():
                return JsonResponse({'error': 'Username already exists'}, status=400)

            if User.objects.filter(email=email).exists():
                return JsonResponse({'error': 'Email already exists'}, status=400)

            # Create the user but do not activate them yet
            user = User.objects.create_user(username=username, email=email, password=password)
            user.is_active = False  # User cannot log in until profile setup is complete
            user.save()

            refresh = RefreshToken.for_user(user)
            token_data = {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
            return JsonResponse({
                'message': 'User registered successfully! Please complete your profile setup.',
                'token': token_data
            }, status=201)

        except Exception as e:
            return JsonResponse({'error': 'An error occurred: ' + str(e)}, status=500)

    return JsonResponse({'error': 'Invalid request method'}, status=405)

@csrf_exempt
def profile_setup_view(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data.get('username')
            bio = data.get('bio')
            favorite_genres = data.get('favoriteGenres', [])
            profile_pic_data = data.get('profilePic')  # Base64 string

            user = User.objects.get(username=username)

            if user.is_active:
                return JsonResponse({'error': 'Profile setup already completed.'}, status=400)

            # Decode Base64 string to an image file
            if profile_pic_data:
                format, imgstr = profile_pic_data.split(';base64,')
                ext = format.split('/')[-1]
                profile_pic_file = ContentFile(base64.b64decode(imgstr), name=f'{username}_profile.{ext}')
            else:
                profile_pic_file = None

            # Update profile
            profile = user.profile
            profile.bio = bio
            if profile_pic_file:
                profile.profile_pic = profile_pic_file
            profile.save()

            # Update favorite genres (many-to-many relationship)
            genre_objects = Genre.objects.filter(id__in=favorite_genres)
            profile.favorite_genres.set(genre_objects)

            # Activate the user
            user.is_active = True
            user.save()

            return JsonResponse({'message': 'Profile updated successfully and account activated!'}, status=200)

        except User.DoesNotExist:
            return JsonResponse({'error': 'User does not exist'}, status=404)
        except Exception as e:
            return JsonResponse({'error': 'An error occurred: ' + str(e)}, status=500)

    return JsonResponse({'error': 'Invalid request method'}, status=405)

@csrf_exempt
def login_view(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data.get('username')
            password = data.get('password')

            # Validate the input
            if not username or not password:
                return JsonResponse({'error': 'Username and password are required'}, status=400)

            # Authenticate the user
            user = authenticate(request, username=username, password=password)

            if user is not None:
                if not user.is_active:
                    return JsonResponse({'error': 'Please complete your profile setup to activate your account.'}, status=403)

                # Generate JWT token
                refresh = RefreshToken.for_user(user)
                token_data = {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
                return JsonResponse({'message': 'Login successful!', 'token': token_data}, status=200)
            else:
                return JsonResponse({'error': 'Invalid username or password'}, status=401)

        except Exception as e:
            return JsonResponse({'error': 'An error occurred: ' + str(e)}, status=500)

    return JsonResponse({'error': 'Invalid request method'}, status=405)

from rest_framework.parsers import MultiPartParser, JSONParser

class ProfileView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, JSONParser]  # To handle both file uploads and JSON data

    def get(self, request):
        try:
            # Fetch the logged-in user's profile
            profile = get_object_or_404(Profile, user=request.user)
            serializer = ProfileSerializer(profile)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': 'An error occurred while fetching the profile.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def put(self, request):
        try:
            # Parse favorite_genres from JSON string to a Python list
            if isinstance(request.data, QueryDict):
                request_data = request.data.dict()
            else:
                request_data = request.data

            if 'favorite_genres' in request_data:
                request_data['favorite_genres'] = json.loads(request_data['favorite_genres'])

            profile = get_object_or_404(Profile, user=request.user)
            serializer = ProfileSerializer(profile, data=request_data, partial=True)

            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': f'An error occurred: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class GenreViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Genre.objects.all()
    serializer_class = GenreSerializer
    permission_classes = [IsAuthenticated]  # Only authenticated users can access

class ProfileViewSet(viewsets.ModelViewSet):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer


def genres_list_view(request):
    if request.method == 'GET':
        genres = Genre.objects.all()
        serializer = GenreSerializer(genres, many=True)
        return JsonResponse(serializer.data, safe=False)
    return JsonResponse({'error': 'Invalid request method'}, status=405)

from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_favorite_genres(request):
    try:
        user = request.user
        profile = Profile.objects.get(user=user)
        favorite_genres = profile.favorite_genres.all().values_list('name', flat=True)
        return JsonResponse({'favoriteGenres': list(favorite_genres)}, status=200)
    except Profile.DoesNotExist:
        return JsonResponse({'error': 'Profile not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': f'An error occurred: {str(e)}'}, status=500)
