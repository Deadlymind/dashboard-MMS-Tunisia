from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('api/v1/exploitation/', include('exploitation.urls')),
    path("admin/", admin.site.urls),
    path("api/v1/core/", include("core.urls")),
]
