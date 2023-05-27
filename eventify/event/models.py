from django.db import models
from django.utils.timezone import now
from django.contrib.auth.models import AbstractUser

# Create your models here.
class User(AbstractUser):
    budget = models.FloatField(default=0)
    
    def __str__(self):
        return f"{self.username}"

class Event(models.Model):
    name = models.CharField(max_length=64)
    description = models.TextField(blank=True)
    start = models.DateTimeField(default=now)
    end = models.DateTimeField(default=now)
    location = models.TextField(blank=True)
    weather = models.TextField(blank=True)
    budget = models.FloatField(default=0)
    organizers = models.ManyToManyField(User, related_name='organized_events')
    participants = models.ManyToManyField(User, related_name='participated_events', blank=True)
    
    def __str__(self):
        return f"{self.name}"
    
class Activity(models.Model):
    name = models.CharField(max_length=64)
    description = models.TextField(blank=True)
    start = models.DateTimeField(default=now)
    end = models.DateTimeField(default=now)
    event = models.ForeignKey(Event, on_delete=models.CASCADE)
    location = models.TextField(blank=True)
    weather = models.TextField(blank=True)
    budget = models.FloatField(default=0)
    organizers = models.ManyToManyField(User, related_name='organized_activities')
    participants = models.ManyToManyField(User, related_name='participated_activities', blank=True)
    
    def __str__(self):
        return f"{self.start} to {self.end}: {self.name}"

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField()

    def __str__(self):
        return self.user.id