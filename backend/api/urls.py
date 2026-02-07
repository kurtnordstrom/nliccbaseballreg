from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path("user/register/", views.CreateUserView.as_view(), name="register"),
    path("token/", TokenObtainPairView.as_view(), name="get_token"),
    path("token/refresh/", TokenRefreshView.as_view(), name="refresh"),
    path("person/", views.PersonListCreateView.as_view(), name="person"),
    path("person/<int:pk>/", views.PersonDetailView.as_view(), name="person_detail"),
    path("family/", views.FamilyListCreateView.as_view(), name="family"),
    path("family/<int:pk>/", views.FamilyDetailView.as_view(), name="family_detail"),
    path("role/", views.RoleListCreateView.as_view(), name="role"),
    path("role/<int:pk>/", views.RoleDetailView.as_view(), name="role_detail"),
    path("player/", views.PlayerListCreateView.as_view(), name="player"),
    path("player/<int:pk>/", views.PlayerDetailView.as_view(), name="player_detail"),
]