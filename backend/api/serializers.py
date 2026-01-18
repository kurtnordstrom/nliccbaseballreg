from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Person

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "password"]
        extra_kwargs = {"password" : {"write_only": True}}
    
    def create(self, validated_data):
        print(validated_data)
        user = User.objects.create_user(**validated_data)
        return user
    
class PersonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Person
        fields = ["first_name", "last_name", "email", "date_of_birth", "address", "family", "user", "notes"]
        extra_kwargs = {
            "user" : { "read_only":True},
            "family" : { "read_only" : True }
        }