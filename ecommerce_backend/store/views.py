from rest_framework import generics, status, viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone

from .models import Product, ProductCategory, Cart, CartItem, Voucher, Customer, CustomerAdress
from .serializers import (
    ProductSerializer, ProductCategorySerializer, CartItemSerializer, UserSerializer,
    VoucherSerializer, CartSerializer, AddressSerializer
)

# === CÁC VIEW HIỆN CÓ ===

class AddressViewSet(viewsets.ModelViewSet):
    serializer_class = AddressSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        This view should return a list of all the addresses
        for the currently authenticated user.
        """
        user = self.request.user
        try:
            customer = Customer.objects.get(customeremailaddress__emailaddress=user.username)
            return CustomerAdress.objects.filter(customerid=customer)
        except Customer.DoesNotExist:
            return CustomerAdress.objects.none()

    def perform_create(self, serializer):
        """
        Associate the address with the logged-in user's customer profile.
        """
        user = self.request.user
        try:
            customer = Customer.objects.get(customeremailaddress__emailaddress=user.username)
            serializer.save(customerid=customer, modifieddate=timezone.now())
        except Customer.DoesNotExist:
            # This should ideally not happen if the user is authenticated
            # and has a customer profile, but as a fallback.
            pass

    def perform_update(self, serializer):
        serializer.save(modifieddate=timezone.now())

class ProductList(generics.ListCreateAPIView):
    queryset = Product.objects.prefetch_related('productinventory_set').all()
    serializer_class = ProductSerializer

class ProductDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Product.objects.prefetch_related('productinventory_set').all()
    serializer_class = ProductSerializer

class CategoryList(generics.ListAPIView):
    queryset = ProductCategory.objects.prefetch_related('productsubcategory_set').all()
    serializer_class = ProductCategorySerializer

class CartDetailView(generics.RetrieveAPIView):
    serializer_class = CartSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        try:
            customer = Customer.objects.get(customeremailaddress__emailaddress=self.request.user.username)
            cart_obj, created = Cart.objects.get_or_create(customerid=customer, defaults={'status': 'Active'})
            return cart_obj
        except Customer.DoesNotExist:
            return None

class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

# === CÁC VIEW CẦN LÀM (TODO LIST) ===

# --- UC-02: Tìm kiếm & Lọc sản phẩm ---
class ProductSearchView(generics.ListAPIView):
    queryset = Product.objects.prefetch_related('productinventory_set').all()
    serializer_class = ProductSerializer
    filter_backends = [DjangoFilterBackend]
    # TODO: Cài đặt 'django-filter' và cấu hình các trường lọc
    # filterset_fields = ['category', 'price', 'name']
    # Ví dụ URL: /api/products/search/?name=Ao&price__gt=100
    pass

# --- UC-03: Sửa/Xóa item trong giỏ hàng ---
class CartItemUpdateDeleteView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CartItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        try:
            customer = Customer.objects.get(customeremailaddress__emailaddress=user.username)
            return CartItem.objects.filter(cartid__customerid=customer)
        except Customer.DoesNotExist:
            return CartItem.objects.none()

# --- UC-08: Quản lý danh mục ---
class CategoryManageView(generics.ListCreateAPIView, generics.RetrieveUpdateDestroyAPIView):
    queryset = ProductCategory.objects.all()
    serializer_class = ProductCategorySerializer
    permission_classes = [IsAdminUser]
    pass

# --- UC-10 & UC-11: Quản lý người dùng ---
class AdminUserListView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]
    pass

# --- UC-12: Quản lý Voucher ---
class VoucherManageView(generics.ListCreateAPIView, generics.RetrieveUpdateDestroyAPIView):
    queryset = Voucher.objects.all()
    serializer_class = VoucherSerializer
    permission_classes = [IsAdminUser]
    pass

# --- UC-13: Báo cáo doanh thu ---
class RevenueReportView(APIView):
    permission_classes = [IsAdminUser]
    def get(self, request):
        report_data = {
            "start_date": "2024-01-01",
            "end_date": "2024-12-31",
            "total_revenue": 123456.78,
            "total_orders": 100
        }
        return Response(report_data, status=status.HTTP_200_OK)
