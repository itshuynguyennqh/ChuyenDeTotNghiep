from rest_framework import generics
from .models import Product
from .serializers import ProductSerializer

class ProductList(generics.ListCreateAPIView):
    """
    API view để lấy danh sách tất cả sản phẩm hoặc tạo một sản phẩm mới.
    """
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
