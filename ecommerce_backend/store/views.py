from rest_framework import generics, status, viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from datetime import timedelta
from django.db import transaction
import uuid

from .models import Product, ProductCategory, Cart, CartItem, Voucher, Customer, CustomerAdress, SalesOrderHeader, SalesOrderDetail, CustomerEmailAddress, CustomerPhone
from .serializers import (
    ProductSerializer, ProductCategorySerializer, CartItemSerializer, UserSerializer,
    VoucherSerializer, CartSerializer, AddressSerializer
)
from .cart_utils import get_cart

# === CÁC VIEW HIỆN CÓ ===

class AddressViewSet(viewsets.ModelViewSet):
    serializer_class = AddressSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        try:
            customer = Customer.objects.get(customeremailaddress__emailaddress=user.username)
            return CustomerAdress.objects.filter(customerid=customer)
        except Customer.DoesNotExist:
            return CustomerAdress.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        try:
            customer = Customer.objects.get(customeremailaddress__emailaddress=user.username)
            serializer.save(customerid=customer)
        except Customer.DoesNotExist:
            pass

class ProductList(generics.ListCreateAPIView):
    queryset = Product.objects.prefetch_related('productinventory_set').all()
    serializer_class = ProductSerializer
    permission_classes = [AllowAny] # Ép quyền truy cập công khai

class ProductDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Product.objects.prefetch_related('productinventory_set').all()
    serializer_class = ProductSerializer
    permission_classes = [AllowAny] # Ép quyền truy cập công khai

class CategoryList(generics.ListAPIView):
    queryset = ProductCategory.objects.prefetch_related('productsubcategory_set').all()
    serializer_class = ProductCategorySerializer
    permission_classes = [AllowAny] # Ép quyền truy cập công khai

class CartDetailView(generics.RetrieveAPIView):
    serializer_class = CartSerializer
    permission_classes = [AllowAny] # Ép quyền truy cập công khai

    def get_object(self):
        return get_cart(self.request)

