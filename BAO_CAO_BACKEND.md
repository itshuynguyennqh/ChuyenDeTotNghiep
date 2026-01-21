# Báo Cáo Backend - BikeGo E-commerce System

## Mục Lục

1. [Tổng Quan Backend](#tổng-quan-backend)
2. [Kiến Trúc Backend](#kiến-trúc-backend)
3. [Database Models](#database-models)
4. [API Routes Documentation](#api-routes-documentation)
5. [Authentication & Security](#authentication--security)
6. [Helper Functions & Utilities](#helper-functions--utilities)

---

## Tổng Quan Backend

### Giới Thiệu

Backend của hệ thống BikeGo E-commerce được xây dựng bằng **FastAPI** - một framework web hiện đại, nhanh chóng và dễ sử dụng cho Python. Hệ thống cung cấp RESTful API để hỗ trợ các chức năng của frontend React và quản lý dữ liệu từ SQL Server database.

### Công Nghệ Sử Dụng

- **FastAPI 0.x**: Web framework chính
- **SQLAlchemy**: ORM để tương tác với database
- **SQL Server**: Database chính (qua ODBC Driver 17)
- **PyODBC**: Driver kết nối SQL Server
- **Pydantic**: Validation và serialization
- **Python-JOSE**: JWT token handling
- **Passlib**: Password hashing (Argon2)
- **FastAPI-Mail**: Gửi email OTP
- **Uvicorn**: ASGI server

### Cấu Trúc Thư Mục

```
backend/
├── src/
│   ├── main.py                 # Entry point, khởi tạo app và super admin
│   ├── app/
│   │   ├── __init__.py         # Factory function create_app()
│   │   ├── database.py         # Database connection và session
│   │   ├── models.py           # SQLAlchemy models
│   │   ├── helper.py           # Utility functions (pagination, response wrappers)
│   │   ├── utils.py            # Helper utilities
│   │   └── routes/
│   │       ├── __init__.py    # Export routers
│   │       ├── auth/
│   │       │   ├── apis.py     # Authentication endpoints
│   │       │   └── config.py   # Auth schemas và config
│   │       ├── store/
│   │       │   ├── apis.py     # Store endpoints (products, cart, checkout)
│   │       │   └── config.py   # Store schemas
│   │       ├── users/
│   │       │   ├── apis.py     # User profile và addresses
│   │       │   └── config.py   # User schemas
│   │       ├── admin/
│   │       │   ├── apis.py     # Admin management endpoints
│   │       │   └── config.py   # Admin schemas
│   │       └── chatbot/
│   │           ├── apis.py     # Chatbot endpoints
│   │           └── config.py   # Chatbot config
├── requirements.txt            # Python dependencies
├── api_list.json              # API specification
└── README.md
```

### Môi Trường và Dependencies

**Python Version**: 3.7+

**Dependencies chính** (từ `requirements.txt`):
- `fastapi`
- `uvicorn[standard]`
- `sqlalchemy`
- `pyodbc`
- `email-validator`
- `fastapi_mail`
- `passlib[bcrypt]`
- `python-jose[cryptography]`

---

## Kiến Trúc Backend

### Cấu Trúc Ứng Dụng

Backend sử dụng kiến trúc **modular router pattern** với FastAPI:

1. **Application Factory**: `create_app()` trong `app/__init__.py` tạo FastAPI instance và đăng ký các routers
2. **Router Modules**: Mỗi module (auth, store, users, admin, chatbot) có router riêng với prefix và tags
3. **Dependency Injection**: Sử dụng FastAPI Depends để inject database session và authentication
4. **Response Models**: Sử dụng Pydantic models để validate và serialize responses

### Database Connection

Database được cấu hình trong `app/database.py`:

```python
server = 'localhost\\SQLEXPRESS'
database = 'final_project_getout'
username = 'sa1'
password = '2611'

SQLALCHEMY_DATABASE_URL = f"mssql+pyodbc:///?odbc_connect={params}"
engine = create_engine(SQLALCHEMY_DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
```

**Lưu ý**: Cần có ODBC Driver 17 for SQL Server đã được cài đặt.

### Pattern Sử Dụng

#### 1. Router Pattern
Mỗi module có router riêng:
```python
auth_router = APIRouter(tags=["Authentication"])
admin_router = APIRouter(prefix="/admin", tags=["Admin"])
store_router = APIRouter(prefix="/store", tags=["Store"])
users_router = APIRouter(prefix="/user", tags=["User"])
chatbot_router = APIRouter(prefix="/chatbot", tags=["Chatbot"])
```

#### 2. Dependency Injection
Database session được inject qua `Depends(get_db)`:
```python
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

#### 3. Response Wrappers
Sử dụng wrapper chuẩn từ `helper.py`:
- `APIResponse[T]`: Cho object đơn lẻ
- `PagedResponse[T]`: Cho danh sách có phân trang

### Authentication & Authorization Flow

1. **Login**: User gửi identifier (email/phone) và password
2. **Verification**: Backend kiểm tra trong Customer hoặc Employee table
3. **Token Generation**: Tạo JWT token với thông tin user (id, role, type)
4. **Token Storage**: Frontend lưu token trong localStorage
5. **Request Authorization**: Mỗi request gửi kèm token trong header `Authorization: Bearer <token>`
6. **Token Validation**: Backend decode và validate token để lấy user info

---

## Database Models

### Tổng Quan

Hệ thống sử dụng SQLAlchemy ORM để định nghĩa models. Tất cả models kế thừa từ `Base` (declarative_base) và được định nghĩa trong `app/models.py`.

### Customer Models

#### Customer
Bảng chính lưu thông tin khách hàng.

**Fields**:
- `CustomerID` (Integer, PK): ID khách hàng
- `FirstName`, `MiddleName`, `LastName` (String): Tên khách hàng
- `AvatarURL` (String, nullable): URL avatar
- `Status` (Integer, default=1): Trạng thái (1: Active, 0: Banned)

**Relationships**:
- `addresses`: One-to-Many với CustomerAdress
- `emails`: One-to-Many với CustomerEmailAddress
- `phones`: One-to-Many với CustomerPhone
- `passwords`: One-to-One với CustomerPassWord
- `orders`: One-to-Many với SalesOrderHeader
- `cart`: One-to-One với Cart
- `rank`: One-to-One với RankCustomer
- `voucher_usages`: One-to-Many với VoucherUsage

#### CustomerEmailAddress
Lưu email của khách hàng (hỗ trợ nhiều email).

**Fields**:
- `EmailAddressID` (Integer, PK)
- `CustomerID` (Integer, FK → Customer)
- `EmailAddress` (String)
- `ModifiedDate` (DateTime)

#### CustomerPhone
Lưu số điện thoại của khách hàng (hỗ trợ nhiều số).

**Fields**:
- `CustomerID` (Integer, PK, FK → Customer)
- `PhoneNumber` (String, PK)
- `PhoneNumberTypeID` (Integer, PK)
- `ModifiedDate` (DateTime)

#### CustomerAdress
Lưu địa chỉ của khách hàng.

**Fields**:
- `AddressID` (Integer, PK)
- `CustomerID` (Integer, FK → Customer)
- `AddressLine1` (String): Địa chỉ cụ thể
- `City` (String)
- `PostalCode` (String)
- `PhoneNumber` (String): Số điện thoại liên hệ cho địa chỉ này
- `IsDefault` (Boolean): Địa chỉ mặc định
- `ModifiedDate` (DateTime)
- `SpatialLocation` (LargeBinary, deferred): Vị trí địa lý

#### CustomerPassWord
Lưu mật khẩu đã hash của khách hàng.

**Fields**:
- `CustomerID` (Integer, PK, FK → Customer)
- `PasswordSalt` (String): Mật khẩu đã hash (dùng Argon2)
- `ModifiedDate` (DateTime)

#### RankCustomer
Hệ thống xếp hạng khách hàng (RFM analysis).

**Fields**:
- `CustomerID` (Integer, PK, FK → Customer)
- `R` (Integer): Recency score
- `F` (Numeric): Frequency score
- `M` (Numeric): Monetary score
- `Final_score` (Numeric): Tổng điểm
- `rank_cus` (String): Rank name (Diamond, Gold, Silver, etc.)
- `discount` (Numeric): Mức giảm giá theo rank

### Product Models

#### ProductCategory
Danh mục sản phẩm cấp 1.

**Fields**:
- `ProductCategoryID` (Integer, PK)
- `Name` (String)
- `ModifiedDate` (DateTime)

**Relationships**:
- `subcategories`: One-to-Many với ProductSubcategory

#### ProductSubcategory
Danh mục sản phẩm cấp 2.

**Fields**:
- `ProductSubcategoryID` (Integer, PK)
- `ProductCategoryID` (Integer, FK → ProductCategory)
- `Name` (String)
- `ModifiedDate` (DateTime)

**Relationships**:
- `category`: Many-to-One với ProductCategory
- `products`: One-to-Many với Product

#### Product
Sản phẩm chính.

**Fields**:
- `ProductID` (Integer, PK)
- `Name` (String): Tên sản phẩm
- `ProductNumber` (String): Mã sản phẩm
- `FinishedGoodsFlag` (Boolean): Sản phẩm hoàn chỉnh
- `Color`, `Size` (String): Thuộc tính
- `StandardCost` (Numeric): Giá vốn
- `ListPrice` (Numeric): Giá bán
- `Condition` (String): Tình trạng (New, Like New, etc.)
- `RentPrice` (Numeric, nullable): Giá thuê/ngày
- `IsRentable` (Boolean): Có thể thuê không
- `SecurityDeposit` (Numeric): Tiền cọc
- `RentalPeriodUnit` (String): Đơn vị thuê (day, week, month)
- `FrameMaterial`, `FrameSize`, `WheelSize`, `Suspension` (String): Thông số kỹ thuật
- `Description` (String): Mô tả
- `ProductSubcategoryID` (Integer, FK → ProductSubcategory)
- `ProductModelID` (Integer): Để tìm variants
- `ReorderPoint`, `SafetyStockLevel` (SmallInteger): Quản lý tồn kho
- `SellStartDate`, `SellEndDate` (DateTime): Thời gian bán
- `ModifiedDate` (DateTime)

**Relationships**:
- `subcategory`: Many-to-One với ProductSubcategory
- `images`: One-to-Many với ProductImage
- `reviews`: One-to-Many với ProductReview
- `inventory`: One-to-Many với ProductInventory
- `cart_items`: One-to-Many với CartItem
- `sales_order_details`: One-to-Many với SalesOrderDetail

#### ProductImage
Ảnh sản phẩm.

**Fields**:
- `ImageID` (Integer, PK)
- `ProductID` (Integer, FK → Product)
- `ImageURL` (String): URL ảnh
- `IsPrimary` (Boolean): Ảnh chính
- `Caption` (String): Chú thích
- `CreatedDate` (DateTime)

#### ProductReview
Đánh giá sản phẩm.

**Fields**:
- `ProductReviewID` (Integer, PK)
- `ProductID` (Integer, FK → Product)
- `CustomerID` (Integer, FK → Customer, nullable)
- `ReviewerName` (String): Tên người đánh giá
- `EmailAddress` (String)
- `Rating` (Integer): Điểm đánh giá (1-5)
- `Comments` (String): Nội dung đánh giá
- `ReviewImage` (String): Ảnh đính kèm
- `HelpfulCount` (Integer): Số lượt hữu ích
- `ReplyContent` (String): Phản hồi từ admin
- `ReplyDate` (DateTime): Ngày phản hồi
- `ReviewDate`, `ModifiedDate` (DateTime)

#### ProductInventory
Tồn kho sản phẩm theo location.

**Fields**:
- `ProductID` (Integer, PK, FK → Product)
- `LocationID` (SmallInteger, PK, FK → Location)
- `Shelf`, `Bin` (NCHAR): Vị trí kho
- `Quantity` (Integer): Số lượng
- `ModifiedDate` (DateTime)

#### Location
Địa điểm kho/chi nhánh.

**Fields**:
- `LocationID` (SmallInteger, PK)
- `Name` (String): Tên địa điểm
- `Availability` (Integer)
- `ModifiedDate` (DateTime)

### Order Models

#### SalesOrderHeader
Header đơn hàng bán.

**Fields**:
- `SalesOrderID` (Integer, PK)
- `CustomerID` (Integer, FK → Customer)
- `OrderDate` (DateTime): Ngày đặt hàng
- `DueDate` (DateTime): Ngày đến hạn
- `ShipDate` (DateTime, nullable): Ngày giao hàng
- `SalesOrderNumber` (String): Số đơn hàng
- `TotalDue` (Numeric): Tổng tiền
- `Freight` (Numeric): Phí vận chuyển
- `OrderStatus` (String): Trạng thái đơn hàng
- `CancellationRequestDate` (DateTime, nullable): Ngày yêu cầu hủy
- `CancellationReason` (String, nullable): Lý do hủy
- `ModifiedDate` (DateTime)

**Relationships**:
- `customer`: Many-to-One với Customer
- `details`: One-to-Many với SalesOrderDetail

#### SalesOrderDetail
Chi tiết đơn hàng bán.

**Fields**:
- `SalesOrderID` (Integer, PK, FK → SalesOrderHeader)
- `SalesOrderDetailID` (Integer, PK)
- `ProductID` (Integer, FK → Product)
- `OrderQty` (SmallInteger): Số lượng
- `UnitPrice` (Numeric): Đơn giá
- `ModifiedDate` (DateTime)

### Cart Models

#### Cart
Giỏ hàng.

**Fields**:
- `CartID` (Integer, PK)
- `CustomerID` (Integer, FK → Customer)
- `CreatedDate`, `ModifiedDate` (DateTime)
- `Status` (String): Trạng thái giỏ hàng
- `IsCheckedOut` (Boolean): Đã checkout chưa

**Relationships**:
- `customer`: Many-to-One với Customer
- `items`: One-to-Many với CartItem

#### CartItem
Item trong giỏ hàng.

**Fields**:
- `CartItemID` (Integer, PK)
- `CartID` (Integer, FK → Cart)
- `ProductID` (Integer, FK → Product)
- `Quantity` (Integer): Số lượng
- `UnitPrice` (Numeric): Đơn giá
- `Subtotal` (Numeric): Tổng tiền item
- `TransactionType` (String): 'buy' hoặc 'rent'
- `RentalDays` (Integer, nullable): Số ngày thuê (nếu là rent)
- `DateAdded`, `DateUpdated` (DateTime)

### Voucher Models

#### Voucher
Mã giảm giá.

**Fields**:
- `VoucherID` (Integer, PK)
- `Code` (String): Mã voucher (unique)
- `Name` (String): Tên voucher
- `Scope` (String): Phạm vi ('buy', 'rent', 'all')
- `DiscountPercent` (Integer): Phần trăm giảm
- `DiscountAmount` (Numeric): Số tiền giảm
- `StartDate`, `EndDate` (DateTime): Thời gian hiệu lực
- `MinOrderAmount` (Numeric): Đơn hàng tối thiểu
- `Quantity` (Integer): Số lượng phát hành
- `Status` (Boolean): Trạng thái (True: Active)
- `TargetRank` (String): Rank áp dụng (Diamond, Gold, etc.)

**Relationships**:
- `usages`: One-to-Many với VoucherUsage

#### VoucherUsage
Lịch sử sử dụng voucher.

**Fields**:
- `VoucherID` (Integer, PK, FK → Voucher)
- `CustomerID` (Integer, PK, FK → Customer)
- `OrderID` (Integer): ID đơn hàng đã dùng
- `UsedDate` (DateTime): Ngày sử dụng

### Employee Models

#### Employee
Nhân viên/quản trị viên.

**Fields**:
- `BusinessEntityID` (Integer, PK)
- `FullName` (String)
- `BirthDate` (Date)
- `GroupName` (String): Nhóm (Executive, Order Staff, Product Staff)
- `DepartmentName` (String): Phòng ban
- `StartDate`, `EndDate` (Date)
- `PasswordSalt` (String): Mật khẩu đã hash
- `PhoneNumber` (String)
- `EmailAddress` (String)

### Rental Models

#### RentalHeader
Header đơn thuê.

**Fields**:
- `RentalID` (Integer, PK)
- `CustomerID` (Integer, FK → Customer)
- `RentalDate` (DateTime): Ngày thuê
- `DueDate` (DateTime): Ngày đến hạn trả
- `ReturnDate` (DateTime, nullable): Ngày trả thực tế
- `RentalNumber` (String): Số đơn thuê
- `TotalDue` (Numeric): Tổng tiền
- `Status` (Integer): 1: Active, 2: Completed, 3: Overdue
- `ModifiedDate` (DateTime)

**Relationships**:
- `details`: One-to-Many với RentalDetail

#### RentalDetail
Chi tiết đơn thuê.

**Fields**:
- `RentalDetailID` (Integer, PK)
- `RentalID` (Integer, FK → RentalHeader)
- `ProductID` (Integer, FK → Product)
- `OrderQty` (SmallInteger): Số lượng
- `UnitPrice` (Numeric): Đơn giá/ngày
- `AssignedAssetID` (String): Mã tài sản được gán
- `ConditionDescription` (String): Mô tả tình trạng
- `EvidencePhotos` (String): Ảnh chứng cứ

#### RentalConfiguration
Cấu hình hệ thống thuê.

**Fields**:
- `ConfigID` (Integer, PK): Luôn là 1
- `MinRentalDays` (Integer): Số ngày thuê tối thiểu
- `MaxRentalDays` (Integer, nullable): Số ngày thuê tối đa
- `DefaultDepositRate` (Numeric): Tỷ lệ cọc mặc định (%)
- `OverdueFeeRate` (Numeric): Tỷ lệ phí quá hạn (%)
- `CancellationPolicy` (String): Chính sách hủy ('flexible', 'moderate', 'strict')
- `IsRentToOwnEnabled` (Boolean): Cho phép thuê để sở hữu
- `RentDeductionRate` (Numeric): Tỷ lệ khấu trừ khi thuê để sở hữu (%)
- `ModifiedDate` (DateTime)

### Other Models

#### FAQ
Câu hỏi thường gặp cho chatbot.

**Fields**:
- `FAQID` (Integer, PK)
- `Question` (String): Câu hỏi
- `Answer` (String): Câu trả lời
- `Keywords` (String): Từ khóa (lưu dạng "a,b,c")
- `IsActive` (Boolean): Trạng thái
- `ModifiedDate` (DateTime)

#### PendingRegistration
Lưu thông tin đăng ký chờ xác thực OTP.

**Fields**:
- `Id` (Integer, PK)
- `Email` (String, unique)
- `Phone` (String)
- `PasswordHash` (String)
- `FirstName`, `LastName` (String)
- `OTP` (String): Mã OTP 6 số
- `CreatedAt` (DateTime)

#### PasswordResetToken
Token reset mật khẩu.

**Fields**:
- `Id` (Integer, PK)
- `Email` (String, unique)
- `OTP` (String): Mã OTP 6 số
- `CreatedAt` (DateTime)
- `IsUsed` (Boolean): Đã sử dụng chưa

---

## API Routes Documentation

### Auth Router (`/auth`)

#### POST `/auth/login`
Đăng nhập cho cả Customer và Employee.

**Request Body**:
```json
{
  "identifier": "user@example.com",  // Email hoặc số điện thoại
  "password": "password123"
}
```

**Response** (200 OK):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "role": "customer",  // hoặc tên phòng ban của employee
  "name": "Nguyễn Văn A",
  "id": 1
}
```

**Error Responses**:
- `401`: Thông tin đăng nhập không chính xác

#### POST `/auth/register`
Đăng ký tài khoản khách hàng mới.

**Request Body**:
```json
{
  "first_name": "Nguyễn",
  "last_name": "Văn A",
  "email": "user@example.com",
  "phone": "0123456789",
  "password": "password123"
}
```

**Response** (200 OK):
```json
{
  "message": "Đăng ký thành công. Vui lòng kiểm tra email để lấy mã OTP."
}
```

**Validation**:
- Email phải đúng định dạng
- Phone phải đúng định dạng Việt Nam (regex: `(84|0[3|5|7|8|9])+([0-9]{8})\b`)
- Email không được trùng

**Error Responses**:
- `400`: Email đã được sử dụng hoặc validation failed

#### POST `/auth/verify_registration`
Xác thực OTP đăng ký.

**Request Body**:
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response** (200 OK):
```json
{
  "message": "Xác thực thành công. Tài khoản đã được tạo."
}
```

**Error Responses**:
- `400`: OTP không đúng hoặc đã hết hạn (5 phút)

#### POST `/auth/forgot_password`
Yêu cầu reset mật khẩu (gửi OTP qua email).

**Request Body**:
```json
{
  "email": "user@example.com"
}
```

**Response** (200 OK):
```json
{
  "message": "Mã OTP đã được gửi đến email của bạn."
}
```

#### POST `/auth/reset_password`
Đặt lại mật khẩu với OTP.

**Request Body**:
```json
{
  "email": "user@example.com",
  "otp": "123456",
  "new_password": "newpassword123"
}
```

**Response** (200 OK):
```json
{
  "message": "Mật khẩu đã được đặt lại thành công."
}
```

### Store Router (`/store`)

#### GET `/store/products/featured`
Lấy danh sách sản phẩm nổi bật (top 4 bán chạy nhất).

**Response** (200 OK):
```json
{
  "status": "success",
  "code": 200,
  "data": [
    {
      "product_id": 1,
      "name": "Mountain Bike Pro",
      "price": 1500.00,
      "thumbnail": "https://example.com/image.jpg",
      "average_rating": 4.5,
      "total_sold": 120
    }
  ]
}
```

#### GET `/store/products/search`
Tìm kiếm và lọc sản phẩm.

**Query Parameters**:
- `category_id` (int, optional): Lọc theo subcategory
- `condition` (string, optional): Lọc theo tình trạng
- `price_range` (string, optional): 'under 1000', '1000-2000', '2000-3000', 'above 3000'
- `size` (list[string], optional): Lọc theo size
- `color` (list[string], optional): Lọc theo màu
- `min_rating` (float, optional): Đánh giá tối thiểu (0-5)
- `search` (string, optional): Tìm kiếm theo tên
- `page` (int, default=1): Trang hiện tại
- `limit` (int, default=12): Số item mỗi trang

**Response** (200 OK):
```json
{
  "status": "success",
  "code": 200,
  "data": [...],
  "pagination": {
    "total_items": 50,
    "total_pages": 5,
    "current_page": 1,
    "limit": 12
  }
}
```

#### GET `/store/products/{product_id}/detail`
Lấy chi tiết sản phẩm.

**Response** (200 OK):
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "product_id": 1,
    "name": "Mountain Bike Pro",
    "price": 1500.00,
    "thumbnail": "https://example.com/image.jpg",
    "description": "Mô tả sản phẩm...",
    "images": [
      {
        "image_id": 1,
        "url": "https://example.com/image1.jpg",
        "is_primary": true,
        "caption": "Ảnh chính"
      }
    ],
    "variants": [
      {
        "product_id": 1,
        "color": "Red",
        "size": "M",
        "condition": "New",
        "price": 1500.00,
        "is_rentable": true,
        "rent_price": 50.00
      }
    ],
    "rental_info": {
      "is_rentable": true,
      "rent_price": 50.00,
      "rent_unit": "day",
      "security_deposit": 300.00
    },
    "specs": {
      "model": "MBP-001",
      "color": "Red",
      "frame_material": "Aluminum",
      "frame_size": "M",
      "wheel_size": "26 inch",
      "suspension": "Front Suspension"
    }
  }
}
```

#### GET `/store/products/{product_id}/reviews`
Lấy danh sách đánh giá sản phẩm (có phân trang).

**Query Parameters**:
- `page` (int, default=1)
- `limit` (int, default=10)

**Response** (200 OK):
```json
{
  "status": "success",
  "code": 200,
  "product_id": 1,
  "average_rating": 4.5,
  "data": [
    {
      "username": "Nguyễn Văn A",
      "rate": 5,
      "date": "2024-01-15T10:00:00",
      "comment": "Sản phẩm rất tốt!",
      "review_image": null,
      "is_helpful": 10
    }
  ],
  "pagination": {...}
}
```

#### GET `/store/products/{product_id}/similar`
Lấy danh sách sản phẩm tương tự.

**Response** (200 OK):
```json
{
  "status": "success",
  "code": 200,
  "data": [...]
}
```

#### GET `/store/cart`
Lấy thông tin giỏ hàng hiện tại (yêu cầu authentication).

**Response** (200 OK):
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "cart_id": 1,
    "total_items": 3,
    "total_buy_amount": 3000.00,
    "total_rent_amount": 150.00,
    "grand_total": 3150.00,
    "items": [
      {
        "cart_item_id": 1,
        "product_id": 1,
        "product_name": "Mountain Bike Pro",
        "thumbnail": "https://example.com/image.jpg",
        "transaction_type": "buy",
        "rental_days": null,
        "variant": {
          "color": "Red",
          "size": "M",
          "condition": "New"
        },
        "quantity": 1,
        "unit_price": 1500.00,
        "subtotal": 1500.00
      }
    ]
  }
}
```

#### POST `/store/cart/items`
Thêm sản phẩm vào giỏ hàng.

**Request Body**:
```json
{
  "product_id": 1,
  "quantity": 1,
  "transaction_type": "buy",  // hoặc "rent"
  "rental_days": null  // Bắt buộc nếu transaction_type = "rent"
}
```

**Response** (200 OK):
```json
{
  "status": "success",
  "code": 200,
  "message": "Đã thêm vào giỏ hàng"
}
```

#### PATCH `/store/cart/items/{cart_item_id}`
Cập nhật item trong giỏ hàng.

**Request Body**:
```json
{
  "quantity": 2,  // optional
  "rental_days": 5  // optional, chỉ cho item thuê
}
```

#### DELETE `/store/cart/items/{cart_item_id}`
Xóa item khỏi giỏ hàng.

#### GET `/store/vouchers`
Lấy danh sách voucher khả dụng.

**Response** (200 OK):
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "items": [
      {
        "voucher_id": 1,
        "code": "SUMMER2024",
        "name": "Giảm giá mùa hè",
        "scope": "all",
        "discount_type": "percentage",
        "discount_value": 10.00,
        "min_order_amount": 1000.00,
        "start_date": "2024-01-01T00:00:00",
        "end_date": "2024-12-31T23:59:59",
        "target_rank": null
      }
    ]
  }
}
```

#### POST `/store/order/checkout`
Thanh toán đơn hàng.

**Request Body**:
```json
{
  "address_id": 1,
  "payment_method": "cod",  // "cod", "banking", "momo", "vnpay"
  "voucher_code": "SUMMER2024",  // optional
  "note": "Giao hàng vào buổi sáng"  // optional
}
```

**Response** (200 OK):
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "message": "Đặt hàng thành công",
    "buy_order_id": 1,
    "buy_order_number": "ORD-2024-001",
    "rent_order_id": null,
    "rent_order_number": null,
    "total_amount": 3150.00
  }
}
```

### User Router (`/user`)

Tất cả endpoints yêu cầu authentication (Bearer token).

#### GET `/user/profile`
Lấy thông tin profile hiện tại.

**Response** (200 OK):
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "first_name": "Nguyễn",
    "last_name": "Văn A",
    "email": "user@example.com",
    "phone": "0123456789",
    "avatar_url": null
  }
}
```

#### PATCH `/user/profile`
Cập nhật thông tin profile.

**Request Body**:
```json
{
  "first_name": "Nguyễn",  // optional
  "last_name": "Văn B",  // optional
  "phone": "0987654321",  // optional
  "avatar_url": "https://example.com/avatar.jpg"  // optional
}
```

#### GET `/user/addresses`
Lấy danh sách địa chỉ.

**Response** (200 OK):
```json
{
  "status": "success",
  "code": 200,
  "data": [
    {
      "address_id": 1,
      "address_line1": "123 Đường ABC",
      "city": "Hà Nội",
      "postal_code": "100000",
      "phone_number": "0123456789",
      "is_default": true
    }
  ]
}
```

#### POST `/user/addresses`
Thêm địa chỉ mới.

**Request Body**:
```json
{
  "address_line1": "123 Đường ABC",
  "city": "Hà Nội",
  "postal_code": "100000",
  "phone_number": "0123456789",
  "is_default": false
}
```

#### PATCH `/user/addresses/{address_id}`
Cập nhật địa chỉ.

#### DELETE `/user/addresses/{address_id}`
Xóa địa chỉ.

### Admin Router (`/admin`)

Tất cả endpoints yêu cầu authentication và quyền admin/staff.

#### GET `/admin/dashboard`
Lấy thống kê tổng quan dashboard.

**Response** (200 OK):
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "summary": {
      "total_revenue": {
        "value": 1000000.00,
        "currency": "VND",
        "growth_percentage": 15.5,
        "growth_direction": "up"
      },
      "active_rental": {
        "value": 25,
        "unit": "rentals"
      },
      "total_customers": {
        "value": 500,
        "unit": "customers"
      },
      "overdue_return": {
        "value": 3,
        "has_warning": true,
        "warning_message": "Có 3 đơn thuê quá hạn"
      }
    },
    "revenue_chart": {
      "labels": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      "series": [
        {
          "name": "Sales",
          "data": [100000, 150000, 120000, ...]
        },
        {
          "name": "Rentals",
          "data": [50000, 60000, 55000, ...]
        }
      ]
    },
    "inventory_status": {
      "total_items": 1000,
      "breakdown": [
        {
          "label": "In Stock",
          "percentage": 70,
          "value": 700,
          "status": "good"
        },
        {
          "label": "Low Stock",
          "percentage": 20,
          "value": 200,
          "status": "warning"
        },
        {
          "label": "Out of Stock",
          "percentage": 10,
          "value": 100,
          "status": "critical"
        }
      ]
    }
  }
}
```

