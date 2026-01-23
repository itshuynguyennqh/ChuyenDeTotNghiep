from sqlalchemy import (
    Column, FetchedValue, Integer, String, DateTime, Date, Boolean, 
    ForeignKey, Numeric, SmallInteger, LargeBinary, Text, NCHAR
)
from sqlalchemy.orm import relationship, deferred
from app.database import Base
from datetime import datetime

# --- KHÁCH HÀNG & THÔNG TIN LIÊN QUAN ---

class Customer(Base):
    __tablename__ = "Customer"

    CustomerID = Column(Integer, primary_key=True, index=True)
    FirstName = Column(String(50))
    MiddleName = Column(String(50))
    LastName = Column(String(50))

    AvatarURL = Column(String(500), nullable=True)
    Status = Column(Integer, default=1) # 1: Active, 0: Banned

    # Relationships
    addresses = relationship("CustomerAdress", back_populates="customer")
    emails = relationship("CustomerEmailAddress", back_populates="customer")
    phones = relationship("CustomerPhone", back_populates="customer")
    passwords = relationship("CustomerPassWord", back_populates="customer")
    orders = relationship("SalesOrderHeader", back_populates="customer")
    cart = relationship("Cart", uselist=False, back_populates="customer")
    rank = relationship("RankCustomer", uselist=False, back_populates="customer")
    voucher_usages = relationship("VoucherUsage", back_populates="customer")


class CustomerAdress(Base):
    __tablename__ = "CustomerAdress"

    AddressID = Column(Integer, primary_key=True, index=True)
    CustomerID = Column(Integer, ForeignKey("Customer.CustomerID"), nullable=False)
    AddressLine1 = Column(String(60), nullable=False)
    City = Column(String(30))
    PostalCode = Column(String(15))
    ModifiedDate = Column(DateTime, nullable=False)
    SpatialLocation = deferred(Column(LargeBinary, nullable=True)) 
    
    PhoneNumber = Column(String(20), nullable=True)
    IsDefault = Column(Boolean, default=False)

    customer = relationship("Customer", back_populates="addresses")


class CustomerEmailAddress(Base):
    __tablename__ = "CustomerEmailAddress"

    EmailAddressID = Column(Integer, primary_key=True, index=True)
    CustomerID = Column(Integer, ForeignKey("Customer.CustomerID"), nullable=False)
    EmailAddress = Column(String(50))
    ModifiedDate = Column(DateTime, nullable=False)

    customer = relationship("Customer", back_populates="emails")


class CustomerPassWord(Base):
    __tablename__ = "CustomerPassWord"

    CustomerID = Column(Integer, ForeignKey("Customer.CustomerID"), primary_key=True)
    PasswordSalt = Column(String(255), nullable=False) 
    ModifiedDate = Column(DateTime, nullable=False)

    customer = relationship("Customer", back_populates="passwords")


class CustomerPhone(Base):
    __tablename__ = "CustomerPhone"

    CustomerID = Column(Integer, ForeignKey("Customer.CustomerID"), primary_key=True)
    PhoneNumber = Column(String(25), primary_key=True)
    PhoneNumberTypeID = Column(Integer, primary_key=True)
    ModifiedDate = Column(DateTime, nullable=False)

    customer = relationship("Customer", back_populates="phones")


class RankCustomer(Base):
    __tablename__ = "RankCustomer"

    CustomerID = Column(Integer, ForeignKey("Customer.CustomerID"), primary_key=True)
    R = Column(Integer)
    F = Column(Numeric(10, 3))
    M = Column(Numeric) # Money
    Final_score = Column(Numeric(18, 4))
    rank_cus = Column(String(20))
    discount = Column(Numeric(asdecimal=False))

    customer = relationship("Customer", back_populates="rank")


# --- SẢN PHẨM & DANH MỤC ---

class ProductCategory(Base):
    __tablename__ = "ProductCategory"

    ProductCategoryID = Column(Integer, primary_key=True, index=True)
    Name = Column(String(50), nullable=False)
    ModifiedDate = Column(DateTime, nullable=False)

    subcategories = relationship("ProductSubcategory", back_populates="category")


class ProductSubcategory(Base):
    __tablename__ = "ProductSubcategory"

    ProductSubcategoryID = Column(Integer, primary_key=True, index=True)
    ProductCategoryID = Column(Integer, ForeignKey("ProductCategory.ProductCategoryID"), nullable=False)
    Name = Column(String(50), nullable=False)
    ModifiedDate = Column(DateTime, nullable=False)

    category = relationship("ProductCategory", back_populates="subcategories")
    products = relationship("Product", back_populates="subcategory")


