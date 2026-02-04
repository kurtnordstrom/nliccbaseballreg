from django.shortcuts import render
from django.contrib.auth.models import User
from django.core.exceptions import ObjectDoesNotExist
from .serializers import UserSerializer, PersonSerializer, FamilySerializer, RoleSerializer, PlayerSerializer
from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from .models import Person, Family, Role, Player

class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

class PersonListCreateView(generics.ListCreateAPIView):
    serializer_class = PersonSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        family = None
        try:
            person = Person.objects.get(user__id=user.id)
            family = person.family
        except ObjectDoesNotExist:
            family = None
        return Person.objects.filter(family=family)
    
    def perform_create(self, serializer):
        if serializer.is_valid():
            #do we only pass the custom values?
            user = None
            #print(serializer.validated_data)
            data = serializer.validated_data
            print(data)
            if data.get("is_user"):
                user = self.request.user
            serializer.save(user=user)
        else:
            print(serializer.errors)

class PersonDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Person.objects.all()
    serializer_class = PersonSerializer
    permission_classes = [IsAuthenticated]

class FamilyListCreateView(generics.ListCreateAPIView):
    queryset = Family.objects.all()
    serializer_class = FamilySerializer
    permission_classes = [IsAuthenticated]


class RoleListCreateView(generics.ListCreateAPIView):
    #queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self): 
        queryset = Role.objects.all()
        person_id = self.request.query_params.get('person')
        if person_id is not None:
            queryset = queryset.filter(person=person_id)
        return queryset
    
class RoleDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [IsAuthenticated]

class PlayerListCreateView(generics.ListCreateAPIView):
    #queryset = Player.objects.all()
    serializer_class = PlayerSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Player.objects.all()
        person_id = self.request.query_params.get('person')
        if person_id is not None:
            queryset = queryset.filter(person=person_id)
        return queryset


class PlayerDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Player.objects.all()
    serializer_class = PlayerSerializer
    permission_classes = [IsAuthenticated]


            