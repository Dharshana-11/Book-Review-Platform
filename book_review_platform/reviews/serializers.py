from rest_framework import serializers
from .models import Review, Report

class ReviewSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()
    likes_count = serializers.SerializerMethodField()
    has_liked = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = ['id', 'user', 'content', 'created_at', 'likes_count', 'has_liked']

    def get_user(self, obj):
        if obj.user is None:
            return {'username': None, 'profile_pic': None}
        
        return {
            'username': obj.user.username,
            'profile_pic': obj.user.profile.profile_pic.url if obj.user.profile.profile_pic else None
        }

    def get_likes_count(self, obj):
        return obj.likes.count()

    def get_has_liked(self, obj):
        request = self.context.get('request')  # Get request from context
        if request and request.user:  # Check if request and user exist
            user = request.user
            return user in obj.likes.all()
        return False

class ReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = ['id', 'review', 'user', 'reason', 'created_at']
