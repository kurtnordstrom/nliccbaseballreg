from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Person, Family, Role, Player

    
class PersonSerializer(serializers.ModelSerializer):
    #user = serializers.PrimaryKeyRelatedField(many=False, queryset=User.objects.all())
    #user = serializers.SlugRelatedField(queryset=User.objects.all(), slug_field='username', required=False)
    class Meta:
        model = Person
        fields = ["id", "first_name", "last_name", "email", "date_of_birth", "address", "is_user", "family", "notes"]
        #extra_kwargs = {
        #    "user" : { "read_only":True},
        #    "family" : { "read_only" : True }
        #}

class NestedPersonSerializer(serializers.ModelSerializer):
    #user = serializers.PrimaryKeyRelatedField(many=False, queryset=User.objects.all())
    #user = serializers.SlugRelatedField(queryset=User.objects.all(), slug_field='username', required=False)
    class Meta:
        model = Person
        fields = ["id", "first_name", "last_name", "email", "date_of_birth", "address", "is_user", "notes"]
        #extra_kwargs = {
        #    "user" : { "read_only":True},
        #    "family" : { "read_only" : True }
        #}

class FamilySerializer(serializers.ModelSerializer):
    #person = PersonSerializer(required=False)
    class Meta:
        model = Family
        fields = ["id", "family_name", "dues", "dues_paid", "registration_submitted"]
    
    """
    def create(self, validated_data):
        person_data = validated_data.pop('person', None) 
        family = Family.objects.create(**validated_data)
        if person_data:
            family.refresh_from_db()
            Person.objects.create(family=family, **person_data)
        return family
    """

class UserSerializer(serializers.ModelSerializer):
    family = FamilySerializer(required=False)
    person = NestedPersonSerializer(required=False)
    class Meta:
        model = User
        fields = ["id", "username", "password", "person", "family"]
        extra_kwargs = {"password" : {"write_only": True}}
    
    def create(self, validated_data):
        print(validated_data)
        family_data = validated_data.pop('family', None)
        person_data = validated_data.pop('person', None)
        user = User.objects.create_user(**validated_data)
        if family_data and person_data:
            family = Family.objects.create(**family_data)
            person = Person.objects.create(user=user, family=family, **person_data)
        return user

class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = [ "name", "season", "person" ]

class PlayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Player
        fields = [ "id", "person", "shirt_size", "franchise_first", "franchise_second", "franchise_no", "season", "returning" ]