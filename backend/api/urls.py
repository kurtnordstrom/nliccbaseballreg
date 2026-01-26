from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path("user/register/", views.CreateUserView.as_view(), name="register"),
    path("token/", TokenObtainPairView.as_view(), name="get_token"),
    path("token/refresh/", TokenRefreshView.as_view(), name="refresh"),
    path("person/", views.PersonListCreateView.as_view(), name="family"),
    path("family/", views.FamilyCreateView.as_view(), name="family"),
    path("role/", views.RoleCreateView.as_view(), name="role"),
    path("player/", views.PlayerCreateView.as_view(), name="player")
]