class AddCartItemView(APIView):
    permission_classes = [AllowAny] # Ép quyền truy cập công khai

    def post(self, request):
        cart = get_cart(request)
        if not cart:
            return Response({"error": "Could not get cart"}, status=status.HTTP_400_BAD_REQUEST)

        product_id = request.data.get('productid')
        quantity = int(request.data.get('quantity', 1))

        try:
            product = Product.objects.get(pk=product_id)
        except Product.DoesNotExist:
            return Response({"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND)

        cart_item, created = CartItem.objects.get_or_create(
            cartid=cart,
            productid=product,
            defaults={'quantity': quantity, 'unitprice': product.standardcost}
        )

        if not created:
            cart_item.quantity += quantity
            cart_item.save()

        return Response({"message": "Item added to cart"}, status=status.HTTP_200_OK)

class CheckoutView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        # 1. Lấy giỏ hàng hiện tại
        cart = get_cart(request)
        if not cart or not cart.cartitem_set.exists():
            return Response({"error": "Cart is empty"}, status=status.HTTP_400_BAD_REQUEST)

        # 2. Lấy thông tin khách hàng
        customer = None
        
        if request.user.is_authenticated:
            # LOGIC CHO USER ĐÃ ĐĂNG NHẬP
            try:
                customer = Customer.objects.get(customeremailaddress__emailaddress=request.user.username)
            except Customer.DoesNotExist:
                return Response({"error": "Customer profile not found"}, status=status.HTTP_400_BAD_REQUEST)
        else:
            # LOGIC CHO KHÁCH VÃNG LAI (GUEST)
            guest_info = request.data.get('guest_info')
            if not guest_info:
                return Response({"error": "Guest information is required"}, status=status.HTTP_400_BAD_REQUEST)
            
            try:
                with transaction.atomic():
                    # Tạo Customer mới
                    customer = Customer.objects.create(
                        firstname=guest_info.get('firstname'),
                        lastname=guest_info.get('lastname'),
                        middlename=''
                    )
                    # Tạo Email
                    CustomerEmailAddress.objects.create(
                        customerid=customer,
                        emailaddress=guest_info.get('email'),
                        modifieddate=timezone.now()
                    )
                    # Tạo Địa chỉ (Lưu địa chỉ khách nhập vào DB)
                    CustomerAdress.objects.create(
                        customerid=customer,
                        addressline1=guest_info.get('addressline1'),
                        city=guest_info.get('city'),
                        postalcode=guest_info.get('postalcode'),
                        modifieddate=timezone.now()
                    )
                    # Tạo Số điện thoại (Mặc định loại 1 - Cell)
                    CustomerPhone.objects.create(
                        customerid=customer,
                        phonenumber=guest_info.get('phone'),
                        phonenumbertypeid=1, 
                        modifieddate=timezone.now()
                    )
            except Exception as e:
                return Response({"error": f"Error creating guest profile: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # 3. Tính toán tổng tiền
        cart_items = cart.cartitem_set.all()
        subtotal = sum(item.subtotal for item in cart_items)
        freight = 0 # Phí ship mặc định
        total_due = subtotal + freight

        # 4. Tạo SalesOrderHeader
        # Lưu ý: SalesOrderNumber cần unique, ở đây dùng UUID ngắn gọn để demo
        order_number = f"SO-{uuid.uuid4().hex[:10].upper()}"
        
        order = SalesOrderHeader.objects.create(
            customerid=customer,
            orderdate=timezone.now(),
            duedate=timezone.now() + timedelta(days=12),
            shipdate=timezone.now() + timedelta(days=2),
            freight=freight,
            salesordernumber=order_number,
            totaldue=total_due,
            orderstatus='Pending',
            modifieddate=timezone.now()
        )

        # 5. Tạo SalesOrderDetail và xóa CartItem
        # Lưu ý: SalesOrderDetailID thường là tự tăng trong DB, ta để DB tự xử lý hoặc Django xử lý nếu config đúng
        # Vì model SalesOrderDetail managed=False và dùng CompositeKey, việc insert có thể phức tạp tùy DB.
        # Ở đây giả định DB có trigger hoặc Identity column cho SalesOrderDetailID.
        
        for index, item in enumerate(cart_items):
            SalesOrderDetail.objects.create(
                salesorderid=order,
                orderqty=item.quantity,
                productid=item.productid.productid,
                unitprice=item.unitprice,
                modifieddate=timezone.now()
            )
            item.delete() # Xóa item khỏi giỏ sau khi đặt hàng

        # 6. Cập nhật trạng thái giỏ hàng (hoặc xóa giỏ hàng nếu muốn)
        # cart.delete() # Tùy chọn: xóa luôn giỏ hàng

        return Response({
            "message": "Order placed successfully", 
            "order_number": order_number,
            "order_id": order.salesorderid
        }, status=status.HTTP_201_CREATED)

class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

# === CÁC VIEW CẦN LÀM (TODO LIST) ===

class ProductSearchView(generics.ListAPIView):
    queryset = Product.objects.prefetch_related('productinventory_set').all()
    serializer_class = ProductSerializer
    filter_backends = [DjangoFilterBackend]
    permission_classes = [AllowAny] # Ép quyền truy cập công khai
    pass

class CartItemUpdateDeleteView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CartItemSerializer
    permission_classes = [AllowAny] # Ép quyền truy cập công khai

    def get_queryset(self):
        cart = get_cart(self.request)
        if cart:
            return CartItem.objects.filter(cartid=cart)
        return CartItem.objects.none()

class CategoryManageView(generics.ListCreateAPIView, generics.RetrieveUpdateDestroyAPIView):
    queryset = ProductCategory.objects.all()
    serializer_class = ProductCategorySerializer
    permission_classes = [IsAdminUser]
    pass

class AdminUserListView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]
    pass

class VoucherManageView(generics.ListCreateAPIView, generics.RetrieveUpdateDestroyAPIView):
    queryset = Voucher.objects.all()
    serializer_class = VoucherSerializer
    permission_classes = [IsAdminUser]
    pass

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
