import uuid
from django.db import models

class ProductSubcategory(models.Model):
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name

class Product(models.Model):
    # ProductID sẽ được Django tự động tạo làm khóa chính (id)
    name = models.CharField(max_length=255)
    product_number = models.CharField(max_length=25, unique=True)
    
    # Thêm trường image ở đây
    image = models.ImageField(upload_to='product_images/', null=True, blank=True)

    finished_goods_flag = models.BooleanField(default=True)
    color = models.CharField(max_length=15, blank=True, null=True)
    safety_stock_level = models.SmallIntegerField(default=0)
    reorder_point = models.SmallIntegerField(default=0)
    standard_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    list_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    size = models.CharField(max_length=50, blank=True, null=True)
    weight = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    days_to_manufacture = models.IntegerField(default=0)
    product_line = models.CharField(max_length=50, blank=True, null=True)
    product_class = models.CharField(max_length=50, blank=True, null=True)
    style = models.CharField(max_length=50, blank=True, null=True)
    product_subcategory = models.ForeignKey(
        ProductSubcategory, on_delete=models.SET_NULL, null=True, blank=True
    )
    sell_start_date = models.DateTimeField()
    sell_end_date = models.DateTimeField(null=True, blank=True)
    rowguid = models.UUIDField(unique=True, default=uuid.uuid4, editable=False)
    modified_date = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name
