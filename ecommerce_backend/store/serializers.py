from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Product, ProductSubcategory, ProductCategory, CartItem, Voucher

# === CÁC SERIALIZER HIỆN CÓ ===

class ProductSubcategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductSubcategory
        fields = ('productsubcategoryid', 'name')

class ProductCategorySerializer(serializers.ModelSerializer):
    subcategories = ProductSubcategorySerializer(source='productsubcategory_set', many=True, read_only=True)
    class Meta:
        model = ProductCategory
        fields = ('productcategoryid', 'name', 'subcategories')

class ProductSerializer(serializers.ModelSerializer):
    product_subcategory = serializers.SerializerMethodField()
    product_category = serializers.SerializerMethodField()
    class Meta:
        model = Product
        fields = [
            'productid', 'name', 'productnumber', 'color', 'standardcost', 
            'listprice', 'size', 'daystomanufacture', 'productline', 'style', 
            'sellstartdate', 'sellenddate', 'product_subcategory', 'product_category',
        ]
    def get_product_subcategory(self, obj):
        if obj.productsubcategoryid:
            return obj.productsubcategoryid.name
        return None
    def get_product_category(self, obj):
        if obj.productsubcategoryid and obj.productsubcategoryid.productcategoryid:
            return obj.productsubcategoryid.productcategoryid.name
        return None

class CartItemSerializer(serializers.ModelSerializer):
    productid = ProductSerializer(read_only=True)
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

# === CÁC SERIALIZER CẦN LÀM (TODO LIST) ===

# --- UC-12: Serializer cho Voucher ---
class VoucherSerializer(serializers.ModelSerializer):
    class Meta:
        model = Voucher 
        fields = '__all__' # Lấy tất cả các trường từ model Voucher
