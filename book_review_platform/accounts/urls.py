from django.urls import path
from . import views
from .views import ProfileView
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
     path('signup/', views.signup_view, name='signup'),
     path('profile/setup/', views.profile_setup_view, name='profile_setup'),
     path('login/', views.login_view, name='login'),
     path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'), # Refresh token endpoint - Generates a new access token using the refresh token
     path("profile/", ProfileView.as_view(), name="profile"),
     path('genres/', views.genres_list_view, name='genres_list'),
     path('user/favorite-genres/', views.user_favorite_genres, name='user-favorite-genres'),
     path('verify-email/<str:uidb64>/<str:token>/', views.verify_email, name='verify_email'),
     path('resend-verification/', views.resend_verification_email, name='resend_verification'),
     path('forgot-password/', views.forgot_password_view, name='forgot_password'),
     path('reset-password/<uidb64>/<token>/', views.password_reset_confirm, name='password_reset_confirm'),
     path('change-password/', views.change_password, name='change_password'),
     path('change-username/', views.change_username, name='change_username'),
     path('delete-account/', views.delete_account, name='delete_account'),
]