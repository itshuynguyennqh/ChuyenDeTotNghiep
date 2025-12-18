from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django_filters.rest_framework import DjangoFilterBackend

from .models import Product, ProductCategory, Cart, CartItem, Voucher
from .serializers import (
    ProductSerializer, ProductCategorySerializer, CartItemSerializer, UserSerializer,
    VoucherSerializer
)

# === CÁC VIEW HIỆN CÓ ===

class ProductList(generics.ListCreateAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

class ProductDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

class CategoryList(generics.ListAPIView):
    queryset = ProductCategory.objects.prefetch_related('productsubcategory_set').all()
    serializer_class = ProductCategorySerializer

class CartDetailView(generics.RetrieveAPIView):
    serializer_class = CartItemSerializer
    def get_object(self):
        cart_obj, created = Cart.objects.get_or_create(pk=1)
        return cart_obj

class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

# === CÁC VIEW CẦN LÀM (TODO LIST) ===

# --- UC-02: Tìm kiếm & Lọc sản phẩm ---
class ProductSearchView(generics.ListAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    filter_backends = [DjangoFilterBackend]
    # TODO: Cài đặt 'django-filter' và cấu hình các trường lọc
    # filterset_fields = ['category', 'price', 'name']
    # Ví dụ URL: /api/products/search/?name=Ao&price__gt=100
    pass

# --- UC-03: Sửa/Xóa item trong giỏ hàng ---
class CartItemUpdateDeleteView(generics.RetrieveUpdateDestroyAPIView):
    # TODO: Viết logic để lấy đúng item trong giỏ của user hiện tại
    # queryset = CartItem.objects.filter(cart__user=self.request.user)
    serializer_class = CartItemSerializer
    permission_classes = [IsAuthenticated]
    pass

# --- UC-08: Quản lý danh mục ---
class CategoryManageView(generics.ListCreateAPIView, generics.RetrieveUpdateDestroyAPIView):
    queryset = ProductCategory.objects.all()
    serializer_class = ProductCategorySerializer
    permission_classes = [IsAdminUser] # Chỉ Admin được làm
    # TODO: Class này đã có sẵn các method GET, POST, PUT, DELETE.
    # Bạn chỉ cần đảm bảo Serializer hỗ trợ ghi (write).
    pass

# --- UC-10 & UC-11: Quản lý người dùng ---
class AdminUserListView(generics.ListAPIView):
    # TODO: Lấy danh sách User và serialize bằng UserSerializer
    # queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]
    pass

# --- UC-12: Quản lý Voucher ---
class VoucherManageView(generics.ListCreateAPIView, generics.RetrieveUpdateDestroyAPIView):
    queryset = Voucher.objects.all()
    serializer_class = VoucherSerializer
    permission_classes = [IsAdminUser] # Chỉ Admin mới có quyền quản lý Voucher
    pass

# --- UC-13: Báo cáo doanh thu ---
class RevenueReportView(APIView):
    permission_classes = [IsAdminUser]
    def get(self, request):
        # TODO: Lấy query params 'start_date' và 'end_date'
        # start_date = request.query_params.get('start_date')
        # end_date = request.query_params.get('end_date')
        
        # TODO: Viết logic query vào model Order/SalesOrderHeader để tính tổng doanh thu
        # total_revenue = SalesOrderHeader.objects.filter(orderdate__range=[start_date, end_date]).aggregate(Sum('totaldue'))
        
        # Dữ liệu giả
        report_data = {
            "start_date": "2024-01-01",
            "end_date": "2024-12-31",
            "total_revenue": 123456.78,
            "total_orders": 100
        }
        return Response(report_data, status=status.HTTP_200_OK)
