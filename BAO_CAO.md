# BÁO CÁO TỔNG HỢP HỆ THỐNG BIKE GO E-COMMERCE

## MỤC LỤC

1. [Tổng Quan Dự Án](#1-tổng-quan-dự-án)
2. [Kiến Trúc Hệ Thống](#2-kiến-trúc-hệ-thống)
3. [Frontend (React)](#3-frontend-react)
4. [Backend (FastAPI)](#4-backend-fastapi)
5. [Kết Nối Frontend-Backend](#5-kết-nối-frontend-backend)
6. [Hướng Dẫn Cài Đặt và Chạy](#6-hướng-dẫn-cài-đặt-và-chạy)
7. [Tổng Kết](#7-tổng-kết)

---

## 1. TỔNG QUAN DỰ ÁN

### 1.1. Giới Thiệu

**BikeGo** là một hệ thống thương mại điện tử (E-commerce) chuyên về bán và cho thuê xe đạp, được xây dựng với kiến trúc full-stack hiện đại. Hệ thống hỗ trợ đầy đủ các chức năng từ quản lý sản phẩm, đơn hàng, khách hàng đến hệ thống admin panel toàn diện.

### 1.2. Mục Đích và Phạm Vi

- **Mục đích**: Xây dựng một nền tảng thương mại điện tử hoàn chỉnh cho cửa hàng xe đạp với khả năng:
  - Bán và cho thuê xe đạp
  - Quản lý kho hàng đa chi nhánh
  - Hệ thống xếp hạng khách hàng (RFM Analysis)
  - Quản lý voucher và khuyến mãi
  - Hệ thống đánh giá sản phẩm
  - Admin panel với đầy đủ tính năng CRUD

- **Phạm vi**: 
  - Frontend: React application với Material-UI
  - Backend: FastAPI RESTful API
  - Database: SQL Server với stored procedures
  - Authentication: JWT token-based
  - Hỗ trợ cả khách hàng đã đăng ký và khách vãng lai

### 1.3. Công Nghệ Sử Dụng

#### Frontend Stack
- **React 19.2.0** - UI framework
- **Material-UI (MUI) 7.3.5** - Component library và design system
- **React Router DOM 7.9.6** - Client-side routing
- **Axios 1.13.2** - HTTP client cho API calls
- **Recharts 2.12.7** - Data visualization cho dashboard
- **Date-fns 2.30.0** - Date manipulation utilities
- **JSON Server** - Mock API server cho development

#### Backend Stack
- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - ORM cho database operations
- **SQL Server** - Production database
- **PyODBC** - SQL Server driver
- **Python-JOSE** - JWT token handling
- **Passlib** - Password hashing (bcrypt)
- **FastAPI-Mail** - Email service cho OTP
- **Uvicorn** - ASGI server

---

## 2. KIẾN TRÚC HỆ THỐNG

### 2.1. Kiến Trúc Tổng Thể

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT BROWSER                      │
│              (React Application - Port 3000)            │
└────────────────────┬──────────────────────────────────┘
                     │ HTTP/REST API
                     │ (JWT Authentication)
┌────────────────────▼──────────────────────────────────┐
│              FASTAPI BACKEND (Port 8001)               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐           │
│  │   Auth   │  │  Admin   │  │  Store   │  ...       │
│  │  Routes  │  │  Routes  │  │  Routes  │           │
│  └──────────┘  └──────────┘  └──────────┘           │
│         │             │             │                 │
│         └─────────────┴─────────────┘                 │
│                    │                                    │
│              SQLAlchemy ORM                             │
└────────────────────┬──────────────────────────────────┘
                     │ ODBC Connection
┌────────────────────▼──────────────────────────────────┐
│              SQL SERVER DATABASE                        │
│         (final_project_getout)                          │
│  ┌──────────────┐  ┌──────────────┐                  │
│  │   Tables     │  │   Stored     │                  │
│  │   & Views    │  │  Procedures  │                  │
│  └──────────────┘  └──────────────┘                  │
└─────────────────────────────────────────────────────────┘
```

### 2.2. Cấu Trúc Thư Mục Dự Án

```
ilo/
├── frontend/                    # React Frontend Application
│   ├── public/                  # Static files
│   ├── src/
│   │   ├── api/                # API client modules
│   │   │   ├── axiosClient.js  # Axios configuration
│   │   │   ├── authApi.js      # Authentication APIs
│   │   │   ├── productApi.js   # Product APIs
│   │   │   ├── cartApi.js      # Cart APIs
│   │   │   ├── orderApi.js     # Order APIs
│   │   │   ├── adminApi.js     # Admin APIs
│   │   │   ├── userApi.js      # User APIs
│   │   │   └── staffApi.js     # Staff APIs
│   │   ├── components/         # Reusable components
│   │   │   ├── layout/         # Layout components
│   │   │   ├── common/         # Common components
│   │   │   ├── admin/          # Admin components
│   │   │   └── account/       # Account components
│   │   ├── pages/              # Page components
│   │   │   ├── admin/          # Admin pages
│   │   │   └── ...             # Customer pages
│   │   ├── assets/             # Images, icons
│   │   ├── theme.js            # MUI theme config
│   │   └── App.js              # Main app component
│   ├── package.json
│   └── server.js               # JSON Server mock API
│
└── backend/                     # FastAPI Backend
    ├── src/
    │   ├── app/
    │   │   ├── __init__.py     # FastAPI app factory
    │   │   ├── database.py     # Database configuration
    │   │   ├── models.py       # SQLAlchemy models
    │   │   ├── helper.py       # Helper functions
    │   │   └── routes/         # API routes
    │   │       ├── auth/       # Authentication routes
    │   │       ├── admin/      # Admin routes
    │   │       ├── store/      # Store routes
    │   │       ├── users/      # User routes
    │   │       └── chatbot/   # Chatbot routes
    │   └── main.py             # Application entry point
    ├── requirements.txt
    └── api_list.json           # API documentation
```

---

## 3. FRONTEND (REACT)

### 3.1. Kiến Trúc và Công Nghệ

#### 3.1.1. Công Nghệ Chính

- **React 19.2.0**: Framework UI với hooks và functional components
- **Material-UI 7.3.5**: Component library với theme customization
- **React Router DOM 7.9.6**: Client-side routing với nested routes
- **Axios 1.13.2**: HTTP client với interceptors cho authentication
- **Recharts 2.12.7**: Charts và graphs cho admin dashboard
- **Date-fns 2.30.0**: Date formatting và manipulation

#### 3.1.2. Cấu Trúc Components

**Layout Components** (`src/components/layout/`)
- `Layout.js`: Main layout wrapper với Header và Footer
- `Header.js`: Navigation bar với search, cart icon, user menu
- `Footer.js`: Footer với thông tin liên hệ

**Common Components** (`src/components/common/`)
- `ProductCard.js`: Card hiển thị sản phẩm
- `ProductFilters.js`: Bộ lọc sản phẩm (category, price, rating)
- `CategoryDrawer.js`: Side drawer cho danh mục
- `CategoryList.js`: Danh sách danh mục
- `AddressManager.js`: Form quản lý địa chỉ

**Admin Components** (`src/components/admin/`)
- `AdminLayout.js`: Layout cho admin panel với sidebar navigation
- `DataTable.js`: Bảng dữ liệu với sorting, filtering, pagination
- `SearchFilterBar.js`: Thanh tìm kiếm và lọc
- `StatusBadge.js`: Badge hiển thị trạng thái
- `StatusToggle.js`: Toggle switch cho status
- `ConfirmDialog.js`: Dialog xác nhận hành động
- `modals/`: Các modal components (ProductModal, CategoryModal, InvoiceModal, etc.)

**Account Components** (`src/components/account/`)
- `AccountInfo.js`: Thông tin tài khoản
- `AddressList.js`: Danh sách địa chỉ
- `OrderHistory.js`: Lịch sử đơn hàng
- `OrderDetail.js`: Chi tiết đơn hàng
- `PaymentSettings.js`: Cài đặt thanh toán

### 3.2. Pages và Routes

#### 3.2.1. Customer Pages

**ProductList** (`src/pages/ProductList.js`)
- Hiển thị danh sách sản phẩm với pagination
- Tìm kiếm sản phẩm
- Lọc theo category, price range, rating
- Sắp xếp theo giá (tăng/giảm)
- Product cards với hình ảnh, tên, giá, đánh giá

**ProductDetail** (`src/pages/ProductDetail.js`)
- Chi tiết sản phẩm đầy đủ
- Image gallery
- Thông số kỹ thuật
- Thêm vào giỏ hàng
- Hiển thị đánh giá và bình luận
- Sản phẩm liên quan

**CartPage** (`src/pages/CartPage.js`)
- Xem giỏ hàng
- Cập nhật số lượng
- Xóa sản phẩm
- Tính toán tổng tiền
- Chuyển đến thanh toán
- Hỗ trợ guest cart (session-based)

**LoginPage** (`src/pages/LoginPage.js`)
- Đăng nhập với email/password
- Hỗ trợ customer và staff accounts
- JWT token management
- Remember me functionality
- Forgot password flow

**SignUp** (`src/pages/SignUp.js`)
- Đăng ký tài khoản mới
- Form validation
- OTP verification
- Tạo tài khoản qua API

**AccountPage** (`src/pages/AccountPage.js`)
- Tab navigation cho các phần:
  - Account Info: Thông tin tài khoản
  - Addresses: Quản lý địa chỉ
  - Order History: Lịch sử đơn hàng
  - Payment Settings: Cài đặt thanh toán

**PaymentPage** (`src/pages/PaymentPage.js`)
- Chọn địa chỉ giao hàng
- Chọn phương thức thanh toán
- Tóm tắt đơn hàng
- Áp dụng voucher
- Hỗ trợ guest checkout

**OrderSuccessPage** (`src/pages/OrderSuccessPage.js`)
- Xác nhận đơn hàng thành công
- Hiển thị mã đơn hàng
- Nút tiếp tục mua sắm

#### 3.2.2. Admin Pages

**AdminDashboard** (`src/pages/admin/AdminDashboard.js`)
- Key metrics:
  - Total revenue với % thay đổi
  - Active rentals count
  - Total customers
  - Overdue returns alerts
- Charts:
  - Sales vs Rental revenue (bar chart)
  - Inventory status (pie chart)
  - Revenue reports theo date range
- Tables:
  - Top selling products
  - Top rented products
- Features:
  - Date range selection
  - Export functionality
  - Real-time refresh

**AdminProductList** (`src/pages/admin/AdminProductList.js`)
- Bảng danh sách sản phẩm
- Search và filter
- Status badges (Active/Inactive)
- Quick actions (Edit, Delete, View Reviews)
- Pagination

**AdminProductAdd** (`src/pages/admin/AdminProductAdd.js`)
- Form thêm sản phẩm mới
- Upload hình ảnh
- Chọn category
- Pricing và inventory
- Product specifications
- Rental configuration

**AdminProductEdit** (`src/pages/admin/AdminProductEdit.js`)
- Form chỉnh sửa sản phẩm
- Cập nhật thông tin
- Modify images
- Change pricing và inventory
- Update status

**AdminOrderList** (`src/pages/admin/AdminOrderList.js`)
- Danh sách đơn hàng
- Filter theo status, date, customer
- Search functionality
- Status badges
- Quick view details

**AdminOrderDetail** (`src/pages/admin/AdminOrderDetail.js`)
- Chi tiết đơn hàng đầy đủ
- Thông tin khách hàng
- Danh sách sản phẩm
- Status update workflow
- Invoice generation
- Cancellation handling

**AdminCustomerList** (`src/pages/admin/AdminCustomerList.js`)
- Danh sách khách hàng
- Search và filter
- Customer details view
- Order history per customer
- Customer ranking display

**AdminCustomerDetail** (`src/pages/admin/AdminCustomerDetail.js`)
- Full customer profile
- Contact information
- Address list
- Order history
- Customer rank và discount

**AdminCategoryList** (`src/pages/admin/AdminCategoryList.js`)
- Danh sách categories và subcategories
- Add/Edit/Delete categories
- Category hierarchy display

**AdminStaffList** (`src/pages/admin/AdminStaffList.js`)
- Danh sách nhân viên
- Staff roles (Admin, Order Staff, Product Staff)
- Department information
- Add/Edit/Delete staff
- Role assignment

**AdminPromotionList** (`src/pages/admin/AdminPromotionList.js`)
- Danh sách promotions/vouchers
- Active/Inactive status
- Date range display
- Usage statistics

**AdminPromotionAdd** (`src/pages/admin/AdminPromotionAdd.js`)
- Tạo voucher mới
- Set discount type và amount
- Configure date range
- Set minimum order amount
- Set usage limits

**AdminPromotionEdit** (`src/pages/admin/AdminPromotionEdit.js`)
- Cập nhật promotion details
- Modify discount settings
- Change status

**AdminRentalConfig** (`src/pages/admin/AdminRentalConfig.js`)
- Cấu hình rental settings
- Pricing rules
- Duration settings
- Terms and conditions

**AdminChatbotFAQ** (`src/pages/admin/AdminChatbotFAQ.js`)
- Quản lý FAQ entries
- Chatbot responses
- Customer support automation

### 3.3. API Integration

#### 3.3.1. Axios Configuration

File `src/api/axiosClient.js`:
- Base URL configuration với environment variable support
- Request interceptor để tự động gắn JWT token
- Response interceptor cho error handling
- CORS configuration
- Ngrok support

```javascript
// Tự động gắn token vào mọi request
axiosClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
});
```

#### 3.3.2. API Modules

**authApi.js**: Authentication APIs
- `login()`: Đăng nhập
- `register()`: Đăng ký tài khoản
- `getAccountDetails()`: Lấy thông tin tài khoản

**productApi.js**: Product APIs
- `fetchProductsAPI()`: Lấy danh sách sản phẩm
- `fetchProductDetailAPI()`: Lấy chi tiết sản phẩm
- `createProductAPI()`: Tạo sản phẩm (admin)
- `updateProductAPI()`: Cập nhật sản phẩm (admin)
- `deleteProductAPI()`: Xóa sản phẩm (admin)
- `fetchCategoriesAPI()`: Lấy danh sách categories

**cartApi.js**: Cart APIs
- `fetchCartAPI()`: Lấy giỏ hàng
- `addToCartAPI()`: Thêm vào giỏ hàng
- `updateCartItemAPI()`: Cập nhật số lượng
- `removeFromCartAPI()`: Xóa khỏi giỏ hàng

**orderApi.js**: Order APIs
- `placeOrderAPI()`: Đặt hàng
- `getOrdersAPI()`: Lấy danh sách đơn hàng
- `getOrderDetailAPI()`: Lấy chi tiết đơn hàng
- `cancelOrderAPI()`: Hủy đơn hàng

**adminApi.js**: Admin APIs
- Dashboard APIs
- Product management APIs
- Order management APIs
- Customer management APIs
- Category management APIs
- Staff management APIs
- Promotion management APIs
- Settings APIs

**userApi.js**: User APIs
- `getProfileAPI()`: Lấy profile
- `updateProfileAPI()`: Cập nhật profile
- `getAddressesAPI()`: Lấy danh sách địa chỉ
- `addAddressAPI()`: Thêm địa chỉ
- `updateAddressAPI()`: Cập nhật địa chỉ
- `deleteAddressAPI()`: Xóa địa chỉ

**staffApi.js**: Staff APIs
- Staff management APIs

### 3.4. Authentication và Authorization

#### 3.4.1. Token Management

- JWT token được lưu trong `localStorage`
- Token tự động được gắn vào mọi request qua axios interceptor
- Token được kiểm tra khi:
  - Component mount
  - Route navigation
  - API calls

#### 3.4.2. Role-Based Routing

- **Customer**: Truy cập các trang customer (ProductList, Cart, Account, etc.)
- **Staff**: Truy cập admin panel với quyền hạn theo role:
  - Order Staff: Quản lý đơn hàng
  - Product Staff: Quản lý sản phẩm
- **Admin**: Full access đến tất cả tính năng

#### 3.4.3. Protected Routes

- Customer routes: Yêu cầu authentication
- Admin routes: Yêu cầu admin/staff role
- Public routes: ProductList, ProductDetail, Cart (guest support)

### 3.5. State Management

- **Local State**: Sử dụng React hooks (useState, useEffect)
- **Context API**: Có thể mở rộng cho global state
- **localStorage**: Lưu token, user info, cart (guest)
- **Session Storage**: Có thể sử dụng cho temporary data

### 3.6. Styling và Theme

- **Material-UI Theme**: Custom theme trong `theme.js`
- **Responsive Design**: Mobile-friendly với breakpoints
- **Component Styling**: Sử dụng MUI's `sx` prop và `styled` API
- **Custom CSS**: Một số components có CSS files riêng

---

## 4. BACKEND (FASTAPI)

### 4.1. Kiến Trúc và Công Nghệ

#### 4.1.1. Framework và Libraries

- **FastAPI**: Modern, fast web framework cho Python
- **SQLAlchemy**: ORM cho database operations
- **PyODBC**: SQL Server driver
- **Python-JOSE**: JWT token encoding/decoding
- **Passlib**: Password hashing với bcrypt
- **FastAPI-Mail**: Email service cho OTP
- **Uvicorn**: ASGI server

#### 4.1.2. Cấu Trúc Routes

**Auth Routes** (`src/app/routes/auth/`)
- `POST /auth/login`: Đăng nhập
- `POST /auth/register`: Đăng ký tài khoản
- `POST /auth/verify-registration`: Xác thực OTP đăng ký
- `POST /auth/forgot-password`: Gửi OTP quên mật khẩu
- `POST /auth/reset-password`: Đặt lại mật khẩu

**Admin Routes** (`src/app/routes/admin/`)
- `GET /admin/dashboard`: Dashboard statistics
- `GET /admin/reports`: Revenue và product reports
- Products CRUD: `/admin/products`
- Orders management: `/admin/orders`
- Customers management: `/admin/customers`
- Categories management: `/admin/categories`
- Staff management: `/admin/staffs`
- Promotions management: `/admin/promotions`
- Settings: `/admin/settings/rental`
- FAQs: `/admin/faqs`

**Store Routes** (`src/app/routes/store/`)
- `GET /store/info`: Thông tin cửa hàng
- `GET /store/locations`: Danh sách chi nhánh
- `GET /store/policies`: Chính sách cửa hàng
- `POST /store/contact`: Gửi tin nhắn liên hệ

**Users Routes** (`src/app/routes/users/`)
- `GET /users/profile`: Thông tin profile
- `PATCH /users/profile`: Cập nhật profile
- `POST /users/change-password`: Đổi mật khẩu
- Addresses CRUD: `/users/addresses`
- Wishlists: `/users/wishlists`
- Notifications: `/users/notifications`
- Settings: `/users/settings`
- `POST /users/logout`: Đăng xuất

**Chatbot Routes** (`src/app/routes/chatbot/`)
- `GET /chatbot/conversations`: Danh sách conversations
- `GET /chatbot/conversations/{id}`: Lịch sử chat
- `POST /chatbot/send-message`: Gửi tin nhắn
- `GET /chatbot/faq-search`: Tìm kiếm FAQ

### 4.2. Database Models

#### 4.2.1. Customer Models

**Customer** (`app/models.py`)
```python
- CustomerID (PK)
- FirstName, MiddleName, LastName
- AvatarURL
- Status (1: Active, 0: Banned)
- Relationships: addresses, emails, phones, passwords, orders, cart, rank
```

**CustomerAdress**
```python
- AddressID (PK)
- CustomerID (FK)
- AddressLine1, City, PostalCode
- PhoneNumber
- IsDefault
- ModifiedDate
```

**CustomerEmailAddress**
```python
- EmailAddressID (PK)
- CustomerID (FK)
- EmailAddress
- ModifiedDate
```

**CustomerPhone**
```python
- CustomerID (PK, FK)
- PhoneNumber (PK)
- PhoneNumberTypeID (PK)
- ModifiedDate
```

**CustomerPassWord**
```python
- CustomerID (PK, FK)
- PasswordSalt (hashed password)
- ModifiedDate
```

**RankCustomer**
```python
- CustomerID (PK, FK)
- R (Recency)
- F (Frequency)
- M (Monetary)
- Final_score
- rank_cus (rank name)
- discount (discount percentage)
```

#### 4.2.2. Product Models

**ProductCategory**
```python
- ProductCategoryID (PK)
- Name
- ModifiedDate
```

**ProductSubcategory**
```python
- ProductSubcategoryID (PK)
- ProductCategoryID (FK)
- Name
- ModifiedDate
```

**Product**
```python
- ProductID (PK)
- ProductNumber
- Name
- ProductSubcategoryID (FK)
- StandardCost, ListPrice
- SafetyStockLevel, ReorderPoint
- ModifiedDate
- Relationships: subcategory, inventory, images, reviews, cart_items
```

**ProductDescription**
```python
- ProductID (PK, FK)
- Description
- ModifiedDate
```

**ProductImage**
```python
- ImageID (PK)
- ProductID (FK)
- ImageURL
- IsPrimary
- Caption
- CreatedDate
```

**ProductInventory**
```python
- ProductID (PK, FK)
- LocationID (PK, FK)
- Shelf, Bin
- Quantity
- ModifiedDate
```

**ProductReview**
```python
- ReviewID (PK)
- ProductID (FK)
- CustomerID (FK)
- Rating (1-5)
- ReviewText
- ReviewDate
- AdminReply
- ReplyDate
```

#### 4.2.3. Order Models

**SalesOrderHeader**
```python
- SalesOrderID (PK)
- CustomerID (FK)
- OrderDate, DueDate, ShipDate
- Freight
- SalesOrderNumber
- TotalDue
- OrderStatus
- CancellationRequestDate
- CancellationReason
- ModifiedDate
```

**SalesOrderDetail**
```python
- SalesOrderID (PK, FK)
- SalesOrderDetailID (PK)
- OrderQty
- ProductID (FK)
- UnitPrice
- LineTotal
- ModifiedDate
```

**RentalHeader**
```python
- RentalID (PK)
- CustomerID (FK)
- StartDate, DueDate, ReturnDate
- TotalDue
- Status
- ModifiedDate
```

**RentalDetail**
```python
- RentalID (PK, FK)
- RentalDetailID (PK)
- ProductID (FK)
- InventoryAssetID
- RentalDays
- UnitPrice
- LineTotal
```

#### 4.2.4. Cart Models

**Cart**
```python
- CartID (PK)
- CustomerID (FK)
- CreatedDate, ModifiedDate
- Status
- IsCheckedOut
```

**CartItem**
```python
- CartItemID (PK)
- CartID (FK)
- ProductID (FK)
- Quantity
- UnitPrice
- Subtotal
- TransactionType ('buy' or 'rent')
- RentalDays
- DateAdded, DateUpdated
```

#### 4.2.5. Employee Models

**Employee**
```python
- BusinessEntityID (PK)
- FullName
- EmailAddress
- PhoneNumber
- PasswordSalt
- DepartmentName
- GroupName
- Role (admin, product_staff, order_staff)
- Status
- BirthDate, StartDate
```

#### 4.2.6. Voucher Models

**Voucher**
```python
- VoucherID (PK)
- Name, Code
- Scope
- StartDate, EndDate
- Quantity
- TargetRanks
- Status
- DiscountType ('percentage' or 'fixed')
- DiscountValue
- MinOrderAmount
```

**VoucherUsage**
```python
- VoucherUsageID (PK)
- VoucherID (FK)
- CustomerID (FK)
- UsedDate
```

#### 4.2.7. Location Models

**Location**
```python
- LocationID (PK)
- Name
- Availability
- ModifiedDate
```

### 4.3. Authentication & Authorization

#### 4.3.1. JWT Authentication

- **Token Generation**: Sử dụng `python-jose` với HS256 algorithm
- **Token Expiry**: 60 phút (có thể config)
- **Password Hashing**: Sử dụng `passlib` với bcrypt
- **Token Storage**: Frontend lưu trong localStorage

#### 4.3.2. Role-Based Access Control

**Roles**:
- **Customer**: Khách hàng thông thường
- **Product Staff**: Nhân viên quản lý sản phẩm
- **Order Staff**: Nhân viên quản lý đơn hàng
- **Admin**: Quản trị viên với full access

**Permission Checks**:
- Admin routes yêu cầu admin role
- Staff routes yêu cầu staff role tương ứng
- Customer routes yêu cầu authentication

#### 4.3.3. OTP System

- OTP được gửi qua email khi:
  - Đăng ký tài khoản
  - Quên mật khẩu
- OTP có thời hạn 5 phút
- OTP được lưu tạm thời trong database hoặc cache

### 4.4. API Endpoints Chi Tiết

#### 4.4.1. Authentication Endpoints

**POST /auth/login**
```json
Request:
{
  "identifier": "email@example.com" hoặc "phone_number",
  "password": "password123"
}

Response:
{
  "access_token": "jwt_token",
  "token_type": "bearer",
  "role": "customer" | "admin" | "staff",
  "name": "Full Name",
  "id": 123
}
```

**POST /auth/register**
```json
Request:
{
  "first_name": "Nguyễn",
  "last_name": "Văn A",
  "email": "user@example.com",
  "phone": "0123456789",
  "password": "password123"
}

Response:
{
  "message": "Registration successful. Please check your email for OTP."
}
```

**POST /auth/verify-registration**
```json
Request:
{
  "email": "user@example.com",
  "otp": "123456"
}

Response:
{
  "message": "Account verified successfully",
  "customer_id": 123
}
```

**POST /auth/forgot-password**
```json
Request:
{
  "email": "user@example.com"
}

Response:
{
  "message": "OTP sent to your email"
}
```

**POST /auth/reset-password**
```json
Request:
{
  "email": "user@example.com",
  "otp": "123456",
  "new_password": "newpassword123"
}

Response:
{
  "message": "Password reset successfully"
}
```

#### 4.4.2. Admin Endpoints

**GET /admin/dashboard**
```json
Response:
{
  "success": true,
  "data": {
    "summary": {
      "total_revenue": {
        "value": 1000000,
        "growth_percentage": 15.5,
        "growth_direction": "up"
      },
      "active_rental": {
        "value": 25,
        "unit": "bikes"
      },
      "total_customers": {
        "value": 500,
        "unit": "customers"
      },
      "overdue_return": {
        "value": 3,
        "has_warning": true,
        "warning_message": "3 bikes overdue"
      }
    },
    "revenue_chart": {
      "labels": ["Mon", "Tue", ...],
      "series": [
        {"name": "Sales", "data": [...]},
        {"name": "Rentals", "data": [...]}
      ]
    },
    "inventory_status": {
      "total_items": 100,
      "breakdown": [...]
    }
  }
}
```

**GET /admin/reports**
```json
Query Params:
- start_date: YYYY-MM-DD
- end_date: YYYY-MM-DD
- page: 1
- limit: 5

Response:
{
  "success": true,
  "data": {
    "revenue_report": {
      "total_revenue": 1000000,
      "total_orders": 50,
      "avg_daily_revenue": 20000
    },
    "top_selling_products": [...],
    "top_rented_products": [...]
  }
}
```

**Products CRUD**:
- `GET /admin/products`: List products với pagination và search
- `POST /admin/products`: Tạo sản phẩm mới
- `GET /admin/products/{product_id}`: Chi tiết sản phẩm
- `PATCH /admin/products/{product_id}`: Cập nhật sản phẩm
- `DELETE /admin/products/{product_id}`: Xóa sản phẩm

**Orders Management**:
- `GET /admin/orders`: List orders với filter
- `GET /admin/orders/{order_id}`: Chi tiết đơn hàng
- `PATCH /admin/orders/{order_id}/status`: Cập nhật trạng thái
- `POST /admin/orders/{order_id}/request-review`: Duyệt yêu cầu hủy
- `POST /admin/orders/{order_id}/rental-preparation`: Chuẩn bị xe cho thuê

**Customers Management**:
- `GET /admin/customers`: List customers
- `GET /admin/customers/{customer_id}`: Chi tiết khách hàng
- `GET /admin/customers/{customer_id}/orders`: Đơn hàng của khách hàng
- `PATCH /admin/customers/{customer_id}`: Cập nhật trạng thái

**Categories Management**:
- `GET /admin/categories`: List categories
- `POST /admin/categories`: Tạo category
- `GET /admin/categories/{category_id}`: Chi tiết category
- `PATCH /admin/categories/{category_id}`: Cập nhật category
- `DELETE /admin/categories/{category_id}`: Xóa category

**Staff Management**:
- `GET /admin/staffs`: List staff
- `POST /admin/staffs`: Tạo staff
- `GET /admin/staffs/{staff_id}`: Chi tiết staff
- `PATCH /admin/staffs/{staff_id}`: Cập nhật staff
- `DELETE /admin/staffs/{staff_id}`: Xóa staff

**Promotions Management**:
- `GET /admin/promotions`: List promotions
- `POST /admin/promotions`: Tạo promotion
- `GET /admin/promotions/{promotion_id}`: Chi tiết promotion
- `PATCH /admin/promotions/{promotion_id}`: Cập nhật promotion
- `DELETE /admin/promotions/{promotion_id}`: Xóa promotion

**Settings**:
- `GET /admin/settings/rental`: Lấy rental settings
- `PATCH /admin/settings/rental`: Cập nhật rental settings

**FAQs**:
- `GET /admin/faqs`: List FAQs
- `POST /admin/faqs`: Tạo FAQ
- `GET /admin/faqs/{faq_id}`: Chi tiết FAQ
- `PATCH /admin/faqs/{faq_id}`: Cập nhật FAQ
- `DELETE /admin/faqs/{faq_id}`: Xóa FAQ

#### 4.4.3. Store Endpoints

**GET /store/info**
```json
Response:
{
  "success": true,
  "data": {
    "store_name": "BikeGo",
    "logo_url": "...",
    "description": "...",
    "phone": "...",
    "email": "...",
    "website": "...",
    "social_media": {...}
  }
}
```

**GET /store/locations**
```json
Response:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Chi nhánh 1",
      "address": "...",
      "phone": "...",
      "email": "...",
      "latitude": 10.123,
      "longitude": 106.456,
      "opening_hours": {...}
    }
  ]
}
```

**GET /store/policies**
```json
Response:
{
  "success": true,
  "data": {
    "return_policy": "...",
    "warranty_policy": "...",
    "shipping_policy": "...",
    "privacy_policy": "...",
    "terms_of_service": "..."
  }
}
```

**POST /store/contact**
```json
Request:
{
  "name": "Nguyễn Văn A",
  "email": "user@example.com",
  "phone": "0123456789",
  "subject": "Câu hỏi",
  "message": "Nội dung tin nhắn"
}

Response:
{
  "success": true,
  "message": "Message sent successfully"
}
```

#### 4.4.4. Users Endpoints

**GET /users/profile**
```json
Response:
{
  "success": true,
  "data": {
    "id": 123,
    "first_name": "Nguyễn",
    "last_name": "Văn A",
    "email": "user@example.com",
    "phone": "0123456789",
    "avatar_url": "...",
    "gender": "male",
    "date_of_birth": "1990-01-01",
    "account_type": "customer",
    "status": "active",
    "created_at": "2024-01-01T00:00:00"
  }
}
```

**PATCH /users/profile**
```json
Request:
{
  "first_name": "Nguyễn",
  "last_name": "Văn B",
  "phone": "0987654321",
  "avatar_url": "...",
  "gender": "male",
  "date_of_birth": "1990-01-01"
}

Response:
{
  "success": true,
  "message": "Profile updated successfully"
}
```

**POST /users/change-password**
```json
Request:
{
  "current_password": "oldpassword",
  "new_password": "newpassword",
  "confirm_password": "newpassword"
}

Response:
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Addresses CRUD**:
- `GET /users/addresses`: List addresses
- `POST /users/addresses`: Thêm địa chỉ
- `PATCH /users/addresses/{address_id}`: Cập nhật địa chỉ
- `DELETE /users/addresses/{address_id}`: Xóa địa chỉ

**Wishlists**:
- `GET /users/wishlists`: List wishlist items
- `POST /users/wishlists`: Thêm vào wishlist
- `DELETE /users/wishlists/{product_id}`: Xóa khỏi wishlist

**Notifications**:
- `GET /users/notifications`: List notifications
- `PATCH /users/notifications/{notification_id}/read`: Đánh dấu đã đọc

**Settings**:
- `GET /users/settings`: Lấy settings
- `PATCH /users/settings`: Cập nhật settings

#### 4.4.5. Chatbot Endpoints

**GET /chatbot/conversations**
```json
Query Params:
- page: 1
- limit: 10

Response:
{
  "success": true,
  "data": [
    {
      "id": "conv_123",
      "title": "Câu hỏi về sản phẩm",
      "created_at": "2024-01-01T00:00:00",
      "updated_at": "2024-01-01T00:00:00",
      "status": "active"
    }
  ],
  "pagination": {...}
}
```

**GET /chatbot/conversations/{conversation_id}**
```json
Query Params:
- page: 1
- limit: 20

Response:
{
  "success": true,
  "data": {
    "id": "conv_123",
    "title": "...",
    "messages": [
      {
        "id": "msg_1",
        "sender": "user" | "bot",
        "content": "...",
        "created_at": "2024-01-01T00:00:00"
      }
    ]
  }
}
```

**POST /chatbot/send-message**
```json
Request:
{
  "conversation_id": "conv_123" hoặc null (tạo mới),
  "message": "Câu hỏi của khách hàng"
}

Response:
{
  "success": true,
  "data": {
    "conversation_id": "conv_123",
    "user_message": "...",
    "bot_response": "...",
    "timestamp": "2024-01-01T00:00:00"
  }
}
```

**GET /chatbot/faq-search**
```json
Query Params:
- query: "từ khóa tìm kiếm"
- limit: 5

Response:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "question": "...",
      "answer": "...",
      "relevance_score": 0.95
    }
  ]
}
```

### 4.5. Database Configuration

#### 4.5.1. Connection Setup

File `src/app/database.py`:
```python
server = 'localhost\\SQLEXPRESS'
database = 'final_project_getout'
username = 'sa1'
password = '2611'

SQLALCHEMY_DATABASE_URL = f"mssql+pyodbc:///?odbc_connect={params}"
engine = create_engine(SQLALCHEMY_DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
```

#### 4.5.2. SQLAlchemy Models

- Models được định nghĩa trong `app/models.py`
- Sử dụng declarative base từ SQLAlchemy
- Relationships được định nghĩa với `relationship()`
- Foreign keys với `ForeignKey()`

### 4.6. Helper Functions

File `src/app/helper.py` chứa các utility functions:
- Response formatting
- Error handling
- Data validation
- Common business logic

### 4.7. Tính Năng Đặc Biệt

#### 4.7.1. Customer Ranking System (RFM Analysis)

- **Recency (R)**: Số ngày kể từ lần mua cuối
- **Frequency (F)**: Số lần mua trong khoảng thời gian
- **Monetary (M)**: Tổng số tiền đã chi tiêu
- **Final Score**: Tính toán từ R, F, M
- **Rank**: Phân loại khách hàng (Bronze, Silver, Gold, Platinum)
- **Discount**: Mức giảm giá theo rank

#### 4.7.2. Voucher System

- Hỗ trợ 2 loại discount:
  - Percentage: Giảm theo %
  - Fixed: Giảm số tiền cố định
- Validation:
  - Date range (start_date, end_date)
  - Minimum order amount
  - Usage quantity limits
  - Target ranks (chỉ áp dụng cho một số rank)
- Tracking: Lưu lại lịch sử sử dụng voucher

#### 4.7.3. Multi-Location Inventory

- Inventory được quản lý theo từng location
- Mỗi sản phẩm có thể có inventory ở nhiều location
- Tracking: Shelf, Bin, Quantity per location

#### 4.7.4. Order Status Workflow

**Sales Order**:
- Pending → Confirmed → Preparing → Shipped → Completed
- Có thể Cancel ở bất kỳ giai đoạn nào

**Rental Order**:
- Pending → Confirmed → Preparing → Rented → Returned
- Tracking: StartDate, DueDate, ReturnDate
- Overdue detection và alerts

#### 4.7.5. Product Reviews và Ratings

- Rating: 1-5 sao
- Review text
- Admin reply functionality
- Review moderation (admin có thể xóa)

---

## 5. KẾT NỐI FRONTEND-BACKEND

### 5.1. API Configuration

#### 5.1.1. Base URL Configuration

Frontend (`src/api/axiosClient.js`):
```javascript
const baseURL = process.env.REACT_APP_API_URL || 
                `http://${window.location.hostname}:8001`;
```

Backend chạy trên port **8001** (FastAPI)

#### 5.1.2. CORS Configuration

Backend cần cấu hình CORS để cho phép frontend gọi API:
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 5.2. Authentication Flow

1. **Login**:
   - Frontend gửi credentials đến `/auth/login`
   - Backend trả về JWT token
   - Frontend lưu token vào localStorage
   - Token được gắn vào mọi request tiếp theo

2. **Protected Routes**:
   - Frontend kiểm tra token trong localStorage
   - Nếu có token, gắn vào header `Authorization: Bearer {token}`
   - Backend verify token và extract user info

3. **Logout**:
   - Frontend xóa token khỏi localStorage
   - Backend có thể invalidate token (nếu implement)

### 5.3. Error Handling

#### 5.3.1. Frontend Error Handling

- Axios interceptor để catch errors
- Hiển thị user-friendly error messages
- Handle các HTTP status codes:
  - 401: Unauthorized → Redirect to login
  - 403: Forbidden → Show access denied
  - 404: Not Found → Show not found message
  - 500: Server Error → Show error message

#### 5.3.2. Backend Error Handling

- FastAPI exception handlers
- Standardized error responses:
```json
{
  "detail": "Error message"
}
```

### 5.4. Data Flow

1. **User Action** (Frontend)
   ↓
2. **API Call** (Axios)
   ↓
3. **Request với Token** (HTTP Request)
   ↓
4. **Backend Route Handler** (FastAPI)
   ↓
5. **Database Query** (SQLAlchemy)
   ↓
6. **Response** (JSON)
   ↓
7. **Update UI** (React State)

---

## 6. HƯỚNG DẪN CÀI ĐẶT VÀ CHẠY

### 6.1. Yêu Cầu Hệ Thống

#### Backend:
- Python 3.7+
- SQL Server (với ODBC Driver 17 for SQL Server)
- pip (Python package manager)

#### Frontend:
- Node.js 14+ và npm
- Modern web browser

### 6.2. Cài Đặt Backend

#### Bước 1: Cài đặt Dependencies

```bash
cd backend
pip install -r requirements.txt
```

Hoặc với Python 3:
```bash
python -m pip install -r requirements.txt
```

#### Bước 2: Cấu hình Database

1. Đảm bảo SQL Server đã được cài đặt và chạy
2. Kiểm tra và cập nhật thông tin kết nối trong `backend/src/app/database.py`:
   ```python
   server = 'localhost\\SQLEXPRESS'
   database = 'final_project_getout'
   username = 'sa1'
   password = '2611'
   ```
3. Đảm bảo database `final_project_getout` đã tồn tại

#### Bước 3: Chạy Backend

```bash
cd backend/src
python main.py
```

Hoặc:
```bash
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8001
```

#### Bước 4: Kiểm tra Backend

- Mở browser và truy cập: `http://localhost:8001/docs`
- Bạn sẽ thấy FastAPI Swagger UI documentation
- Backend sẽ tự động tạo Super Admin account:
  - Email: `admin`
  - Password: `admin123`

### 6.3. Cài Đặt Frontend

#### Bước 1: Cài đặt Dependencies

```bash
cd frontend
npm install
```

#### Bước 2: Cấu hình API URL (Optional)

Tạo file `.env` trong thư mục `frontend`:
```
REACT_APP_API_URL=http://localhost:8001
```

Hoặc chỉnh sửa `frontend/src/api/axiosClient.js` để đổi port nếu cần.

#### Bước 3: Chạy Frontend

```bash
npm start
```

Lệnh này sẽ:
- Chạy React development server trên port **3000**
- Chạy JSON Server (mock API) trên port **8000** (nếu có)

#### Bước 4: Kiểm tra Frontend

- Browser sẽ tự động mở tại: `http://localhost:3000`
- JSON Server API (nếu có): `http://localhost:8000/api`

### 6.4. Tóm Tắt Các Port

| Service | Port | URL |
|---------|------|-----|
| React App | 3000 | http://localhost:3000 |
| JSON Server (Mock API) | 8000 | http://localhost:8000/api |
| FastAPI Backend | 8001 | http://localhost:8001/docs |

### 6.5. Xử Lý Lỗi Thường Gặp

#### Lỗi Backend:

**Lỗi kết nối database**:
- Kiểm tra SQL Server đã chạy chưa
- Kiểm tra thông tin kết nối trong `database.py`
- Kiểm tra ODBC Driver đã được cài đặt

**Lỗi thiếu module**:
```bash
pip install -r requirements.txt
```

**Lỗi `email-validator is not installed`**:
- Đã được thêm vào `requirements.txt`, chạy lại:
```bash
pip install -r requirements.txt
```

**Lỗi timeout khi cài `fastapi_mail` hoặc `cryptography`**:
- Thử lại với timeout tăng:
```bash
pip install --default-timeout=300 fastapi_mail
```
- Hoặc cài từng package nhỏ trước:
```bash
pip install jinja2 blinker aiosmtplib
pip install fastapi_mail
```

#### Lỗi Frontend:

**Lỗi port đã được sử dụng**:
- Đóng các ứng dụng đang dùng port 3000 hoặc 8000
- Hoặc đổi port trong `package.json`

**Lỗi thiếu dependencies**:
```bash
npm install
```

**Lỗi CORS**:
- Đảm bảo backend đã cấu hình CORS middleware
- Kiểm tra `allow_origins` trong backend

### 6.6. Lưu Ý Quan Trọng

1. **Chạy Backend trước** để đảm bảo database đã sẵn sàng
2. Frontend có thể chạy độc lập với JSON Server để test UI
3. Để test đầy đủ với database thật, cần chạy cả Backend và cấu hình frontend kết nối đến port 8001
4. Super Admin account được tạo tự động khi backend khởi động lần đầu

---

## 7. TỔNG KẾT

### 7.1. Tóm Tắt Tính Năng Chính

#### Frontend:
- ✅ Giao diện người dùng hiện đại với Material-UI
- ✅ Quản lý sản phẩm (xem, tìm kiếm, lọc)
- ✅ Giỏ hàng (hỗ trợ cả authenticated và guest users)
- ✅ Đặt hàng và thanh toán
- ✅ Quản lý tài khoản (profile, addresses, orders)
- ✅ Admin panel đầy đủ với dashboard, CRUD operations
- ✅ Responsive design cho mobile và desktop
- ✅ Authentication và authorization
- ✅ Error handling và loading states

#### Backend:
- ✅ RESTful API với FastAPI
- ✅ JWT authentication
- ✅ Role-based access control
- ✅ Customer ranking system (RFM Analysis)
- ✅ Voucher system với validation
- ✅ Multi-location inventory tracking
- ✅ Order management (sales và rental)
- ✅ Product reviews và ratings
- ✅ Email service cho OTP
- ✅ Chatbot FAQ system
- ✅ Comprehensive admin APIs

### 7.2. Công Nghệ Sử Dụng

**Frontend Stack**:
- React 19.2.0
- Material-UI 7.3.5
- React Router DOM 7.9.6
- Axios 1.13.2
- Recharts 2.12.7
- Date-fns 2.30.0

**Backend Stack**:
- FastAPI
- SQLAlchemy
- SQL Server
- PyODBC
- Python-JOSE
- Passlib (bcrypt)
- FastAPI-Mail
- Uvicorn

**Database**:
- SQL Server với stored procedures
- ODBC Driver 17 for SQL Server

### 7.3. Điểm Mạnh của Hệ Thống

1. **Kiến trúc hiện đại**: Sử dụng các công nghệ mới nhất và best practices
2. **Tách biệt Frontend-Backend**: Dễ dàng scale và maintain
3. **Security**: JWT authentication, password hashing, role-based access
4. **User Experience**: Giao diện đẹp, responsive, dễ sử dụng
5. **Admin Panel**: Đầy đủ tính năng quản lý
6. **Scalability**: Có thể mở rộng dễ dàng
7. **Documentation**: API documentation với Swagger UI

### 7.4. Hướng Phát Triển

#### Ngắn hạn:
- [ ] Payment gateway integration (Stripe/PayPal)
- [ ] Email notifications (order confirmations, shipping)
- [ ] Advanced search với full-text search
- [ ] Product recommendations
- [ ] Inventory alerts và reports

#### Dài hạn:
- [ ] Mobile app (React Native)
- [ ] Real-time notifications (WebSocket)
- [ ] Analytics dashboard nâng cao
- [ ] Multi-language support
- [ ] Social media integration
- [ ] Advanced reporting và business intelligence

### 7.5. Kết Luận

Hệ thống **BikeGo E-commerce** là một giải pháp thương mại điện tử hoàn chỉnh với kiến trúc hiện đại, tính năng đầy đủ và khả năng mở rộng cao. Hệ thống hỗ trợ cả bán và cho thuê xe đạp, với hệ thống quản lý kho hàng đa chi nhánh, xếp hạng khách hàng, và admin panel toàn diện. Với công nghệ stack hiện đại và code structure tốt, hệ thống có thể phát triển và mở rộng dễ dàng trong tương lai.

---

**Tài liệu được tạo bởi**: AI Assistant  
**Ngày tạo**: 2024  
**Phiên bản**: 1.0