class Product(Base):
    __tablename__ = "product"

    ProductID = Column(Integer, primary_key=True, index=True)
    Name = Column(String(50), nullable=False)
    ProductNumber = Column(String(25))
    FinishedGoodsFlag = Column(Boolean, nullable=False)
    Color = Column(String(15))
    ReorderPoint = Column(SmallInteger, nullable=False)
    SafetyStockLevel = Column(SmallInteger, nullable=False)
    StandardCost = Column(Numeric, nullable=False)
    ListPrice = Column(Numeric, nullable=False)
    Size = Column(String(5))
    DaysToManufacture = Column(Integer, nullable=False)
    ProductLine = Column(NCHAR(2))
    Class = Column(NCHAR(2))
    Style = Column(NCHAR(2))
    ProductSubcategoryID = Column(Integer, ForeignKey("ProductSubcategory.ProductSubcategoryID"), nullable=True)
    SellStartDate = Column(DateTime, nullable=False)
    SellEndDate = Column(DateTime, nullable=True)
    ModifiedDate = Column(DateTime, nullable=False)
    images = relationship("ProductImage", back_populates="product")
    Condition = Column(String(20))
    RentPrice = Column(Numeric(19,4), nullable=True)
    ProductModelID = Column(Integer, nullable=True, index=True) # Để tìm variants
    FrameMaterial = Column(String(50))
    FrameSize = Column(String(20))
    WheelSize = Column(String(20))
    Suspension = Column(String(50))
    Description = Column(String)
    IsRentable = Column(Boolean, default=False)
    SecurityDeposit = Column(Numeric(19, 4), default=0)
    RentalPeriodUnit = Column(String(20), default='day')

    subcategory = relationship("ProductSubcategory", back_populates="products")
    reviews = relationship("ProductReview", back_populates="product")
    inventory = relationship("ProductInventory", back_populates="product")
    cart_items = relationship("CartItem", back_populates="product")
    sales_order_details = relationship("SalesOrderDetail", back_populates="product")


class ProductDescription(Base):
    __tablename__ = "ProductDescription"

    ProductDescriptionID = Column(Integer, primary_key=True, index=True)
    Description = Column(String(400))
    ModifiedDate = Column(DateTime, nullable=False)


class ProductReview(Base):
    __tablename__ = "ProductReview"

    ProductReviewID = Column(Integer, primary_key=True, index=True)
    ProductID = Column(Integer, ForeignKey("product.ProductID"), nullable=False)
    ReviewerName = Column(String(50))
    ReviewDate = Column(DateTime)
    EmailAddress = Column(String(50))
    CustomerID = Column(Integer, ForeignKey("Customer.CustomerID"), nullable=True)
    ReplyContent = Column(String)
    ReplyDate = Column(DateTime, nullable=True)

    ReviewDate = Column(DateTime)
    Rating = Column(Integer)
    Comments = Column(String(3850))
    ModifiedDate = Column(DateTime, nullable=False)
    ReviewImage = Column(String(500), nullable=True)
    HelpfulCount = Column(Integer, default=0)

    product = relationship("Product", back_populates="reviews")
    customer = relationship("Customer")


    product = relationship("Product", back_populates="reviews")

class ProductImage(Base):
    __tablename__ = "ProductImage"

    ImageID = Column(Integer, primary_key=True, index=True)
    ProductID = Column(Integer, ForeignKey("product.ProductID"), nullable=False)
    ImageURL = Column(String(500), nullable=False)
    IsPrimary = Column(Boolean, default=False)
    Caption = Column(String(200))
    CreatedDate = Column(DateTime, default=datetime.utcnow)

    product = relationship("Product", back_populates="images")



class Location(Base):
    __tablename__ = "Location"

    LocationID = Column(SmallInteger, primary_key=True)
    Name = Column(String(50))
    Availability = Column(Integer)
    ModifiedDate = Column(DateTime, nullable=False)

    inventory = relationship("ProductInventory", back_populates="location")


class ProductInventory(Base):
    __tablename__ = "ProductInventory"

    ProductID = Column(Integer, ForeignKey("product.ProductID"), primary_key=True)
    LocationID = Column(SmallInteger, ForeignKey("Location.LocationID"), primary_key=True)
    Shelf = Column(NCHAR(10))
    Bin = Column(NCHAR(10))
    Quantity = Column(Integer, nullable=False)
    ModifiedDate = Column(DateTime, nullable=False)

    product = relationship("Product", back_populates="inventory")
    location = relationship("Location", back_populates="inventory")


