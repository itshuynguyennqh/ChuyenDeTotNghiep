from rest_framework import serializers
from .models import Product, ProductSubcategory

class ProductSubcategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductSubcategory
        fields = '__all__'

class ProductSerializer(serializers.ModelSerializer):
    # Sử dụng ProductSubcategorySerializer để hiển thị chi tiết của subcategory
    product_subcategory = ProductSubcategorySerializer(read_only=True)

    class Meta:
        model = Product
        fields = '__all__' # '__all__' để bao gồm tất cả các trường từ model Product
