from django.db import models


class Cart(models.Model):
    cartid = models.AutoField(db_column='CartID', primary_key=True)  # Field name made lowercase.
    customerid = models.ForeignKey('Customer', models.DO_NOTHING, db_column='CustomerID')  # Field name made lowercase.
    createddate = models.DateTimeField(db_column='CreatedDate', blank=True, null=True)  # Field name made lowercase.
    modifieddate = models.DateTimeField(db_column='ModifiedDate', blank=True, null=True)  # Field name made lowercase.
    status = models.CharField(db_column='Status', max_length=20, db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'Cart'


class CartItem(models.Model):
    cartitemid = models.AutoField(db_column='CartItemID', primary_key=True)  # Field name made lowercase.
    cartid = models.ForeignKey(Cart, models.DO_NOTHING, db_column='CartID')  # Field name made lowercase.
    productid = models.ForeignKey('Product', models.DO_NOTHING, db_column='ProductID')  # Field name made lowercase.
    quantity = models.IntegerField(db_column='Quantity')  # Field name made lowercase.
    unitprice = models.DecimalField(db_column='UnitPrice', max_digits=10, decimal_places=2)  # Field name made lowercase.
    subtotal = models.DecimalField(db_column='Subtotal', max_digits=21, decimal_places=2, blank=True, null=True)  # Field name made lowercase.
    dateadded = models.DateTimeField(db_column='DateAdded', blank=True, null=True)  # Field name made lowercase.
    dateupdated = models.DateTimeField(db_column='DateUpdated', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'CartItem'


class Customer(models.Model):
    customerid = models.IntegerField(db_column='CustomerID', primary_key=True)  # Field name made lowercase.
    firstname = models.CharField(db_column='FirstName', max_length=50, db_collation='SQL_Latin1_General_CP1_CI_AS')  # Field name made lowercase.
    middlename = models.CharField(db_column='MiddleName', max_length=50, db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)  # Field name made lowercase.
    lastname = models.CharField(db_column='LastName', max_length=50, db_collation='SQL_Latin1_General_CP1_CI_AS')  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'Customer'


class CustomerAdress(models.Model):
    customerid = models.ForeignKey(Customer, models.DO_NOTHING, db_column='CustomerID')  # Field name made lowercase.
    addressid = models.IntegerField(db_column='AddressID', primary_key=True)  # Field name made lowercase.
    addressline1 = models.CharField(db_column='AddressLine1', max_length=60, db_collation='SQL_Latin1_General_CP1_CI_AS')  # Field name made lowercase.
    city = models.CharField(db_column='City', max_length=30, db_collation='SQL_Latin1_General_CP1_CI_AS')  # Field name made lowercase.
    modifieddate = models.DateTimeField(db_column='ModifiedDate')  # Field name made lowercase.
    postalcode = models.CharField(db_column='PostalCode', max_length=15, db_collation='SQL_Latin1_General_CP1_CI_AS')  # Field name made lowercase.
    spatiallocation = models.TextField(db_column='SpatialLocation', blank=True, null=True)  # Field name made lowercase. This field type is a guess.

    class Meta:
        managed = False
        db_table = 'CustomerAdress'


class CustomerEmailAddress(models.Model):
    customerid = models.ForeignKey(Customer, models.DO_NOTHING, db_column='CustomerID')  # Field name made lowercase.
    emailaddress = models.CharField(db_column='EmailAddress', max_length=50, db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)  # Field name made lowercase.
    emailaddressid = models.IntegerField(db_column='EmailAddressID', primary_key=True)  # Field name made lowercase.
    modifieddate = models.DateTimeField(db_column='ModifiedDate')  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'CustomerEmailAddress'


class CustomerPassword(models.Model):
    customerid = models.ForeignKey(Customer, models.DO_NOTHING, db_column='CustomerID')  # Field name made lowercase.
    passwordsalt = models.CharField(db_column='PasswordSalt', primary_key=True, max_length=10, db_collation='SQL_Latin1_General_CP1_CI_AS')  # Field name made lowercase.
    modifieddate = models.DateTimeField(db_column='ModifiedDate')  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'CustomerPassWord'


class CustomerPhone(models.Model):
    pk = models.CompositePrimaryKey('customerid', 'phonenumber', 'phonenumbertypeid')
    customerid = models.ForeignKey(Customer, models.DO_NOTHING, db_column='CustomerID')  # Field name made lowercase.
    phonenumber = models.CharField(db_column='PhoneNumber', max_length=25, db_collation='SQL_Latin1_General_CP1_CI_AS')  # Field name made lowercase.
    phonenumbertypeid = models.IntegerField(db_column='PhoneNumberTypeID')  # Field name made lowercase.
    modifieddate = models.DateTimeField(db_column='ModifiedDate')  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'CustomerPhone'


class Location(models.Model):
    locationid = models.SmallAutoField(db_column='LocationID', primary_key=True)  # Field name made lowercase.
    name = models.CharField(db_column='Name', max_length=50, db_collation='SQL_Latin1_General_CP1_CI_AS')  # Field name made lowercase.
    availability = models.IntegerField(db_column='Availability', blank=True, null=True)  # Field name made lowercase.
    modifieddate = models.DateTimeField(db_column='ModifiedDate')  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'Location'


class ProductCategory(models.Model):
    productcategoryid = models.AutoField(db_column='ProductCategoryID', primary_key=True)  # Field name made lowercase.
    name = models.CharField(db_column='Name', max_length=50, db_collation='SQL_Latin1_General_CP1_CI_AS')  # Field name made lowercase.
    rowguid = models.CharField(max_length=36)
    modifieddate = models.DateTimeField(db_column='ModifiedDate')  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'ProductCategory'


class ProductCostHistory(models.Model):
    pk = models.CompositePrimaryKey('productid', 'startdate')
    productid = models.ForeignKey('Product', models.DO_NOTHING, db_column='ProductID')  # Field name made lowercase.
    startdate = models.DateTimeField(db_column='StartDate')  # Field name made lowercase.
    enddate = models.DateTimeField(db_column='EndDate', blank=True, null=True)  # Field name made lowercase.
    standardcost = models.DecimalField(db_column='StandardCost', max_digits=19, decimal_places=4)  # Field name made lowercase.
    modifieddate = models.DateTimeField(db_column='ModifiedDate')  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'ProductCostHistory'


class ProductDescription(models.Model):
    productdescriptionid = models.AutoField(db_column='ProductDescriptionID', primary_key=True)  # Field name made lowercase.
    description = models.CharField(db_column='Description', max_length=400, db_collation='SQL_Latin1_General_CP1_CI_AS')  # Field name made lowercase.
    modifieddate = models.DateTimeField(db_column='ModifiedDate')  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'ProductDescription'


class Productinventory(models.Model):
    pk = models.CompositePrimaryKey('productid', 'locationid')
    productid = models.ForeignKey('Product', models.DO_NOTHING, db_column='ProductID')  # Field name made lowercase.
    locationid = models.ForeignKey(Location, models.DO_NOTHING, db_column='LocationID')  # Field name made lowercase.
    shelf = models.CharField(db_column='Shelf', max_length=10, db_collation='SQL_Latin1_General_CP1_CI_AS')  # Field name made lowercase.
    bin = models.SmallIntegerField(db_column='Bin')  # Field name made lowercase.
    quantity = models.SmallIntegerField(db_column='Quantity')  # Field name made lowercase.
    modifieddate = models.DateTimeField(db_column='ModifiedDate')  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'ProductInventory'


class ProductReview(models.Model):
    productreviewid = models.AutoField(db_column='ProductReviewID', primary_key=True)  # Field name made lowercase.
    productid = models.ForeignKey('Product', models.DO_NOTHING, db_column='ProductID')  # Field name made lowercase.
    reviewername = models.CharField(db_column='ReviewerName', max_length=50, db_collation='SQL_Latin1_General_CP1_CI_AS')  # Field name made lowercase.
    reviewdate = models.DateTimeField(db_column='ReviewDate')  # Field name made lowercase.
    emailaddress = models.CharField(db_column='EmailAddress', max_length=50, db_collation='SQL_Latin1_General_CP1_CI_AS')  # Field name made lowercase.
    rating = models.IntegerField(db_column='Rating')  # Field name made lowercase.
    comments = models.CharField(db_column='Comments', max_length=3850, db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)  # Field name made lowercase.
    modifieddate = models.DateTimeField(db_column='ModifiedDate')  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'ProductReview'


class ProductSubcategory(models.Model):
    productsubcategoryid = models.AutoField(db_column='ProductSubcategoryID', primary_key=True)  # Field name made lowercase.
    productcategoryid = models.ForeignKey(ProductCategory, models.DO_NOTHING, db_column='ProductCategoryID')  # Field name made lowercase.
    name = models.CharField(db_column='Name', max_length=50, db_collation='SQL_Latin1_General_CP1_CI_AS')  # Field name made lowercase.
    modifieddate = models.DateTimeField(db_column='ModifiedDate')  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'ProductSubcategory'


class RankCustomer(models.Model):
    customerid = models.OneToOneField(Customer, models.DO_NOTHING, db_column='CustomerID', primary_key=True)  # Field name made lowercase.
    r = models.IntegerField(db_column='R', blank=True, null=True)  # Field name made lowercase.
    f = models.DecimalField(db_column='F', max_digits=5, decimal_places=3, blank=True, null=True)  # Field name made lowercase.
    m = models.DecimalField(db_column='M', max_digits=19, decimal_places=4, blank=True, null=True)  # Field name made lowercase.
    final_score = models.DecimalField(db_column='Final_score', max_digits=15, decimal_places=2, blank=True, null=True)  # Field name made lowercase.
    rank_cus = models.CharField(max_length=20, db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)
    discount = models.FloatField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'RankCustomer'


class SalesOrderDetail(models.Model):
    pk = models.CompositePrimaryKey('salesorderid', 'salesorderdetailid')
    salesorderid = models.ForeignKey('SalesOrderHeader', models.DO_NOTHING, db_column='SalesOrderID')  # Field name made lowercase.
    salesorderdetailid = models.IntegerField(db_column='SalesOrderDetailID')  # Field name made lowercase.
    orderqty = models.SmallIntegerField(db_column='OrderQty')  # Field name made lowercase.
    productid = models.IntegerField(db_column='ProductID')  # Field name made lowercase.
    unitprice = models.DecimalField(db_column='UnitPrice', max_digits=19, decimal_places=4)  # Field name made lowercase.
    modifieddate = models.DateTimeField(db_column='ModifiedDate')  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'SalesOrderDetail'


class SalesOrderHeader(models.Model):
    customerid = models.ForeignKey(Customer, models.DO_NOTHING, db_column='CustomerID')  # Field name made lowercase.
    salesorderid = models.IntegerField(db_column='SalesOrderID', primary_key=True)  # Field name made lowercase.
    orderdate = models.DateTimeField(db_column='OrderDate')  # Field name made lowercase.
    duedate = models.DateTimeField(db_column='DueDate')  # Field name made lowercase.
    shipdate = models.DateTimeField(db_column='ShipDate', blank=True, null=True)  # Field name made lowercase.
    freight = models.DecimalField(db_column='Freight', max_digits=19, decimal_places=4)  # Field name made lowercase.
    salesordernumber = models.CharField(db_column='SalesOrderNumber', max_length=25, db_collation='SQL_Latin1_General_CP1_CI_AS')  # Field name made lowercase.
    totaldue = models.DecimalField(db_column='TotalDue', max_digits=19, decimal_places=4)  # Field name made lowercase.
    modifieddate = models.DateTimeField(db_column='ModifiedDate')  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'SalesOrderHeader'


class Employees(models.Model):
    businessentityid = models.IntegerField(db_column='BusinessEntityID', primary_key=True)  # Field name made lowercase.
    fullname = models.CharField(db_column='FullName', max_length=101, db_collation='SQL_Latin1_General_CP1_CI_AS')  # Field name made lowercase.
    birthdate = models.DateField(db_column='BirthDate')  # Field name made lowercase.
    groupname = models.CharField(db_column='GroupName', max_length=50, db_collation='SQL_Latin1_General_CP1_CI_AS')  # Field name made lowercase.
    departmentname = models.CharField(db_column='DepartmentName', max_length=50, db_collation='SQL_Latin1_General_CP1_CI_AS')  # Field name made lowercase.
    startdate = models.DateField(db_column='StartDate')  # Field name made lowercase.
    enddate = models.DateField(db_column='EndDate', blank=True, null=True)  # Field name made lowercase.
    passwordsalt = models.CharField(db_column='PasswordSalt', max_length=10, db_collation='SQL_Latin1_General_CP1_CI_AS')  # Field name made lowercase.
    phonenumber = models.CharField(db_column='PhoneNumber', max_length=25, db_collation='SQL_Latin1_General_CP1_CI_AS')  # Field name made lowercase.
    emailaddress = models.CharField(db_column='EmailAddress', max_length=50, db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'employees'


class Product(models.Model):
    productid = models.AutoField(db_column='ProductID', primary_key=True)  # Field name made lowercase.
    name = models.CharField(db_column='Name', max_length=50, db_collation='SQL_Latin1_General_CP1_CI_AS')  # Field name made lowercase.
    productnumber = models.CharField(db_column='ProductNumber', max_length=25, db_collation='SQL_Latin1_General_CP1_CI_AS')  # Field name made lowercase.
    finishedgoodsflag = models.BooleanField(db_column='FinishedGoodsFlag')  # Field name made lowercase.
    color = models.CharField(db_column='Color', max_length=15, db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)  # Field name made lowercase.
    reorderpoint = models.SmallIntegerField(db_column='ReorderPoint')  # Field name made lowercase.
    safetystocklevel = models.SmallIntegerField(db_column='SafetyStockLevel')  # Field name made lowercase.
    standardcost = models.DecimalField(db_column='StandardCost', max_digits=19, decimal_places=4)  # Field name made lowercase.
    listprice = models.DecimalField(db_column='ListPrice', max_digits=19, decimal_places=4)  # Field name made lowercase.
    size = models.CharField(db_column='Size', max_length=5, db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)  # Field name made lowercase.
    daystomanufacture = models.IntegerField(db_column='DaysToManufacture')  # Field name made lowercase.
    productline = models.CharField(db_column='ProductLine', max_length=2, db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)  # Field name made lowercase.
    class_field = models.CharField(db_column='Class', max_length=2, db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)  # Field name made lowercase. Field renamed because it was a Python reserved word.
    style = models.CharField(db_column='Style', max_length=2, db_collation='SQL_Latin1_General_CP1_CI_AS', blank=True, null=True)  # Field name made lowercase.
    productsubcategoryid = models.ForeignKey(ProductSubcategory, models.DO_NOTHING, db_column='ProductSubcategoryID', blank=True, null=True)  # Field name made lowercase.
    sellstartdate = models.DateTimeField(db_column='SellStartDate')  # Field name made lowercase.
    sellenddate = models.DateTimeField(db_column='SellEndDate', blank=True, null=True)  # Field name made lowercase.
    rowguid = models.CharField(max_length=36)
    modifieddate = models.DateTimeField(db_column='ModifiedDate')  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'product'


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