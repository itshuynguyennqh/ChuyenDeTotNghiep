from rest_framework import serializers
from .models import Product, ProductSubcategory

class ProductSubcategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductSubcategory
        fields = '__all__'

class ProductSerializer(serializers.ModelSerializer):
    product_subcategory = ProductSubcategorySerializer(read_only=True)
    
    # Thêm dòng này để đảm bảo trường image trả về URL đầy đủ
    image = serializers.ImageField(use_url=True)

    class Meta:
        model = Product
        fields = '__all__'
