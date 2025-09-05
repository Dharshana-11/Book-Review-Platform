from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils.text import slugify

class Genre(models.Model):
    key = models.SlugField(max_length=100, unique=True, default='unknown')  #SlugField for key
    name = models.CharField(max_length=100)
    def save(self, *args, **kwargs):
        if not self.key:  # If no key exists, generate one from the name
            self.key = slugify(self.name)
        super().save(*args, **kwargs)
    def __str__(self):
        return self.name

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    bio = models.CharField(max_length=255, default='No bio provided')
    favorite_genres = models.ManyToManyField(Genre, blank=True)  # Reference to Genre table
    profile_pic = models.ImageField(upload_to='profile_pics/', blank=True, null=True)
    profile_complete = models.BooleanField(default=False)
    is_verified = models.BooleanField(default=False)
    def __str__(self):
        return self.user.username
    
@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)
@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()