from rest_framework import generics
from .models import Product, ProductCategory, Cart
from .serializers import ProductSerializer, ProductCategorySerializer, CartItemSerializer


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



class CartDetailView(generics.RetrieveAPIView):
    #     dùng tạm 1 rỏ hangf
    serializer_class = CartItemSerializer

    def get_object(self):
        # tạm thời lấy rỏ ID 1
        # về sau thêm logic lấy rỏ của user ở đây
        cart_obj, created =  Cart.objects.get_or_create(pk=1)
        return cart_obj