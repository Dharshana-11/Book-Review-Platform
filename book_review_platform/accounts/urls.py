from django.urls import path
from . import views
from .views import ProfileView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
     path('signup/', views.signup_view, name='signup'),
     path('profile/setup/', views.profile_setup_view, name='profile_setup'),
     path('login/', TokenObtainPairView.as_view(), name='login'),  # JWT login - Generates a new pair of tokens (access and refresh) when a user logs in.
     path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'), # Refresh token endpoint - Generates a new access token using the refresh token
     path("profile/", ProfileView.as_view(), name="profile"),
     path('genres/', views.genres_list_view, name='genres_list'),
      path('user/favorite-genres/', views.user_favorite_genres, name='user-favorite-genres'),
]