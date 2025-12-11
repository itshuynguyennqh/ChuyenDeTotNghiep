from django.urls import path, include
from .views import ProductList, ProductDetail, CategoryList, CartDetailView

urlpatterns = [
    # URLs for regular ORM-based views
    path('products/', ProductList.as_view(), name='product-list'),
    path('products/<int:pk>/', ProductDetail.as_view(), name='product-detail'),
    path('categories/', CategoryList.as_view(), name='category-list'),
    path('cart/', CartDetailView.as_view(), name='cart-detail'),

    # URLs for Stored Procedure-based views
    path('proc/', include('store.procedure_urls')),
]
