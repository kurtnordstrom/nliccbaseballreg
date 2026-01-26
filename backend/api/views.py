from django.shortcuts import render
from django.contrib.auth.models import User
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
        person = Person.objects.get(user=user)
        family = person.family
        return Person.objects.filter(family=family)
    
    def perform_create(self, serializer):
        if serializer.is_valid():
            #do we only pass the custom values?
            user = None
            #print(serializer.validated_data)
            data = serializer.validated_data
            print(data)
            if data.get("is_user"):
                print("Person is a user")
                user = self.request.user
            else:
                print("Person is not a user")
            serializer.save(user=user)
        else:
            print(serializer.errors)

class FamilyCreateView(generics.CreateAPIView):
    queryset = Family.objects.all()
    serializer_class = FamilySerializer
    permission_classes = [IsAuthenticated]

class RoleCreateView(generics.CreateAPIView):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [IsAuthenticated]

class PlayerCreateView(generics.CreateAPIView):
    queryset = Player.objects.all()
    serializer_class = PlayerSerializer
    permission_classes = [IsAuthenticated]


            