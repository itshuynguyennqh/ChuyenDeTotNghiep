from django.contrib import admin
from .models import (
    Customer,
    ProductCategory,
    ProductSubcategory,
    Product,
    SalesOrderHeader,
    SalesOrderDetail,
    # Thêm các model khác nếu cần
    Cart,
    CartItem,
    ProductReview,
)

# Tùy chỉnh hiển thị cho model Customer
@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ('customerid', 'firstname', 'lastname')
    search_fields = ('firstname', 'lastname', 'customerid')

# Tùy chỉnh hiển thị cho model ProductCategory
@admin.register(ProductCategory)
class ProductCategoryAdmin(admin.ModelAdmin):
    list_display = ('productcategoryid', 'name')
    search_fields = ('name',)

# Tùy chỉnh hiển thị cho model ProductSubcategory
@admin.register(ProductSubcategory)
class ProductSubcategoryAdmin(admin.ModelAdmin):
    list_display = ('productsubcategoryid', 'name', 'productcategoryid')
    list_filter = ('productcategoryid',)
    search_fields = ('name',)

# Tùy chỉnh hiển thị cho model Product
@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('productid', 'name', 'productnumber', 'listprice')
    list_filter = ('productsubcategoryid',)
    search_fields = ('name', 'productnumber')
    list_per_page = 20

# Inline cho SalesOrderDetail để hiển thị chi tiết trong SalesOrderHeader
class SalesOrderDetailInline(admin.TabularInline):
    model = SalesOrderDetail
    # Không cho phép thêm dòng mới từ trang admin của Header để đảm bảo logic
    extra = 0
    # Vì có khóa phức hợp, chúng ta không thể sửa trực tiếp ở đây
    can_delete = False
    
    # Chỉ định các trường để hiển thị
    fields = ('productid', 'orderqty', 'unitprice')
    readonly_fields = ('productid', 'orderqty', 'unitprice')

# Tùy chỉnh hiển thị cho model SalesOrderHeader
@admin.register(SalesOrderHeader)
class SalesOrderHeaderAdmin(admin.ModelAdmin):
    list_display = ('salesorderid', 'salesordernumber', 'customerid', 'orderdate', 'totaldue')
    list_filter = ('orderdate',)
    search_fields = ('salesordernumber', 'customerid__firstname')
    date_hierarchy = 'orderdate'
    inlines = [SalesOrderDetailInline]

# --- KHÔNG ĐĂNG KÝ SalesOrderDetail TRỰC TIẾP ---
# Model SalesOrderDetail có khóa chính phức hợp và không thể đăng ký trực tiếp.
# Việc quản lý sẽ được thực hiện thông qua SalesOrderHeaderAdmin.

# Đăng ký các model đơn giản khác
@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ('cartid', 'customerid', 'createddate', 'status')

@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ('cartitemid', 'cartid', 'productid', 'quantity', 'unitprice')

@admin.register(ProductReview)
class ProductReviewAdmin(admin.ModelAdmin):
    list_display = ('productreviewid', 'productid', 'reviewername', 'rating', 'reviewdate')
    list_filter = ('rating', 'reviewdate')
