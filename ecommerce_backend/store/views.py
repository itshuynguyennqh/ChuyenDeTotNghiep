from rest_framework import generics
from .models import Product, ProductCategory
from .serializers import ProductSerializer, ProductCategorySerializer

class ProductList(generics.ListCreateAPIView):
    """
    API view để lấy danh sách tất cả sản phẩm hoặc tạo một sản phẩm mới.
    """
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

class ProductDetail(generics.RetrieveUpdateDestroyAPIView):
    """
    API view để lấy, cập nhật hoặc xóa một sản phẩm.
    """
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

class CategoryList(generics.ListAPIView):
    """
    API view để lấy danh sách tất cả các Category, bao gồm cả Subcategory của chúng.
    """
    queryset = ProductCategory.objects.prefetch_related('productsubcategory_set').all()
    serializer_class = ProductCategorySerializer
