from django.contrib import admin
from .models import Product, ProductSubcategory

# Đăng ký các model để chúng xuất hiện trên trang admin
admin.site.register(Product)
admin.site.register(ProductSubcategory)
