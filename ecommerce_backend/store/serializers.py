from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    Product, ProductSubcategory, ProductCategory, CartItem, Voucher, Cart, 
    ProductInventory, CustomerAdress
)

# === CÁC SERIALIZER HIỆN CÓ ===

class ProductSubcategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductSubcategory
        fields = ('productsubcategoryid', 'name')

class ProductCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductCategory
        fields = ('productcategoryid', 'name', 'modifieddate')

class ProductSerializer(serializers.ModelSerializer):
    product_subcategory = serializers.SerializerMethodField()
    product_category = serializers.SerializerMethodField()
    inventory = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'productid', 'name', 'productnumber', 'color', 'standardcost', 
            'listprice', 'size', 'daystomanufacture', 'productline', 'style', 
            'sellstartdate', 'sellenddate', 'product_subcategory', 'product_category', 'inventory'
        ]

    def get_product_subcategory(self, obj):
        if obj.productsubcategoryid:
            return obj.productsubcategoryid.name
        return None

    def get_product_category(self, obj):
        if obj.productsubcategoryid and obj.productsubcategoryid.productcategoryid:
            return obj.productsubcategoryid.productcategoryid.name
        return None

    def get_inventory(self, obj):
        if hasattr(obj, 'productinventory_set'):
            total_quantity = sum(item.quantity for item in obj.productinventory_set.all())
            return total_quantity
        return 0

class CartItemSerializer(serializers.ModelSerializer):
    productid = ProductSerializer(read_only=True)
    subtotal = serializers.DecimalField(max_digits=21, decimal_places=2, read_only=True)
    class Meta:
        model = CartItem
        fields = [
            'cartitemid', 'cartid', 'productid', 'quantity', 
            'unitprice', 'subtotal', 'dateadded', 'dateupdated'
        ]

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_staff']

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(source='cartitem_set', many=True, read_only=True)

    class Meta:
        model = Cart
        fields = ['cartid', 'customerid', 'createddate', 'modifieddate', 'status', 'items']

class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerAdress
        fields = ['addressid', 'addressline1', 'city', 'postalcode']
        read_only_fields = ['customerid']

# === CÁC SERIALIZER CẦN LÀM (TODO LIST) ===

# --- UC-12: Serializer cho Voucher ---
class VoucherSerializer(serializers.ModelSerializer):
    class Meta:
        model = Voucher 
        fields = '__all__'
