# Báo Cáo Database - BikeGo E-commerce System

## Mục Lục

1. [Database Overview](#database-overview)
2. [Entity Relationship Diagram](#entity-relationship-diagram)
3. [Tables Documentation](#tables-documentation)
4. [Relationships](#relationships)
5. [Indexes và Constraints](#indexes-và-constraints)

---

## Database Overview

### Thông Tin Database

- **Database Engine**: Microsoft SQL Server
- **Database Name**: `final_project_getout`
- **Server**: `localhost\SQLEXPRESS` (development)
- **Connection**: ODBC Driver 17 for SQL Server
- **ORM**: SQLAlchemy (Python)

### Cấu Hình Kết Nối

```python
server = 'localhost\\SQLEXPRESS'
database = 'final_project_getout'
username = 'sa1'
password = '2611'

SQLALCHEMY_DATABASE_URL = f"mssql+pyodbc:///?odbc_connect={params}"
```

---

## Entity Relationship Diagram

### ERD Overview

```mermaid
erDiagram
    Customer ||--o{ CustomerEmailAddress : has
    Customer ||--o{ CustomerPhone : has
    Customer ||--o{ CustomerAdress : has
    Customer ||--|| CustomerPassWord : has
    Customer ||--o| Cart : has
    Customer ||--o{ SalesOrderHeader : places
    Customer ||--o| RankCustomer : has
    Customer ||--o{ VoucherUsage : uses
    
    ProductCategory ||--o{ ProductSubcategory : contains
    ProductSubcategory ||--o{ Product : contains
    Product ||--o{ ProductImage : has
    Product ||--o{ ProductReview : receives
    Product ||--o{ ProductInventory : stored_in
    Product ||--o{ CartItem : added_to
    Product ||--o{ SalesOrderDetail : ordered_in
    Product ||--o{ RentalDetail : rented_in
    
    Cart ||--o{ CartItem : contains
    
    SalesOrderHeader ||--o{ SalesOrderDetail : contains
    
    RentalHeader ||--o{ RentalDetail : contains
    
    Voucher ||--o{ VoucherUsage : used_in
    
    Location ||--o{ ProductInventory : stores
    
    Employee }o--|| : manages
```

---

## Tables Documentation

### Customer Tables

#### Customer
Bảng chính lưu thông tin khách hàng.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| CustomerID | Integer | NO | Primary Key, Auto Increment |
| FirstName | String(50) | YES | Tên |
| MiddleName | String(50) | YES | Tên đệm |
| LastName | String(50) | YES | Họ |
| AvatarURL | String(500) | YES | URL avatar |
| Status | Integer | NO | Trạng thái (1: Active, 0: Banned), Default: 1 |

**Primary Key**: `CustomerID`

**Indexes**:
- `CustomerID` (Primary Key Index)

**Business Rules**:
- Status = 1: Tài khoản hoạt động bình thường
- Status = 0: Tài khoản bị khóa (banned)

#### CustomerEmailAddress
Lưu email của khách hàng (hỗ trợ nhiều email).

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| EmailAddressID | Integer | NO | Primary Key, Auto Increment |
| CustomerID | Integer | NO | Foreign Key → Customer.CustomerID |
| EmailAddress | String(50) | YES | Địa chỉ email |
| ModifiedDate | DateTime | NO | Ngày cập nhật |

**Primary Key**: `EmailAddressID`

**Foreign Keys**:
- `CustomerID` → `Customer.CustomerID`

**Business Rules**:
- Một khách hàng có thể có nhiều email
- Email có thể được dùng để đăng nhập

#### CustomerPhone
Lưu số điện thoại của khách hàng (hỗ trợ nhiều số).

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| CustomerID | Integer | NO | Primary Key, Foreign Key → Customer.CustomerID |
| PhoneNumber | String(25) | NO | Primary Key |
| PhoneNumberTypeID | Integer | NO | Primary Key |
| ModifiedDate | DateTime | NO | Ngày cập nhật |

**Primary Key**: `(CustomerID, PhoneNumber, PhoneNumberTypeID)` (Composite Key)

**Foreign Keys**:
- `CustomerID` → `Customer.CustomerID`

**Business Rules**:
- Một khách hàng có thể có nhiều số điện thoại
- PhoneNumberTypeID phân biệt loại số (ví dụ: 1: Mobile, 2: Home, 3: Work)
- Số điện thoại có thể được dùng để đăng nhập

#### CustomerAdress
Lưu địa chỉ của khách hàng.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| AddressID | Integer | NO | Primary Key, Auto Increment |
| CustomerID | Integer | NO | Foreign Key → Customer.CustomerID |
| AddressLine1 | String(60) | NO | Địa chỉ cụ thể |
| City | String(30) | YES | Thành phố |
| PostalCode | String(15) | YES | Mã bưu điện |
| PhoneNumber | String(20) | YES | Số điện thoại liên hệ cho địa chỉ này |
| IsDefault | Boolean | NO | Địa chỉ mặc định, Default: False |
| SpatialLocation | LargeBinary | YES | Vị trí địa lý (deferred loading) |
| ModifiedDate | DateTime | NO | Ngày cập nhật |

**Primary Key**: `AddressID`

**Foreign Keys**:
- `CustomerID` → `Customer.CustomerID`

**Indexes**:
- `AddressID` (Primary Key Index)

**Business Rules**:
- Một khách hàng có thể có nhiều địa chỉ
- Chỉ một địa chỉ có thể là default (IsDefault = True)
- AddressLine1 là bắt buộc

#### CustomerPassWord
Lưu mật khẩu đã hash của khách hàng.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| CustomerID | Integer | NO | Primary Key, Foreign Key → Customer.CustomerID |
| PasswordSalt | String(255) | NO | Mật khẩu đã hash (Argon2) |
| ModifiedDate | DateTime | NO | Ngày cập nhật |

**Primary Key**: `CustomerID`

**Foreign Keys**:
- `CustomerID` → `Customer.CustomerID`

**Business Rules**:
- Mỗi khách hàng chỉ có một password record
- Password được hash bằng Argon2 algorithm
- Field name là `PasswordSalt` nhưng thực tế lưu password hash

#### RankCustomer
Hệ thống xếp hạng khách hàng (RFM analysis).

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| CustomerID | Integer | NO | Primary Key, Foreign Key → Customer.CustomerID |
| R | Integer | YES | Recency score (số ngày từ lần mua cuối) |
| F | Numeric(10,3) | YES | Frequency score (tần suất mua) |
| M | Numeric | YES | Monetary score (tổng tiền đã chi) |
| Final_score | Numeric(18,4) | YES | Tổng điểm RFM |
| rank_cus | String(20) | YES | Tên rank (Diamond, Gold, Silver, Bronze, etc.) |
| discount | Numeric | YES | Mức giảm giá theo rank (%) |

**Primary Key**: `CustomerID`

**Foreign Keys**:
- `CustomerID` → `Customer.CustomerID`

**Business Rules**:
- Rank được tính dựa trên RFM analysis
- Rank names: Diamond, Gold, Silver, Bronze, etc.
- Discount được áp dụng tự động dựa trên rank
- Rank được cập nhật khi hoàn thành đơn hàng

### Product Tables

#### ProductCategory
Danh mục sản phẩm cấp 1.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| ProductCategoryID | Integer | NO | Primary Key, Auto Increment |
| Name | String(50) | NO | Tên danh mục |
| ModifiedDate | DateTime | NO | Ngày cập nhật |

**Primary Key**: `ProductCategoryID`

**Indexes**:
- `ProductCategoryID` (Primary Key Index)

**Business Rules**:
- Name là bắt buộc và unique

#### ProductSubcategory
Danh mục sản phẩm cấp 2.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| ProductSubcategoryID | Integer | NO | Primary Key, Auto Increment |
| ProductCategoryID | Integer | NO | Foreign Key → ProductCategory.ProductCategoryID |
| Name | String(50) | NO | Tên danh mục con |
| ModifiedDate | DateTime | NO | Ngày cập nhật |

**Primary Key**: `ProductSubcategoryID`

**Foreign Keys**:
- `ProductCategoryID` → `ProductCategory.ProductCategoryID`

**Business Rules**:
- Một category có nhiều subcategories
- Name là bắt buộc

#### Product
Sản phẩm chính.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| ProductID | Integer | NO | Primary Key, Auto Increment |
| Name | String(50) | NO | Tên sản phẩm |
| ProductNumber | String(25) | YES | Mã sản phẩm |
| FinishedGoodsFlag | Boolean | NO | Sản phẩm hoàn chỉnh |
| Color | String(15) | YES | Màu sắc |
| Size | String(5) | YES | Kích thước |
| StandardCost | Numeric | NO | Giá vốn |
| ListPrice | Numeric | NO | Giá bán |
| Condition | String(20) | YES | Tình trạng (New, Like New, Good, etc.) |
| RentPrice | Numeric(19,4) | YES | Giá thuê/ngày |
| IsRentable | Boolean | NO | Có thể thuê không, Default: False |
| SecurityDeposit | Numeric(19,4) | YES | Tiền cọc, Default: 0 |
| RentalPeriodUnit | String(20) | YES | Đơn vị thuê (day, week, month), Default: 'day' |
| FrameMaterial | String(50) | YES | Chất liệu khung |
| FrameSize | String(20) | YES | Kích thước khung |
| WheelSize | String(20) | YES | Kích thước bánh xe |
| Suspension | String(50) | YES | Hệ thống treo |
| Description | String | YES | Mô tả sản phẩm |
| ProductSubcategoryID | Integer | YES | Foreign Key → ProductSubcategory.ProductSubcategoryID |
| ProductModelID | Integer | YES | Để tìm variants (sản phẩm cùng model) |
| ReorderPoint | SmallInteger | NO | Điểm đặt hàng lại |
| SafetyStockLevel | SmallInteger | NO | Mức tồn kho an toàn |
| SellStartDate | DateTime | NO | Ngày bắt đầu bán |
| SellEndDate | DateTime | YES | Ngày kết thúc bán (NULL = đang bán) |
| DaysToManufacture | Integer | NO | Số ngày sản xuất |
| ProductLine | NCHAR(2) | YES | Dòng sản phẩm |
| Class | NCHAR(2) | YES | Phân loại |
| Style | NCHAR(2) | YES | Kiểu dáng |
| ModifiedDate | DateTime | NO | Ngày cập nhật |

**Primary Key**: `ProductID`

**Foreign Keys**:
- `ProductSubcategoryID` → `ProductSubcategory.ProductSubcategoryID`

**Indexes**:
- `ProductID` (Primary Key Index)
- `ProductModelID` (Index để tìm variants)

**Business Rules**:
- Name và ListPrice là bắt buộc
- Nếu SellEndDate = NULL, sản phẩm đang được bán
- Nếu SellEndDate != NULL, sản phẩm đã ngừng bán
- ProductModelID dùng để nhóm các variants (cùng model, khác màu/size)

#### ProductImage
Ảnh sản phẩm.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| ImageID | Integer | NO | Primary Key, Auto Increment |
| ProductID | Integer | NO | Foreign Key → Product.ProductID |
| ImageURL | String(500) | NO | URL ảnh |
| IsPrimary | Boolean | NO | Ảnh chính, Default: False |
| Caption | String(200) | YES | Chú thích |
| CreatedDate | DateTime | YES | Ngày tạo, Default: UTC now |

**Primary Key**: `ImageID`

**Foreign Keys**:
- `ProductID` → `Product.ProductID`

**Indexes**:
- `ImageID` (Primary Key Index)

**Business Rules**:
- Một sản phẩm có thể có nhiều ảnh
- Chỉ một ảnh có thể là primary (IsPrimary = True)
- ImageURL là bắt buộc

#### ProductReview
Đánh giá sản phẩm.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| ProductReviewID | Integer | NO | Primary Key, Auto Increment |
| ProductID | Integer | NO | Foreign Key → Product.ProductID |
| CustomerID | Integer | YES | Foreign Key → Customer.CustomerID |
| ReviewerName | String(50) | YES | Tên người đánh giá |
| EmailAddress | String(50) | YES | Email người đánh giá |
| Rating | Integer | YES | Điểm đánh giá (1-5) |
| Comments | String(3850) | YES | Nội dung đánh giá |
| ReviewImage | String(500) | YES | Ảnh đính kèm |
| HelpfulCount | Integer | NO | Số lượt hữu ích, Default: 0 |
| ReplyContent | String | YES | Phản hồi từ admin |
| ReplyDate | DateTime | YES | Ngày phản hồi |
| ReviewDate | DateTime | YES | Ngày đánh giá |
| ModifiedDate | DateTime | NO | Ngày cập nhật |

**Primary Key**: `ProductReviewID`

**Foreign Keys**:
- `ProductID` → `Product.ProductID`
- `CustomerID` → `Customer.CustomerID`

**Business Rules**:
- Rating từ 1 đến 5 sao
- CustomerID có thể NULL (guest review)
- Admin có thể reply bằng ReplyContent

#### ProductInventory
Tồn kho sản phẩm theo location.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| ProductID | Integer | NO | Primary Key, Foreign Key → Product.ProductID |
| LocationID | SmallInteger | NO | Primary Key, Foreign Key → Location.LocationID |
| Shelf | NCHAR(10) | YES | Kệ |
| Bin | NCHAR(10) | YES | Ngăn |
| Quantity | Integer | NO | Số lượng |
| ModifiedDate | DateTime | NO | Ngày cập nhật |

**Primary Key**: `(ProductID, LocationID)` (Composite Key)

**Foreign Keys**:
- `ProductID` → `Product.ProductID`
- `LocationID` → `Location.LocationID`

**Business Rules**:
- Một sản phẩm có thể ở nhiều locations
- Quantity là số lượng tồn kho tại location đó
- LocationID = 60 là Maintenance (không tính vào available stock)

#### Location
Địa điểm kho/chi nhánh.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| LocationID | SmallInteger | NO | Primary Key |
| Name | String(50) | YES | Tên địa điểm |
| Availability | Integer | YES | Khả dụng |
| ModifiedDate | DateTime | NO | Ngày cập nhật |

**Primary Key**: `LocationID`

**Business Rules**:
- LocationID = 1: General Warehouse
- LocationID = 60: Maintenance

### Order Tables

#### SalesOrderHeader
Header đơn hàng bán.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| SalesOrderID | Integer | NO | Primary Key, Auto Increment |
| CustomerID | Integer | NO | Foreign Key → Customer.CustomerID |
| OrderDate | DateTime | NO | Ngày đặt hàng |
| DueDate | DateTime | NO | Ngày đến hạn |
| ShipDate | DateTime | YES | Ngày giao hàng |
| SalesOrderNumber | String(25) | NO | Số đơn hàng (format: ORD-YYYY-XXX) |
| TotalDue | Numeric | NO | Tổng tiền |
| Freight | Numeric | NO | Phí vận chuyển |
| OrderStatus | String(20) | NO | Trạng thái (pending, confirmed, preparing, shipped, completed, cancelled) |
| CancellationRequestDate | DateTime | YES | Ngày yêu cầu hủy |
| CancellationReason | String(500) | YES | Lý do hủy |
| ModifiedDate | DateTime | NO | Ngày cập nhật |

**Primary Key**: `SalesOrderID`

**Foreign Keys**:
- `CustomerID` → `Customer.CustomerID`

**Indexes**:
- `SalesOrderID` (Primary Key Index)

**Business Rules**:
- OrderStatus workflow: pending → confirmed → preparing → shipped → completed
- Có thể cancel ở bất kỳ trạng thái nào (trước khi shipped)
- TotalDue = Sum(SalesOrderDetail.UnitPrice * OrderQty) + Freight

#### SalesOrderDetail
Chi tiết đơn hàng bán.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| SalesOrderID | Integer | NO | Primary Key, Foreign Key → SalesOrderHeader.SalesOrderID |
| SalesOrderDetailID | Integer | NO | Primary Key |
| ProductID | Integer | NO | Foreign Key → Product.ProductID |
| OrderQty | SmallInteger | YES | Số lượng |
| UnitPrice | Numeric | YES | Đơn giá |
| ModifiedDate | DateTime | NO | Ngày cập nhật |

**Primary Key**: `(SalesOrderID, SalesOrderDetailID)` (Composite Key)

**Foreign Keys**:
- `SalesOrderID` → `SalesOrderHeader.SalesOrderID`
- `ProductID` → `Product.ProductID`

**Business Rules**:
- Một đơn hàng có nhiều items
- UnitPrice là giá tại thời điểm đặt hàng

### Cart Tables

#### Cart
Giỏ hàng.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| CartID | Integer | NO | Primary Key, Auto Increment |
| CustomerID | Integer | NO | Foreign Key → Customer.CustomerID |
| CreatedDate | DateTime | YES | Ngày tạo |
| ModifiedDate | DateTime | YES | Ngày cập nhật |
| Status | String(20) | YES | Trạng thái giỏ hàng |
| IsCheckedOut | Boolean | NO | Đã checkout chưa, Default: False |

**Primary Key**: `CartID`

**Foreign Keys**:
- `CustomerID` → `Customer.CustomerID`

**Indexes**:
- `CartID` (Primary Key Index)

**Business Rules**:
- Mỗi khách hàng có một giỏ hàng active
- IsCheckedOut = True sau khi checkout thành công

#### CartItem
Item trong giỏ hàng.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| CartItemID | Integer | NO | Primary Key, Auto Increment |
| CartID | Integer | NO | Foreign Key → Cart.CartID |
| ProductID | Integer | NO | Foreign Key → Product.ProductID |
| Quantity | Integer | NO | Số lượng |
| UnitPrice | Numeric(10,2) | NO | Đơn giá |
| Subtotal | Numeric(21,2) | YES | Tổng tiền item (Quantity * UnitPrice) |
| TransactionType | String(10) | NO | Loại giao dịch ('buy' hoặc 'rent'), Default: 'buy' |
| RentalDays | Integer | YES | Số ngày thuê (bắt buộc nếu TransactionType = 'rent') |
| DateAdded | DateTime | YES | Ngày thêm vào giỏ |
| DateUpdated | DateTime | YES | Ngày cập nhật |

**Primary Key**: `CartItemID`

**Foreign Keys**:
- `CartID` → `Cart.CartID`
- `ProductID` → `Product.ProductID`

**Indexes**:
- `CartItemID` (Primary Key Index)

**Business Rules**:
- TransactionType = 'buy': Mua sản phẩm
- TransactionType = 'rent': Thuê sản phẩm (cần RentalDays)
- Subtotal = Quantity * UnitPrice (cho buy) hoặc Quantity * UnitPrice * RentalDays (cho rent)

### Voucher Tables

#### Voucher
Mã giảm giá.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| VoucherID | Integer | NO | Primary Key, Auto Increment |
| Code | String(50) | NO | Mã voucher (unique) |
| Name | String(100) | YES | Tên voucher |
| Scope | String(10) | YES | Phạm vi ('buy', 'rent', 'all'), Default: 'all' |
| DiscountPercent | Integer | YES | Phần trăm giảm |
| DiscountAmount | Numeric(10,2) | YES | Số tiền giảm |
| StartDate | DateTime | NO | Ngày bắt đầu hiệu lực |
| EndDate | DateTime | NO | Ngày kết thúc hiệu lực |
| MinOrderAmount | Numeric(10,2) | YES | Đơn hàng tối thiểu |
| Quantity | Integer | YES | Số lượng phát hành |
| Status | Boolean | NO | Trạng thái (True: Active), Default: True |
| TargetRank | String(50) | YES | Rank áp dụng (Diamond, Gold, etc.) |

**Primary Key**: `VoucherID`

**Indexes**:
- `VoucherID` (Primary Key Index)
- `Code` (Unique Index - nên có)

**Business Rules**:
- Code phải unique
- Chỉ một trong hai: DiscountPercent hoặc DiscountAmount được dùng
- Scope xác định áp dụng cho buy, rent, hay cả hai
- TargetRank: NULL = áp dụng cho tất cả ranks

#### VoucherUsage
Lịch sử sử dụng voucher.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| VoucherID | Integer | NO | Primary Key, Foreign Key → Voucher.VoucherID |
| CustomerID | Integer | NO | Primary Key, Foreign Key → Customer.CustomerID |
| OrderID | Integer | YES | ID đơn hàng đã dùng |
| UsedDate | DateTime | YES | Ngày sử dụng |

**Primary Key**: `(VoucherID, CustomerID)` (Composite Key)

**Foreign Keys**:
- `VoucherID` → `Voucher.VoucherID`
- `CustomerID` → `Customer.CustomerID`

**Business Rules**:
- Một khách hàng chỉ có thể dùng một voucher một lần (trừ khi voucher cho phép nhiều lần)
- OrderID lưu ID đơn hàng đã áp dụng voucher

### Employee Tables

#### Employee
Nhân viên/quản trị viên.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| BusinessEntityID | Integer | NO | Primary Key |
| FullName | String(101) | NO | Tên đầy đủ |
| BirthDate | Date | NO | Ngày sinh |
| GroupName | String(50) | NO | Nhóm (Executive, Order Staff, Product Staff) |
| DepartmentName | String(50) | NO | Phòng ban |
| StartDate | Date | NO | Ngày bắt đầu làm việc |
| EndDate | Date | YES | Ngày kết thúc làm việc (NULL = đang làm) |
| PasswordSalt | String(255) | NO | Mật khẩu đã hash |
| PhoneNumber | String(25) | NO | Số điện thoại |
| EmailAddress | String(50) | YES | Email |

**Primary Key**: `BusinessEntityID`

**Business Rules**:
- GroupName xác định quyền truy cập:
  - Executive: Full admin access
  - Order Staff: Quản lý đơn hàng
  - Product Staff: Quản lý sản phẩm
- EndDate = NULL: Nhân viên đang làm việc
- Password được hash bằng Argon2

### Rental Tables

#### RentalHeader
Header đơn thuê.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| RentalID | Integer | NO | Primary Key, Auto Increment |
| CustomerID | Integer | NO | Foreign Key → Customer.CustomerID |
| RentalDate | DateTime | NO | Ngày thuê |
| DueDate | DateTime | NO | Ngày đến hạn trả |
| ReturnDate | DateTime | YES | Ngày trả thực tế |
| RentalNumber | String(25) | NO | Số đơn thuê (format: RNT-YYYY-XXX) |
| TotalDue | Numeric(19,4) | NO | Tổng tiền |
| Status | Integer | NO | Trạng thái (1: Active, 2: Completed, 3: Overdue) |
| ModifiedDate | DateTime | NO | Ngày cập nhật |

**Primary Key**: `RentalID`

**Foreign Keys**:
- `CustomerID` → `Customer.CustomerID`

**Indexes**:
- `RentalID` (Primary Key Index)

**Business Rules**:
- Status = 1: Đang thuê
- Status = 2: Đã trả
- Status = 3: Quá hạn (DueDate < Today và ReturnDate = NULL)

#### RentalDetail
Chi tiết đơn thuê.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| RentalDetailID | Integer | NO | Primary Key, Auto Increment |
| RentalID | Integer | NO | Foreign Key → RentalHeader.RentalID |
| ProductID | Integer | NO | Foreign Key → Product.ProductID |
| OrderQty | SmallInteger | NO | Số lượng |
| UnitPrice | Numeric(19,4) | NO | Đơn giá/ngày |
| AssignedAssetID | String(50) | YES | Mã tài sản được gán |
| ConditionDescription | String(500) | YES | Mô tả tình trạng |
| EvidencePhotos | String | YES | Ảnh chứng cứ (JSON array URLs) |

**Primary Key**: `RentalDetailID`

**Foreign Keys**:
- `RentalID` → `RentalHeader.RentalID`
- `ProductID` → `Product.ProductID`

**Business Rules**:
- AssignedAssetID: Mã định danh tài sản cụ thể được gán cho khách hàng
- EvidencePhotos: Lưu URLs của ảnh chụp tình trạng xe khi thuê

#### RentalConfiguration
Cấu hình hệ thống thuê.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| ConfigID | Integer | NO | Primary Key (Luôn là 1) |
| MinRentalDays | Integer | NO | Số ngày thuê tối thiểu, Default: 1 |
| MaxRentalDays | Integer | YES | Số ngày thuê tối đa |
| DefaultDepositRate | Numeric(5,2) | NO | Tỷ lệ cọc mặc định (%), Default: 80.0 |
| OverdueFeeRate | Numeric(5,2) | NO | Tỷ lệ phí quá hạn (%), Default: 150.0 |
| CancellationPolicy | String(20) | NO | Chính sách hủy ('flexible', 'moderate', 'strict'), Default: 'flexible' |
| IsRentToOwnEnabled | Boolean | NO | Cho phép thuê để sở hữu, Default: True |
| RentDeductionRate | Numeric(5,2) | NO | Tỷ lệ khấu trừ khi thuê để sở hữu (%), Default: 100.0 |
| ModifiedDate | DateTime | YES | Ngày cập nhật, Default: Now |

**Primary Key**: `ConfigID`

**Business Rules**:
- Chỉ có một record với ConfigID = 1
- Các cấu hình này áp dụng cho toàn bộ hệ thống thuê

### Other Tables

#### FAQ
Câu hỏi thường gặp cho chatbot.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| FAQID | Integer | NO | Primary Key, Auto Increment |
| Question | String | NO | Câu hỏi |
| Answer | String | NO | Câu trả lời |
| Keywords | String | YES | Từ khóa (lưu dạng "a,b,c") |
| IsActive | Boolean | NO | Trạng thái, Default: True |
| ModifiedDate | DateTime | YES | Ngày cập nhật, Default: Now |

**Primary Key**: `FAQID`

**Business Rules**:
- Keywords dùng để match với câu hỏi của user
- IsActive = False: FAQ không được hiển thị

#### PendingRegistration
Lưu thông tin đăng ký chờ xác thực OTP.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| Id | Integer | NO | Primary Key, Auto Increment |
| Email | String(100) | NO | Email (unique) |
| Phone | String(20) | YES | Số điện thoại |
| PasswordHash | String(255) | YES | Mật khẩu đã hash |
| FirstName | String(50) | YES | Tên |
| LastName | String(50) | YES | Họ |
| OTP | String(6) | NO | Mã OTP 6 số |
| CreatedAt | DateTime | YES | Ngày tạo, Default: UTC now |

**Primary Key**: `Id`

**Indexes**:
- `Email` (Unique Index)

**Business Rules**:
- Record được tạo khi user đăng ký
- OTP hết hạn sau 5 phút
- Record được xóa sau khi verify thành công

#### PasswordResetToken
Token reset mật khẩu.

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| Id | Integer | NO | Primary Key, Auto Increment |
| Email | String(100) | NO | Email (unique) |
| OTP | String(6) | NO | Mã OTP 6 số |
| CreatedAt | DateTime | YES | Ngày tạo, Default: UTC now |
| IsUsed | Boolean | NO | Đã sử dụng chưa, Default: False |

**Primary Key**: `Id`

**Indexes**:
- `Email` (Unique Index)

**Business Rules**:
- OTP hết hạn sau 5 phút
- IsUsed = True sau khi reset thành công

---

## Relationships

### One-to-Many Relationships

1. **Customer → CustomerEmailAddress**: Một khách hàng có nhiều email
2. **Customer → CustomerPhone**: Một khách hàng có nhiều số điện thoại
3. **Customer → CustomerAdress**: Một khách hàng có nhiều địa chỉ
4. **Customer → SalesOrderHeader**: Một khách hàng có nhiều đơn hàng
5. **ProductCategory → ProductSubcategory**: Một category có nhiều subcategories
6. **ProductSubcategory → Product**: Một subcategory có nhiều sản phẩm
7. **Product → ProductImage**: Một sản phẩm có nhiều ảnh
8. **Product → ProductReview**: Một sản phẩm có nhiều đánh giá
9. **Product → ProductInventory**: Một sản phẩm có tồn kho ở nhiều locations
10. **Cart → CartItem**: Một giỏ hàng có nhiều items
11. **SalesOrderHeader → SalesOrderDetail**: Một đơn hàng có nhiều items
12. **RentalHeader → RentalDetail**: Một đơn thuê có nhiều items
13. **Voucher → VoucherUsage**: Một voucher được dùng bởi nhiều khách hàng
14. **Location → ProductInventory**: Một location chứa nhiều sản phẩm

### One-to-One Relationships

1. **Customer → CustomerPassWord**: Một khách hàng có một password
2. **Customer → Cart**: Một khách hàng có một giỏ hàng active
3. **Customer → RankCustomer**: Một khách hàng có một rank

### Many-to-Many Relationships

Không có many-to-many relationships trực tiếp. Các relationships phức tạp được giải quyết qua junction tables:
- **Customer ↔ Product** (qua SalesOrderDetail)
- **Customer ↔ Product** (qua CartItem)
- **Customer ↔ Product** (qua RentalDetail)
- **Customer ↔ Voucher** (qua VoucherUsage)

---

## Indexes và Constraints

### Primary Keys

Tất cả các bảng đều có Primary Key:
- Single column PK: Auto increment Integer
- Composite PK: Nhiều columns (ví dụ: CustomerPhone, SalesOrderDetail)

### Foreign Keys

Tất cả foreign keys đều có constraint để đảm bảo referential integrity:
- ON DELETE: Có thể là CASCADE hoặc RESTRICT (tùy business logic)
- ON UPDATE: Thường là CASCADE

### Unique Constraints

- `CustomerEmailAddress.EmailAddress`: Email phải unique (nên có)
- `Voucher.Code`: Mã voucher phải unique
- `PendingRegistration.Email`: Email trong pending registration phải unique
- `PasswordResetToken.Email`: Email trong reset token phải unique

### Indexes

**Primary Key Indexes**: Tự động tạo cho tất cả Primary Keys

**Additional Indexes** (nên có):
- `Product.ProductModelID`: Để tìm variants nhanh
- `ProductReview.ProductID`: Để query reviews theo sản phẩm
- `SalesOrderHeader.OrderDate`: Để filter đơn hàng theo ngày
- `SalesOrderHeader.CustomerID`: Để query đơn hàng của khách hàng
- `CartItem.CartID`: Để query items trong giỏ hàng

### Check Constraints

**Nên có** (có thể implement ở application level):
- `Product.Rating`: 1 <= Rating <= 5
- `CartItem.Quantity`: Quantity > 0
- `CartItem.RentalDays`: RentalDays > 0 (nếu TransactionType = 'rent')
- `Voucher.DiscountPercent`: 0 <= DiscountPercent <= 100
- `Voucher.StartDate`: StartDate < EndDate

---

## Kết Luận

Database của hệ thống BikeGo E-commerce được thiết kế với:

- **Normalized structure**: Giảm redundancy và đảm bảo data integrity
- **Flexible relationships**: Hỗ trợ nhiều email, phone, addresses cho mỗi customer
- **Comprehensive tracking**: Lưu đầy đủ thông tin cho orders, rentals, reviews
- **RFM analysis**: Hệ thống rank khách hàng dựa trên RFM
- **Dual transaction types**: Hỗ trợ cả buy và rent trong cùng hệ thống

Database schema hỗ trợ đầy đủ các chức năng của hệ thống e-commerce và rental management.
