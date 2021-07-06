from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    def serialize(self):
        return {
            'id': self.id,
            'username': self.username,
        }

class Job(models.Model):
    user_id = models.ForeignKey(User, on_delete=models.CASCADE, related_name="name")
    title = models.CharField(max_length=250)
    location = models.CharField(max_length=250)
    contact = models.CharField(max_length=250)
    text = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    verified = models.BooleanField(default=False)
    saved_list = models.ManyToManyField(User, blank=True, related_name="saved_jobs")

    def serialize(self): 
        return {
            'id': self.id,
            'user_id': self.user_id.username,
            'title': self.title,
            'location': self.location,
            'contact': self.contact,
            'text': self.text,
            'timestamp': self.timestamp.strftime('%B %d, %Y, %I:%M %p'),
            'saved_list': [user.username for user in self.saved_list.all()]
        }
