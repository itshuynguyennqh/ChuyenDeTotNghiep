# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models


class Cart(models.Model):
    cartid = models.AutoField(db_column='CartID', primary_key=True)
    customerid = models.ForeignKey('Customer', models.DO_NOTHING, db_column='CustomerID', blank=True, null=True)
    createddate = models.DateTimeField(db_column='CreatedDate', auto_now_add=True, blank=True, null=True)
    modifieddate = models.DateTimeField(db_column='ModifiedDate', auto_now=True, blank=True, null=True)
    status = models.CharField(db_column='Status', max_length=20, blank=True, null=True)
    ischeckedout = models.BooleanField(db_column='IsCheckedOut', default=False)
    # Thêm trường session_key để định danh giỏ hàng của khách
    session_key = models.CharField(max_length=40, blank=True, null=True, unique=True)

    class Meta:
        managed = False
        db_table = 'Cart'


class CartItem(models.Model):
    cartitemid = models.AutoField(db_column='CartItemID', primary_key=True)
    cartid = models.ForeignKey(Cart, models.DO_NOTHING, db_column='CartID')
    productid = models.ForeignKey('Product', models.DO_NOTHING, db_column='ProductID')
    quantity = models.IntegerField(db_column='Quantity')
    unitprice = models.DecimalField(db_column='UnitPrice', max_digits=10, decimal_places=2)
    # subtotal = models.DecimalField(db_column='Subtotal', max_digits=21, decimal_places=2, blank=True, null=True)
    dateadded = models.DateTimeField(db_column='DateAdded', auto_now_add=True, blank=True, null=True)
    dateupdated = models.DateTimeField(db_column='DateUpdated', auto_now=True, blank=True, null=True)

    @property
    def subtotal(self):
        return self.quantity * self.unitprice

    class Meta:
        managed = False
        db_table = 'CartItem'


