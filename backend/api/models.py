from django.db import models
from django.contrib.auth.models import User
# Create your models here.

class Family(models.Model):
    family_name = models.CharField(max_length=100)
    dues = models.BigIntegerField()
    dues_paid = models.BooleanField()

class Person(models.Model):
    name = models.CharField(max_length=100)
    email = models.CharField(max_length=256)
    date_of_birth = models.DateField()
    address = models.CharField(max_length=256)
    family = models.ForeignKey(Family, on_delete=models.DO_NOTHING)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    notes = models.TextField()

class Role(models.Model):
    name = models.CharField(max_length=100)
    person = models.ForeignKey(Person, on_delete=models.DO_NOTHING)
    season = models.CharField(max_length=4)

class Player(models.Model):
    person = models.ForeignKey(Person, on_delete=models.CASCADE)
    shirt_size = models.CharField(max_length=10)
    franchise_first = models.CharField(max_length=32)
    franchise_second = models.CharField(max_length=32)
    season = models.CharField(max_length=4)
    returning = models.BooleanField()
    