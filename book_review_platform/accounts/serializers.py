from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Profile, Genre
import os

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

class GenreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Genre
        fields = ['id','key', 'name']  # Return the id and name of genres

class SignUpSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'password', 'email']

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)  # Create a user with hashed password
        return user

class ProfileSerializer(serializers.ModelSerializer):
    favorite_genres = serializers.SlugRelatedField(
        slug_field='key',  # Slug is stored in the 'key' field
        queryset=Genre.objects.all(),
        many=True
    )
    username = serializers.CharField(source='user.username')

    class Meta:
        model = Profile
        fields = ['bio', 'profile_pic', 'favorite_genres', 'username']

    def update(self, instance, validated_data):
        favorite_genres = validated_data.pop('favorite_genres', [])
        new_profile_pic = validated_data.get('profile_pic', None)

        # Handle profile picture update
        if new_profile_pic:
            # Delete the old profile picture if it exists
            if instance.profile_pic and os.path.isfile(instance.profile_pic.path):
                os.remove(instance.profile_pic.path)

            # Generate a new file name for the profile picture
            file_extension = new_profile_pic.name.split('.')[-1]
            new_file_name = f"{instance.user.username}_profile.{file_extension}"
            
            # Save the new profile picture with the new file name
            instance.profile_pic.save(new_file_name, new_profile_pic)

        # Update other fields
        instance.bio = validated_data.get('bio', instance.bio)
        instance.save()

        # Update favorite genres (many-to-many relationship)
        instance.favorite_genres.set(favorite_genres)

        return instance