# ... (các model còn lại giữ nguyên) ...
class Customer(models.Model):
    customerid = models.AutoField(db_column='CustomerID', primary_key=True)
    firstname = models.CharField(db_column='FirstName', max_length=50, db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)
    middlename = models.CharField(db_column='MiddleName', max_length=50, db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)
    lastname = models.CharField(db_column='LastName', max_length=50, db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'Customer'


class CustomerAdress(models.Model):
    customerid = models.ForeignKey(Customer, models.DO_NOTHING, db_column='CustomerID')
    addressid = models.AutoField(db_column='AddressID', primary_key=True)
    addressline1 = models.CharField(db_column='AddressLine1', max_length=60, db_collation='SQL_Latin1_General_CP1_CI_AS')
    city = models.CharField(db_column='City', max_length=30, db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)
    modifieddate = models.DateTimeField(db_column='ModifiedDate')
    postalcode = models.CharField(db_column='PostalCode', max_length=15, db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)
    spatiallocation = models.TextField(db_column='SpatialLocation', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'CustomerAdress'


class CustomerEmailAddress(models.Model):
    customerid = models.ForeignKey(Customer, models.DO_NOTHING, db_column='CustomerID')
    emailaddress = models.CharField(db_column='EmailAddress', max_length=50, db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)
    emailaddressid = models.AutoField(db_column='EmailAddressID', primary_key=True)
    modifieddate = models.DateTimeField(db_column='ModifiedDate')

    class Meta:
        managed = False
        db_table = 'CustomerEmailAddress'


class CustomerPassword(models.Model):
    customerid = models.ForeignKey(Customer, models.DO_NOTHING, db_column='CustomerID')
    passwordsalt = models.CharField(db_column='PasswordSalt', primary_key=True, max_length=10, db_collation='SQL_Latin1_General_CP1_CI_AS')
    modifieddate = models.DateTimeField(db_column='ModifiedDate')

    class Meta:
        managed = False
        db_table = 'CustomerPassWord'


class CustomerPhone(models.Model):
    pk = models.CompositePrimaryKey('customerid', 'phonenumber', 'phonenumbertypeid')
    customerid = models.ForeignKey(Customer, models.DO_NOTHING, db_column='CustomerID')
    phonenumber = models.CharField(db_column='PhoneNumber', max_length=25, db_collation='SQL_Latin1_General_CP1_CI_AS')
    phonenumbertypeid = models.IntegerField(db_column='PhoneNumberTypeID')
    modifieddate = models.DateTimeField(db_column='ModifiedDate')

    class Meta:
        managed = False
        db_table = 'CustomerPhone'


class Location(models.Model):
    locationid = models.SmallAutoField(db_column='LocationID', primary_key=True)
    name = models.CharField(db_column='Name', max_length=50, db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)
    availability = models.IntegerField(db_column='Availability', blank=True, null=True)
    modifieddate = models.DateTimeField(db_column='ModifiedDate')

    class Meta:
        managed = False
        db_table = 'Location'


class ProductCategory(models.Model):
    productcategoryid = models.AutoField(db_column='ProductCategoryID', primary_key=True)
    name = models.CharField(db_column='Name', max_length=50, db_collation='SQL_Latin1_General_CP1_CI_AS')
    modifieddate = models.DateTimeField(db_column='ModifiedDate')

    class Meta:
        managed = False
        db_table = 'ProductCategory'


class ProductDescription(models.Model):
    productdescriptionid = models.AutoField(db_column='ProductDescriptionID', primary_key=True)
    description = models.CharField(db_column='Description', max_length=400, db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)
    modifieddate = models.DateTimeField(db_column='ModifiedDate')

    class Meta:
        managed = False
        db_table = 'ProductDescription'


class ProductInventory(models.Model):
    pk = models.CompositePrimaryKey('productid', 'locationid')
    productid = models.ForeignKey('Product', models.DO_NOTHING, db_column='ProductID')
    locationid = models.ForeignKey(Location, models.DO_NOTHING, db_column='LocationID')
    shelf = models.CharField(db_column='Shelf', max_length=10, db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)
    bin = models.CharField(db_column='Bin', max_length=10, db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)
    quantity = models.IntegerField(db_column='Quantity')
    modifieddate = models.DateTimeField(db_column='ModifiedDate')

    class Meta:
        managed = False
        db_table = 'ProductInventory'


class ProductReview(models.Model):
    productreviewid = models.AutoField(db_column='ProductReviewID', primary_key=True)
    productid = models.ForeignKey('Product', models.DO_NOTHING, db_column='ProductID')
    reviewername = models.CharField(db_column='ReviewerName', max_length=50, db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)
    reviewdate = models.DateTimeField(db_column='ReviewDate', blank=True, null=True)
    emailaddress = models.CharField(db_column='EmailAddress', max_length=50, db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)
    rating = models.IntegerField(db_column='Rating', blank=True, null=True)
    comments = models.CharField(db_column='Comments', max_length=3850, db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)
    modifieddate = models.DateTimeField(db_column='ModifiedDate')

    class Meta:
        managed = False
        db_table = 'ProductReview'


class ProductSubcategory(models.Model):
    productsubcategoryid = models.AutoField(db_column='ProductSubcategoryID', primary_key=True)
    productcategoryid = models.ForeignKey(ProductCategory, models.DO_NOTHING, db_column='ProductCategoryID')
    name = models.CharField(db_column='Name', max_length=50, db_collation='SQL_Latin1_General_CP1_CI_AS')
    modifieddate = models.DateTimeField(db_column='ModifiedDate')

    class Meta:
        managed = False
        db_table = 'ProductSubcategory'


class RankCustomer(models.Model):
    customerid = models.OneToOneField(Customer, models.DO_NOTHING, db_column='CustomerID', primary_key=True)
    r = models.IntegerField(db_column='R', blank=True, null=True)
    f = models.DecimalField(db_column='F', max_digits=10, decimal_places=3, blank=True, null=True)
    m = models.DecimalField(db_column='M', max_digits=19, decimal_places=4, blank=True, null=True)
    final_score = models.DecimalField(db_column='Final_score', max_digits=18, decimal_places=4, blank=True, null=True)
    rank_cus = models.CharField(max_length=20, db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)
    discount = models.FloatField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'RankCustomer'


class SalesOrderDetail(models.Model):
    salesorderid = models.ForeignKey('SalesOrderHeader', models.DO_NOTHING, db_column='SalesOrderID')
    salesorderdetailid = models.AutoField(db_column='SalesOrderDetailID', primary_key=True)
    orderqty = models.SmallIntegerField(db_column='OrderQty', blank=True, null=True)
    productid = models.IntegerField(db_column='ProductID')
    unitprice = models.DecimalField(db_column='UnitPrice', max_digits=19, decimal_places=4, blank=True, null=True)
    modifieddate = models.DateTimeField(db_column='ModifiedDate')

    class Meta:
        managed = False
        db_table = 'SalesOrderDetail'


class SalesOrderHeader(models.Model):
    customerid = models.ForeignKey(Customer, models.DO_NOTHING, db_column='CustomerID')
    salesorderid = models.AutoField(db_column='SalesOrderID', primary_key=True)
    orderdate = models.DateTimeField(db_column='OrderDate')
    duedate = models.DateTimeField(db_column='DueDate')
    shipdate = models.DateTimeField(db_column='ShipDate', blank=True, null=True)
    freight = models.DecimalField(db_column='Freight', max_digits=19, decimal_places=4)
    salesordernumber = models.CharField(db_column='SalesOrderNumber', max_length=25, db_collation='SQL_Latin1_General_CP1_CI_AS')
    totaldue = models.DecimalField(db_column='TotalDue', max_digits=19, decimal_places=4)
    modifieddate = models.DateTimeField(db_column='ModifiedDate')
    orderstatus = models.CharField(db_column='OrderStatus', max_length=25, db_collation='SQL_Latin1_General_CP1_CI_AS')

    class Meta:
        managed = False
        db_table = 'SalesOrderHeader'


class Voucher(models.Model):
    voucherid = models.AutoField(db_column='VoucherID', primary_key=True)
    code = models.CharField(db_column='Code', unique=True, max_length=50, db_collation='SQL_Latin1_General_CP1_CI_AS')
    discountpercent = models.IntegerField(db_column='DiscountPercent', blank=True, null=True)
    discountamount = models.DecimalField(db_column='DiscountAmount', max_digits=10, decimal_places=2, blank=True, null=True)
    startdate = models.DateTimeField(db_column='StartDate')
    enddate = models.DateTimeField(db_column='EndDate')
    minorderamount = models.DecimalField(db_column='MinOrderAmount', max_digits=10, decimal_places=2, blank=True, null=True)
    quantity = models.IntegerField(db_column='Quantity', blank=True, null=True)
    status = models.BooleanField(db_column='Status', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'Voucher'


class VoucherUsage(models.Model):
    pk = models.CompositePrimaryKey('voucherid', 'customerid')
    voucherid = models.ForeignKey(Voucher, models.DO_NOTHING, db_column='VoucherID')
    customerid = models.ForeignKey(Customer, models.DO_NOTHING, db_column='CustomerID')
    orderid = models.IntegerField(db_column='OrderID', blank=True, null=True)
    useddate = models.DateTimeField(db_column='UsedDate', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'VoucherUsage'


class AuthGroup(models.Model):
    name = models.CharField(unique=True, max_length=150, db_collation='SQL_Latin1_General_CP1_CI_AS')

    class Meta:
        managed = False
        db_table = 'auth_group'


class AuthGroupPermissions(models.Model):
    id = models.BigAutoField(primary_key=True)
    group = models.ForeignKey(AuthGroup, models.DO_NOTHING)
    permission = models.ForeignKey('AuthPermission', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'auth_group_permissions'
        unique_together = (('group', 'permission'),)


class AuthPermission(models.Model):
    name = models.CharField(max_length=255, db_collation='SQL_Latin1_General_CP1_CI_AS')
    content_type = models.ForeignKey('DjangoContentType', models.DO_NOTHING)
    codename = models.CharField(max_length=100, db_collation='SQL_Latin1_General_CP1_CI_AS')

    class Meta:
        managed = False
        db_table = 'auth_permission'
        unique_together = (('content_type', 'codename'),)


class AuthUser(models.Model):
    password = models.CharField(max_length=128, db_collation='SQL_Latin1_General_CP1_CI_AS')
    last_login = models.DateTimeField(blank=True, null=True)
    is_superuser = models.BooleanField()
    username = models.CharField(unique=True, max_length=150, db_collation='SQL_Latin1_General_CP1_CI_AS')
    first_name = models.CharField(max_length=150, db_collation='SQL_Latin1_General_CP1_CI_AS')
    last_name = models.CharField(max_length=150, db_collation='SQL_Latin1_General_CP1_CI_AS')
    email = models.CharField(max_length=254, db_collation='SQL_Latin1_General_CP1_CI_AS')
    is_staff = models.BooleanField()
    is_active = models.BooleanField()
    date_joined = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'auth_user'


class AuthUserGroups(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(AuthUser, models.DO_NOTHING)
    group = models.ForeignKey(AuthGroup, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'auth_user_groups'
        unique_together = (('user', 'group'),)


class AuthUserUserPermissions(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(AuthUser, models.DO_NOTHING)
    permission = models.ForeignKey(AuthPermission, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'auth_user_user_permissions'
        unique_together = (('user', 'permission'),)


class DjangoAdminLog(models.Model):
    action_time = models.DateTimeField()
    object_id = models.TextField(db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)
    object_repr = models.CharField(max_length=200, db_collation='SQL_Latin1_General_CP1_CI_AS')
    action_flag = models.SmallIntegerField()
    change_message = models.TextField(db_collation='SQL_Latin1_General_CP1_CI_AS')
    content_type = models.ForeignKey('DjangoContentType', models.DO_NOTHING, blank=True, null=True)
    user = models.ForeignKey(AuthUser, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'django_admin_log'


class DjangoContentType(models.Model):
    app_label = models.CharField(max_length=100, db_collation='SQL_Latin1_General_CP1_CI_AS')
    model = models.CharField(max_length=100, db_collation='SQL_Latin1_General_CP1_CI_AS')

    class Meta:
        managed = False
        db_table = 'django_content_type'
        unique_together = (('app_label', 'model'),)


class DjangoMigrations(models.Model):
    id = models.BigAutoField(primary_key=True)
    app = models.CharField(max_length=255, db_collation='SQL_Latin1_General_CP1_CI_AS')
    name = models.CharField(max_length=255, db_collation='SQL_Latin1_General_CP1_CI_AS')
    applied = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'django_migrations'


class DjangoSession(models.Model):
    session_key = models.CharField(primary_key=True, max_length=40, db_collation='SQL_Latin1_General_CP1_CI_AS')
    session_data = models.TextField(db_collation='SQL_Latin1_General_CP1_CI_AS')
    expire_date = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'django_session'


class Employees(models.Model):
    businessentityid = models.IntegerField(db_column='BusinessEntityID', primary_key=True)
    fullname = models.CharField(db_column='FullName', max_length=101, db_collation='SQL_Latin1_General_CP1_CI_AS')
    birthdate = models.DateField(db_column='BirthDate')
    groupname = models.CharField(db_column='GroupName', max_length=50, db_collation='SQL_Latin1_General_CP1_CI_AS')
    departmentname = models.CharField(db_column='DepartmentName', max_length=50, db_collation='SQL_Latin1_General_CP1_CI_AS')
    startdate = models.DateField(db_column='StartDate')
    enddate = models.DateField(db_column='EndDate', blank=True, null=True)
    passwordsalt = models.CharField(db_column='PasswordSalt', max_length=10, db_collation='SQL_Latin1_General_CP1_CI_AS')
    phonenumber = models.CharField(db_column='PhoneNumber', max_length=25, db_collation='SQL_Latin1_General_CP1_CI_AS')
    emailaddress = models.CharField(db_column='EmailAddress', max_length=50, db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'employees'


class Product(models.Model):
    productid = models.AutoField(db_column='ProductID', primary_key=True)
    name = models.CharField(db_column='Name', max_length=50, db_collation='SQL_Latin1_General_CP1_CI_AS')
    productnumber = models.CharField(db_column='ProductNumber', max_length=25, db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)
    finishedgoodsflag = models.BooleanField(db_column='FinishedGoodsFlag')
    color = models.CharField(db_column='Color', max_length=15, db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)
    reorderpoint = models.SmallIntegerField(db_column='ReorderPoint')
    safetystocklevel = models.SmallIntegerField(db_column='SafetyStockLevel')
    standardcost = models.DecimalField(db_column='StandardCost', max_digits=19, decimal_places=4)
    listprice = models.DecimalField(db_column='ListPrice', max_digits=19, decimal_places=4)
    size = models.CharField(db_column='Size', max_length=5, db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)
    daystomanufacture = models.IntegerField(db_column='DaysToManufacture')
    productline = models.CharField(db_column='ProductLine', max_length=2, db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)
    class_field = models.CharField(db_column='Class', max_length=2, db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)
    style = models.CharField(db_column='Style', max_length=2, db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)
    productsubcategoryid = models.ForeignKey(ProductSubcategory, models.DO_NOTHING, db_column='ProductSubcategoryID', blank=True, null=True)
    sellstartdate = models.DateTimeField(db_column='SellStartDate')
    sellenddate = models.DateTimeField(db_column='SellEndDate', blank=True, null=True)
    modifieddate = models.DateTimeField(db_column='ModifiedDate')

    class Meta:
        managed = False
        db_table = 'product'


class StoreProduct(models.Model):
    id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=255, db_collation='SQL_Latin1_General_CP1_CI_AS')
    product_number = models.CharField(unique=True, max_length=25, db_collation='SQL_Latin1_General_CP1_CI_AS')
    finished_goods_flag = models.BooleanField()
    color = models.CharField(max_length=15, db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)
    safety_stock_level = models.SmallIntegerField()
    reorder_point = models.SmallIntegerField()
    standard_cost = models.DecimalField(max_digits=10, decimal_places=2)
    list_price = models.DecimalField(max_digits=10, decimal_places=2)
    size = models.CharField(max_length=50, db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)
    weight = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    days_to_manufacture = models.IntegerField()
    product_line = models.CharField(max_length=50, db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)
    product_class = models.CharField(max_length=50, db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)
    style = models.CharField(max_length=50, db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)
    sell_start_date = models.DateTimeField()
    sell_end_date = models.DateTimeField(blank=True, null=True)
    rowguid = models.CharField(unique=True, max_length=32, db_collation='SQL_Latin1_General_CP1_CI_AS')
    modified_date = models.DateTimeField()
    product_subcategory = models.ForeignKey('StoreProductsubcategory', models.DO_NOTHING, blank=True, null=True)
    image = models.CharField(max_length=100, db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'store_product'



class StoreProductsubcategory(models.Model):
    id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=255, db_collation='SQL_Latin1_General_CP1_CI_AS')

    class Meta:
        managed = False
        db_table = 'store_productsubcategory'


class SysDiagrams(models.Model):
    name = models.CharField(max_length=128, db_collation='SQL_Latin1_General_CP1_CI_AS')
    principal_id = models.IntegerField()
    diagram_id = models.AutoField(primary_key=True)
    version = models.IntegerField(blank=True, null=True)
    definition = models.BinaryField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'sysdiagrams'
        unique_together = (('principal_id', 'name'),)