# --- ĐƠN HÀNG & GIỎ HÀNG ---

class Cart(Base):
    __tablename__ = "Cart"

    CartID = Column(Integer, primary_key=True, index=True)
    CustomerID = Column(Integer, ForeignKey("Customer.CustomerID"), nullable=False)
    CreatedDate = Column(DateTime)
    ModifiedDate = Column(DateTime)
    Status = Column(String(20))
    IsCheckedOut = Column(Boolean, nullable=False)

    customer = relationship("Customer", back_populates="cart")
    items = relationship("CartItem", back_populates="cart")


class CartItem(Base):
    __tablename__ = "CartItem"

    CartItemID = Column(Integer, primary_key=True, index=True)
    CartID = Column(Integer, ForeignKey("Cart.CartID"), nullable=False)
    ProductID = Column(Integer, ForeignKey("product.ProductID"), nullable=False)
    
    Quantity = Column(Integer, nullable=False)
    UnitPrice = Column(Numeric(10, 2), nullable=False) 
    Subtotal = Column(Numeric(21, 2), server_default=FetchedValue())  # Computed column in database - excluded from INSERT/UPDATE
    DateAdded = Column(DateTime)
    DateUpdated = Column(DateTime)

    # --- [NEW FIELDS] ---
    TransactionType = Column(String(10), default='buy', nullable=False) # 'buy' or 'rent'
    RentalDays = Column(Integer, nullable=True) # Số ngày thuê
    # --------------------

    cart = relationship("Cart", back_populates="items")
    product = relationship("Product", back_populates="cart_items")



class SalesOrderHeader(Base):
    __tablename__ = "SalesOrderHeader"

    SalesOrderID = Column(Integer, primary_key=True, index=True)
    CustomerID = Column(Integer, ForeignKey("Customer.CustomerID"), nullable=False)
    OrderDate = Column(DateTime, nullable=False)
    DueDate = Column(DateTime, nullable=False)
    ShipDate = Column(DateTime, nullable=True)
    Freight = Column(Numeric, nullable=False)
    SalesOrderNumber = Column(String(25), nullable=False)
    TotalDue = Column(Numeric, nullable=False)
    ModifiedDate = Column(DateTime, nullable=False)
    OrderStatus = Column(String(20), nullable=False)
    CancellationRequestDate = Column(DateTime, nullable=True)
    CancellationReason = Column(String(500), nullable=True)

    customer = relationship("Customer", back_populates="orders")
    details = relationship("SalesOrderDetail", back_populates="header")


class SalesOrderDetail(Base):
    __tablename__ = "SalesOrderDetail"

    SalesOrderID = Column(Integer, ForeignKey("SalesOrderHeader.SalesOrderID"), primary_key=True)
    SalesOrderDetailID = Column(Integer, primary_key=True)
    OrderQty = Column(SmallInteger)
    ProductID = Column(Integer, ForeignKey("product.ProductID"), nullable=False)
    UnitPrice = Column(Numeric) # Money
    ModifiedDate = Column(DateTime, nullable=False)

    header = relationship("SalesOrderHeader", back_populates="details")
    product = relationship("Product", back_populates="sales_order_details")


# --- KHUYẾN MÃI & NHÂN VIÊN ---

class Voucher(Base):
    __tablename__ = "Voucher"

    VoucherID = Column(Integer, primary_key=True, index=True)
    Code = Column(String(50), nullable=False) # Unique nên được xử lý ở logic code hoặc thêm constraint unique trong DB
    Name = Column(String(100))
    Scope = Column(String(10), default="all") # Mới thêm

    DiscountPercent = Column(Integer)
    DiscountAmount = Column(Numeric(10, 2))
    StartDate = Column(DateTime, nullable=False)
    EndDate = Column(DateTime, nullable=False)
    MinOrderAmount = Column(Numeric(10, 2))
    Quantity = Column(Integer) # Tổng số lượng phát hành (Total)
    Status = Column(Boolean, default=True) # True: Đang chạy/Sẵn sàng, False: Tạm dừng (Paused)
    
    TargetRank = Column(String(50)) # Mới thêm: 'diamond', 'gold', etc.

    usages = relationship("VoucherUsage", back_populates="voucher")


