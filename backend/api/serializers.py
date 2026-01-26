from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Person, Family, Role, Player

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
    #user = serializers.PrimaryKeyRelatedField(many=False, queryset=User.objects.all())
    #user = serializers.SlugRelatedField(queryset=User.objects.all(), slug_field='username', required=False)
    class Meta:
        model = Person
        fields = ["id", "first_name", "last_name", "email", "date_of_birth", "address", "family", "is_user", "notes"]
        #extra_kwargs = {
        #    "user" : { "read_only":True},
        #    "family" : { "read_only" : True }
        #}

class FamilySerializer(serializers.ModelSerializer):
    class Meta:
        model = Family
        fields = ["id", "family_name", "dues", "dues_paid", "registration_submitted"]

class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = [ "name", "season", "person" ]

class PlayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Player
        fields = [ "person", "shirt_size", "franchise_first", "franchise_second", "franchise_no", "season", "returning" ]