#### GET `/admin/reports`
Lấy báo cáo doanh thu theo khoảng thời gian.

**Query Parameters**:
- `start_date` (date, required): YYYY-MM-DD
- `end_date` (date, required): YYYY-MM-DD
- `page` (int, default=1): Cho top products
- `limit` (int, default=5): Số lượng top products

**Response** (200 OK):
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "revenue_report": {
      "total_revenue": 5000000.00,
      "total_orders": 200,
      "avg_daily_revenue": 166666.67
    },
    "top_selling_products": [
      {
        "rank": 1,
        "product_id": 1,
        "product_number": "MBP-001",
        "product_name": "Mountain Bike Pro",
        "category_name": "Bikes",
        "image_url": "https://example.com/image.jpg",
        "quantity_sold": 50,
        "revenue": 75000.00
      }
    ],
    "top_rented_products": [...]
  }
}
```

#### GET `/admin/products`
Lấy danh sách sản phẩm (có phân trang và filter).

**Query Parameters**:
- `page` (int, default=1)
- `limit` (int, default=20)
- `search` (string, optional): Tìm kiếm theo tên
- `category_id` (int, optional)
- `status` (string, optional): 'active', 'inactive'

**Response** (200 OK):
```json
{
  "status": "success",
  "code": 200,
  "data": [...],
  "pagination": {...}
}
```

#### POST `/admin/products`
Tạo sản phẩm mới.

**Request Body**:
```json
{
  "name": "New Product",
  "product_number": "NP-001",
  "subcategory_id": 1,
  "standard_cost": 1000.00,
  "list_price": 1500.00,
  "attributes": {
    "size": "M",
    "color": "Red",
    "frame_material": "Aluminum",
    "wheel_size": "26 inch",
    "condition": "New"
  },
  "safety_stock_level": 10,
  "reorder_point": 5,
  "stock_details": {
    "total_stock": 50,
    "maintenance_stock": 0
  },
  "rental_config": {
    "is_rentable": true,
    "security_deposit": 300.00
  },
  "rent_price": 50.00,
  "description": "Mô tả sản phẩm",
  "images": ["https://example.com/image1.jpg", "https://example.com/image2.jpg"]
}
```

#### GET `/admin/products/{product_id}`
Lấy chi tiết sản phẩm (cho admin).

#### PATCH `/admin/products/{product_id}`
Cập nhật sản phẩm.

#### DELETE `/admin/products/{product_id}`
Xóa sản phẩm.

#### GET `/admin/reviews/{product_id}`
Lấy danh sách đánh giá của sản phẩm (cho admin, có thể reply).

#### GET `/admin/promotions`
Lấy danh sách promotion/voucher.

#### POST `/admin/promotions`
Tạo promotion mới.

#### GET `/admin/promotions/{promotion_id}`
Lấy chi tiết promotion.

#### PATCH `/admin/promotions/{promotion_id}`
Cập nhật promotion.

#### DELETE `/admin/promotions/{promotion_id}`
Xóa promotion.

#### GET `/admin/categories`
Lấy danh sách categories.

#### POST `/admin/categories`
Tạo category mới.

#### PATCH `/admin/categories/{category_id}`
Cập nhật category.

#### DELETE `/admin/categories/{category_id}`
Xóa category.

#### GET `/admin/customers`
Lấy danh sách khách hàng.

#### GET `/admin/customers/{customer_id}`
Lấy chi tiết khách hàng.

#### GET `/admin/customers/{customer_id}/orders`
Lấy lịch sử đơn hàng của khách hàng.

#### PATCH `/admin/customers/{customer_id}`
Cập nhật thông tin khách hàng (ví dụ: ban/unban).

#### GET `/admin/orders`
Lấy danh sách đơn hàng (sales và rentals).

**Query Parameters**:
- `page`, `limit`
- `type` (string, optional): 'sale', 'rental'
- `status` (string, optional)
- `start_date`, `end_date` (date, optional)

#### GET `/admin/orders/{order_id}`
Lấy chi tiết đơn hàng.

#### PATCH `/admin/orders/{order_id}/status`
Cập nhật trạng thái đơn hàng.

**Request Body**:
```json
{
  "status": "confirmed",  // "pending", "confirmed", "preparing", "shipped", "completed", "cancelled"
  "note": "Ghi chú"  // optional
}
```

#### POST `/admin/orders/{order_id}/request-review`
Xử lý yêu cầu hủy đơn hàng.

**Request Body**:
```json
{
  "decision": "accept",  // hoặc "decline"
  "reason": "Lý do"  // optional
}
```

#### POST `/admin/orders/{order_id}/rental-preparation`
Chuẩn bị đơn thuê (gán asset, chụp ảnh).

**Request Body**:
```json
{
  "order_item_id": 1,
  "inventory_asset_id": "ASSET-001",
  "description": "Mô tả tình trạng",
  "evidence_photos": ["https://example.com/photo1.jpg"]
}
```

#### GET `/admin/staffs`
Lấy danh sách nhân viên.

#### POST `/admin/staffs`
Tạo nhân viên mới.

#### GET `/admin/staffs/{staff_id}`
Lấy chi tiết nhân viên.

#### PATCH `/admin/staffs/{staff_id}`
Cập nhật nhân viên.

#### DELETE `/admin/staffs/{staff_id}`
Xóa nhân viên.

#### GET `/admin/settings/rental`
Lấy cấu hình hệ thống thuê.

#### PATCH `/admin/settings/rental`
Cập nhật cấu hình hệ thống thuê.

#### GET `/admin/faqs`
Lấy danh sách FAQ.

#### POST `/admin/faqs`
Tạo FAQ mới.

#### GET `/admin/faqs/{faq_id}`
Lấy chi tiết FAQ.

#### PATCH `/admin/faqs/{faq_id}`
Cập nhật FAQ.

#### DELETE `/admin/faqs/{faq_id}`
Xóa FAQ.

### Chatbot Router (`/chatbot`)

#### POST `/chatbot/message`
Gửi tin nhắn đến chatbot.

**Request Body**:
```json
{
  "message": "Có những loại xe đạp nào?"
}
```

**Response** (200 OK):
```json
{
  "response": "Chúng tôi có các loại xe đạp: Mountain Bike, Road Bike, City Bike...",
  "type": "text"  // hoặc "sql" nếu cần query database
}
```

Chatbot sử dụng Google Gemini AI để xử lý câu hỏi và có thể query database để trả lời các câu hỏi về sản phẩm, tồn kho, giá cả, etc.

---

## Authentication & Security

### JWT Token Implementation

Hệ thống sử dụng JWT (JSON Web Token) để xác thực người dùng.

**Token Structure**:
```json
{
  "sub": "user@example.com",
  "role": "customer",  // hoặc tên phòng ban của employee
  "type": "customer",  // hoặc "employee"
  "id": 1,
  "exp": 1234567890  // Expiration time
}
```

**Token Expiration**: 30 ngày (cấu hình trong `ACCESS_TOKEN_EXPIRE_MINUTES`)

**Secret Key**: Được lưu trong environment variable `SECRET_KEY`

**Algorithm**: HS256

### Password Hashing

Hệ thống sử dụng **Argon2** (qua Passlib) để hash mật khẩu.

**Lưu ý**: Mật khẩu được hash và lưu trong field `PasswordSalt` (tên có thể gây nhầm lẫn nhưng thực tế là password hash).

### OTP Verification Flow

1. **Registration OTP**:
   - User đăng ký → Backend tạo record trong `PendingRegistration` với OTP 6 số
   - Gửi OTP qua email (FastAPI-Mail)
   - User nhập OTP → Backend verify → Tạo tài khoản Customer

2. **Password Reset OTP**:
   - User yêu cầu reset → Backend tạo record trong `PasswordResetToken` với OTP
   - Gửi OTP qua email
   - User nhập OTP và mật khẩu mới → Backend verify và update password

**OTP Expiration**: 5 phút

### Role-Based Access Control

Hệ thống có các role:

1. **Customer**: Người dùng thông thường
   - Truy cập: `/store/*`, `/user/*`
   - Không truy cập: `/admin/*`

2. **Employee**:
   - **Order Staff**: Quản lý đơn hàng
   - **Product Staff**: Quản lý sản phẩm
   - **Admin/Executive**: Full access

3. **Super Admin**: Tự động tạo khi server khởi động
   - Email: `admin`
   - Password: `admin123`

### Security Best Practices

1. **Password Requirements**: Nên enforce minimum length và complexity (hiện tại chưa có validation strict)
2. **SQL Injection Prevention**: Sử dụng SQLAlchemy ORM (parameterized queries)
3. **CORS**: Cần cấu hình CORS cho frontend domain
4. **Rate Limiting**: Nên implement rate limiting cho login/register endpoints
5. **HTTPS**: Nên sử dụng HTTPS trong production
6. **Token Refresh**: Hiện tại chưa có refresh token mechanism

---

## Helper Functions & Utilities

### APIResponse Wrapper

Wrapper chuẩn cho response đơn lẻ:

```python
class APIResponse(BaseModel, Generic[T]):
    status: str = "success"
    code: int = 200
    data: Optional[T] = None
    message: Optional[str] = None
```

**Usage**:
```python
return success_response(data=product_detail)
```

### PagedResponse Wrapper

Wrapper cho danh sách có phân trang:

```python
class PagedResponse(BaseModel, Generic[T]):
    status: str = "success"
    code: int = 200
    data: List[T]
    pagination: PaginationMeta
```

**Usage**:
```python
return paginate(query, page=1, limit=20, schema=ProductCard)
```

### Pagination Helper

Hàm `paginate()` tự động tính toán pagination metadata:

```python
def paginate(query: SQLQuery, page: int, limit: int, schema: Type[T]) -> PagedResponse[T]:
    total_items = query.count()
    total_pages = ceil(total_items / limit) if limit > 0 else 0
    items_db = query.offset((page - 1) * limit).limit(limit).all()
    data = [schema.model_validate(item) for item in items_db]
    # ... return PagedResponse
```

### Database Helpers

- `get_db()`: Dependency để inject database session
- `SessionLocal`: Session factory

### Validation Schemas

Tất cả request/response schemas được định nghĩa bằng Pydantic trong các file `config.py` của mỗi router module.

**Ví dụ** (từ `store/config.py`):
```python
class ProductCard(BaseModel):
    id: int = Field(..., alias="product_id")
    name: str
    price: Decimal
    thumbnail: str
    rating: float = Field(0.0, alias="average_rating")
    sold_count: int = Field(0, alias="total_sold")
```

---

## Kết Luận

Backend của hệ thống BikeGo E-commerce được xây dựng với FastAPI, cung cấp RESTful API đầy đủ cho các chức năng:
- Authentication & Authorization
- Product Management
- Cart & Checkout
- Order Management
- User Profile Management
- Admin Dashboard & Reports
- Chatbot Integration

Hệ thống sử dụng SQL Server làm database và SQLAlchemy ORM để tương tác với database một cách an toàn và hiệu quả.