class VoucherUsage(Base):
    __tablename__ = "VoucherUsage"

    VoucherID = Column(Integer, ForeignKey("Voucher.VoucherID"), primary_key=True)
    CustomerID = Column(Integer, ForeignKey("Customer.CustomerID"), primary_key=True)
    OrderID = Column(Integer)
    UsedDate = Column(DateTime)

    voucher = relationship("Voucher", back_populates="usages")
    customer = relationship("Customer", back_populates="voucher_usages")


class Employee(Base):
    __tablename__ = "employees"

    BusinessEntityID = Column(Integer, primary_key=True, autoincrement=False)
    FullName = Column(String(101), nullable=False)
    BirthDate = Column(Date, nullable=False)
    GroupName = Column(String(50), nullable=False)
    DepartmentName = Column(String(50), nullable=False)
    StartDate = Column(Date, nullable=False)
    EndDate = Column(Date)
    PasswordSalt = Column(String(255), nullable=False)
    PhoneNumber = Column(String(25), nullable=False)
    EmailAddress = Column(String(50))


class PendingRegistration(Base):
    __tablename__ = "PendingRegistration"
    
    Id = Column(Integer, primary_key=True, index=True)
    Email = Column(String(100), unique=True, index=True)
    Phone = Column(String(20))
    PasswordHash = Column(String(255))
    FirstName = Column(String(50))
    LastName = Column(String(50))
    OTP = Column(String(6), nullable=False)
    CreatedAt = Column(DateTime, default=datetime.utcnow)

class PasswordResetToken(Base):
    __tablename__ = "PasswordResetToken"

    Id = Column(Integer, primary_key=True, index=True)
    Email = Column(String(100), unique=True, index=True, nullable=False)
    OTP = Column(String(6), nullable=False)
    CreatedAt = Column(DateTime, default=datetime.utcnow)
    IsUsed = Column(Boolean, default=False, nullable=False)

class RentalHeader(Base):
    __tablename__ = "RentalHeader"

    RentalID = Column(Integer, primary_key=True, index=True)
    CustomerID = Column(Integer, ForeignKey("Customer.CustomerID"), nullable=False)
    RentalDate = Column(DateTime, nullable=False)
    DueDate = Column(DateTime, nullable=False)
    ReturnDate = Column(DateTime, nullable=True)
    RentalNumber = Column(String(25), nullable=False)
    TotalDue = Column(Numeric(19, 4), nullable=False)
    Status = Column(Integer, nullable=False) # 1: Active, 2: Completed, 3: Overdue
    ModifiedDate = Column(DateTime, nullable=False)

    details = relationship("RentalDetail", back_populates="header")

class RentalDetail(Base):
    __tablename__ = "RentalDetail"

    RentalDetailID = Column(Integer, primary_key=True, index=True)
    RentalID = Column(Integer, ForeignKey("RentalHeader.RentalID"), nullable=False)
    ProductID = Column(Integer, ForeignKey("product.ProductID"), nullable=False)
    OrderQty = Column(SmallInteger, nullable=False)
    UnitPrice = Column(Numeric(19, 4), nullable=False)
    AssignedAssetID = Column(String(50), nullable=True)       
    ConditionDescription = Column(String(500), nullable=True) 
    EvidencePhotos = Column(String, nullable=True)      

    header = relationship("RentalHeader", back_populates="details")
    product = relationship("Product")


class RentalConfiguration(Base):
    __tablename__ = "RentalConfiguration"

    ConfigID = Column(Integer, primary_key=True) # Luôn là 1
    MinRentalDays = Column(Integer, default=1)
    MaxRentalDays = Column(Integer, nullable=True)
    DefaultDepositRate = Column(Numeric(5, 2), default=80.0)
    OverdueFeeRate = Column(Numeric(5, 2), default=150.0)
    CancellationPolicy = Column(String(20), default='flexible')
    IsRentToOwnEnabled = Column(Boolean, default=True)
    RentDeductionRate = Column(Numeric(5, 2), default=100.0)
    ModifiedDate = Column(DateTime, default=datetime.now)


class FAQ(Base):
    __tablename__ = "FAQ"

    FAQID = Column(Integer, primary_key=True, index=True)
    Question = Column(String, nullable=False)
    Answer = Column(String, nullable=False)
    Keywords = Column(String, nullable=True) # Lưu chuỗi "a,b,c"
    IsActive = Column(Boolean, default=True)
    ModifiedDate = Column(DateTime, default=datetime.now)