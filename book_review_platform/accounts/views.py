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
from rest_framework.decorators import api_view, permission_classes
from django.core.mail import send_mail
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.template.loader import render_to_string
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_decode
from django.http import JsonResponse
from django.utils.encoding import force_bytes
from django.contrib.auth import get_user_model

@csrf_exempt
def signup_view(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data.get('username')
            email = data.get('email')
            password = data.get('password')

            if not username or not email or not password:
                return JsonResponse({'error': 'All fields are required'}, status=400)

            if User.objects.filter(username=username).exists():
                return JsonResponse({'error': 'Username already exists'}, status=400)

            if User.objects.filter(email=email).exists():
                return JsonResponse({'error': 'E-mail ID already exists'}, status=400)

            user = User.objects.create_user(username=username, email=email, password=password)
            user.is_active = False  # User cannot log in yet
            user.save()

            # Send verification email
            send_verification_email(user, request)

            return JsonResponse({
                'message': 'User registered successfully! Please verify your e-mail.',
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
            profile = user.profile

            if profile.profile_complete:
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
            profile.profile_complete = True
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
            if user is None:
                return JsonResponse({'error': 'Invalid username or password'}, status=401)

            # Fetch user profile
            profile = user.profile

            # If user is not verified, ask for email verification
            if not profile.is_verified:
                return JsonResponse({
                    'error': 'Account not verified. Would you like to resend the verification e-mail?',
                    'verification_pending': True,
                    'is_verified': False  # Explicitly send is_verified
                }, status=403)

            # If profile setup is incomplete, redirect to setup
            if not user.is_active or not profile.profile_complete:
                return JsonResponse({
                    'error': 'Profile setup incomplete. Redirecting...',
                    'profile_complete': False,
                    'is_verified': profile.is_verified  # Explicitly send is_verified
                }, status=403)

            # Generate JWT token
            refresh = RefreshToken.for_user(user)
            return JsonResponse({
                'message': 'Login successful!',
                'token': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                },
                'user': {
                    'username': user.username,
                    'email': user.email,
                    'profile_complete': profile.profile_complete,
                    'is_verified': profile.is_verified  # Explicitly send is_verified
                }
            }, status=200)

        except Exception as e:
            return JsonResponse({'error': 'An error occurred: ' + str(e)}, status=500)

    return JsonResponse({'error': 'Invalid request method'}, status=405)

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

def send_verification_email(user, request):
    """
    Sends a verification email to the user with a unique link to complete registration.
    """
    # Generate token for email verification
    token = default_token_generator.make_token(user)  

    # Encode the user's ID to be passed in the verification URL
    uid = urlsafe_base64_encode(force_bytes(user.pk))

    # Set the frontend URL (React app) for email verification
    frontend_url = 'http://localhost:3000' 
    verification_link = f"{frontend_url}/verify-email/{uid}/{token}/"
    print("Verification URL:", verification_link)

    # Prepare the subject and email message
    subject = "Please verify your e-mail address"

    # Render the email HTML template with dynamic content
    html_message = render_to_string('registration/email_verification_email.html', {
        'username': user.username,
        'verification_link': verification_link,
        'current_year': 2025  
    })
    # print(html_message) 
    send_mail(
        subject,
        '',  # Empty plain text content (HTML will be used)
        'no.reply.critique.cove@gmail.com',  # From email 
        [user.email],  # To email
        fail_silently=False,
        html_message=html_message  # HTML content 
    )

    return JsonResponse({'message': 'Verification e-mail sent!'})

def verify_email(request, uidb64, token):
    try:
        print("Received UID:", uidb64)
        print("Received Token:", token)
        
        # Decode user ID
        uid = urlsafe_base64_decode(uidb64).decode()
        print("Decoded UID:", uid)
        
        user = User.objects.get(pk=uid)
        
        # Validate token
        if default_token_generator.check_token(user, token):
            user.is_active = True  # Activate the user
            user.profile.is_verified=True
            user.save()

            # Generate JWT token
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)

            return JsonResponse({
                "message": "Your e-mail has been verified successfully!",
                "token": access_token,
                "username": user.username
            })

        else:
            return JsonResponse({"error": "Invalid or expired verification link."}, status=400)

    except (TypeError, ValueError, OverflowError, User.DoesNotExist) as e:
        print(f"Error: {e}")
        return JsonResponse({"error": "Invalid verification link."}, status=400)

@csrf_exempt
def resend_verification_email(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data.get('username')

            # Validate input
            if not username:
                return JsonResponse({'error': 'Username is required'}, status=400)

            # Get the user object
            try:
                user = User.objects.get(username=username)
            except User.DoesNotExist:
                return JsonResponse({'error': 'User does not exist'}, status=404)

            # Check if user is already verified
            if user.profile.is_verified:
                return JsonResponse({'message': 'Your account is already verified.'}, status=200)
            
            # Send verification email again
            send_verification_email(user, request)  
            return JsonResponse({'message': 'Verification e-mail sent successfully!'}, status=200)

        except Exception as e:
            return JsonResponse({'error': 'An error occurred: ' + str(e)}, status=500)

    return JsonResponse({'error': 'Invalid request method'}, status=405)

@csrf_exempt
def forgot_password_view(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            email = data.get('email')

            if not email:
                return JsonResponse({'error': 'Email is required'}, status=400)

            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                return JsonResponse({'error': 'User does not exist'}, status=404)

            # Generate token for password reset
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))

            # Send reset password email (directs to  reset password page)
            reset_link = f'http://localhost:3000/reset-password/{uid}/{token}/'

            # Render the HTML email content
            html_message = render_to_string('email/password_reset_email.html', {
                'username': user.username,
                'reset_link': reset_link,
                'current_year': 2025  # Or dynamically fetch the current year
            })

            # Send email
            send_mail(
                'Password Reset Request',  # Subject of the email
                '',  # Plain text content (HTML is used instead)
                'noreply.critique.cove@gmail.com', 
                [email],  # Recipient email (user's email)
                fail_silently=False,
                html_message=html_message  # HTML content of the email
            )

            return JsonResponse({'message': 'Password reset email sent successfully!'}, status=200)
        except Exception as e:
            return JsonResponse({'error': f'An error occurred: {str(e)}'}, status=500)

    return JsonResponse({'error': 'Invalid request method'}, status=405)



User = get_user_model()

@csrf_exempt
def password_reset_confirm(request, uidb64, token):
    try:
        # Decode the user ID from the URL
        uid = urlsafe_base64_decode(uidb64).decode()
        user = User.objects.get(pk=uid)

        # Verify the token
        if not default_token_generator.check_token(user, token):
            return JsonResponse({'error': 'The reset link is invalid or has expired.'}, status=400)

        # Process password reset
        if request.method == 'POST':
            data = json.loads(request.body)  # Read JSON data from request
            new_password = data.get('password')

            if not new_password:
                return JsonResponse({'error': 'Password is required.'}, status=400)

            user.set_password(new_password)
            user.save()

            return JsonResponse({'message': 'Your password has been reset successfully!'}, status=200)

        return JsonResponse({'message': 'Ready to reset password.'}, status=200)

    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        return JsonResponse({'error': 'The reset link is invalid or has expired.'}, status=400)
