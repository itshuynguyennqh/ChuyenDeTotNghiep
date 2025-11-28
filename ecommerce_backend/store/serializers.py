from rest_framework import serializers
from .models import Product, ProductSubcategory, ProductCategory

# Serializer cho Subcategory
class ProductSubcategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductSubcategory
        fields = ('productsubcategoryid', 'name')

# Serializer cho Category, lồng Subcategory vào
class ProductCategorySerializer(serializers.ModelSerializer):
    # 'productsubcategory_set' là tên mặc định Django dùng cho quan hệ ngược
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
            'productid',
            'name',
            'productnumber',
            'color',
            'standardcost',
            'listprice',
            'size',
            'daystomanufacture',
            'productline',
            'style',
            'sellstartdate',
            'sellenddate',
            'product_subcategory',
            'product_category',
        ]

    def get_product_subcategory(self, obj):
        if obj.productsubcategoryid:
            return obj.productsubcategoryid.name
        return None

    def get_product_category(self, obj):
        if obj.productsubcategoryid and obj.productsubcategoryid.productcategoryid:
            return obj.productsubcategoryid.productcategoryid.name
        return None
