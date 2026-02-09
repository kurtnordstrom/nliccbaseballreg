from django.db import models
from django.contrib.auth.models import User
# Create your models here.

class Family(models.Model):
    family_name = models.CharField(max_length=100)
    dues = models.BigIntegerField(default=0.0)
    payment_option = models.CharField(max_length=36, blank=True)
    registration_submitted = models.BooleanField(default=False)
    registration_date = models.DateTimeField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)

class Person(models.Model):
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.CharField(max_length=256, blank=True)
    phone_primary = models.CharField(max_length=32, blank=True)
    phone_secondary = models.CharField(max_length=32, blank=True)
    date_of_birth = models.DateField()
    address = models.CharField(max_length=256, blank=True)
    family = models.ForeignKey(Family, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE, blank=True, null=True)
    is_user = models.BooleanField(default=False)
    medical_experience = models.CharField(max_length=64, blank=True)

class Role(models.Model):
    name = models.CharField(max_length=100)
    person = models.ForeignKey(Person, on_delete=models.DO_NOTHING)
    season = models.CharField(max_length=4)

class Player(models.Model):
    person = models.ForeignKey(Person, on_delete=models.CASCADE)
    shirt_size = models.CharField(max_length=32)
    franchise_first = models.CharField(max_length=32, blank=True)
    franchise_second = models.CharField(max_length=32, blank=True)
    franchise_no = models.CharField(max_length=32, null=True, blank=True)
    season = models.CharField(max_length=4)
    returning = models.BooleanField(default=False)
    can_catch = models.BooleanField(default=False)
    can_pitch = models.BooleanField(default=False)
