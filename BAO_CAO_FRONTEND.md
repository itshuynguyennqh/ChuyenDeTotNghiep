# Báo Cáo Frontend - BikeGo E-commerce System

## Mục Lục

1. [Tổng Quan Frontend](#tổng-quan-frontend)
2. [Kiến Trúc Frontend](#kiến-trúc-frontend)
3. [Pages Documentation](#pages-documentation)
4. [Components Documentation](#components-documentation)
5. [API Integration](#api-integration)
6. [Routing](#routing)
7. [State Management](#state-management)
8. [Theme & Styling](#theme--styling)

---

## Tổng Quan Frontend

### Giới Thiệu

Frontend của hệ thống BikeGo E-commerce được xây dựng bằng **React 19** với **Material-UI (MUI) v7** làm component library chính. Ứng dụng cung cấp giao diện người dùng hiện đại, responsive cho cả khách hàng và quản trị viên.

### Công Nghệ Sử Dụng

- **React 19.2.0**: UI framework
- **Material-UI (MUI) 7.3.5**: Component library và design system
- **React Router DOM 7.9.6**: Client-side routing
- **Axios 1.13.2**: HTTP client cho API calls
- **Recharts 2.12.7**: Data visualization (charts) cho admin dashboard
- **Date-fns 2.30.0**: Date manipulation và formatting
- **Express 5.2.1**: JSON Server cho mock API (development)
- **JSON Server 0.17.4**: Mock API server

### Cấu Trúc Thư Mục

```
frontend/
├── public/
│   ├── index.html
│   ├── favicon.ico
│   └── manifest.json
├── src/
│   ├── api/                    # API client modules
│   │   ├── axiosClient.js      # Axios configuration
│   │   ├── authApi.js          # Authentication APIs
│   │   ├── productApi.js       # Product APIs
│   │   ├── cartApi.js           # Cart APIs
│   │   ├── orderApi.js          # Order APIs
│   │   ├── userApi.js           # User profile APIs
│   │   ├── adminApi.js          # Admin APIs
│   │   └── staffApi.js          # Staff APIs
│   ├── components/              # Reusable components
│   │   ├── layout/              # Layout components
│   │   │   ├── Header.js
│   │   │   ├── Footer.js
│   │   │   └── Layout.js
│   │   ├── common/              # Common components
│   │   │   ├── ProductCard.js
│   │   │   ├── ProductFilters.js
│   │   │   ├── CategoryDrawer.js
│   │   │   ├── CategoryList.js
│   │   │   └── AddressManager.js
│   │   ├── account/             # Account components
│   │   │   ├── AccountInfo.js
│   │   │   ├── AddressList.js
│   │   │   ├── OrderHistory.js
│   │   │   ├── OrderDetail.js
│   │   │   └── PaymentSettings.js
│   │   └── admin/               # Admin components
│   │       ├── AdminLayout.js
│   │       ├── DataTable.js
│   │       ├── SearchFilterBar.js
│   │       ├── StatusBadge.js
│   │       ├── StatusToggle.js
│   │       ├── ConfirmDialog.js
│   │       └── modals/          # Modal components
│   ├── pages/                   # Page components
│   │   ├── ProductList.js
│   │   ├── ProductDetail.js
│   │   ├── CartPage.js
│   │   ├── LoginPage.js
│   │   ├── SignUp.js
│   │   ├── AccountPage.js
│   │   ├── PaymentPage.js
│   │   ├── OrderSuccessPage.js
│   │   └── admin/               # Admin pages
│   │       ├── AdminDashboard.js
│   │       ├── AdminProductList.js
│   │       ├── AdminProductAdd.js
│   │       ├── AdminProductEdit.js
│   │       ├── AdminOrderList.js
│   │       ├── AdminOrderDetail.js
│   │       ├── AdminCustomerList.js
│   │       ├── AdminCategoryList.js
│   │       ├── AdminStaffList.js
│   │       ├── AdminPromotionList.js
│   │       ├── AdminPromotionAdd.js
│   │       ├── AdminPromotionEdit.js
│   │       ├── AdminRentalConfig.js
│   │       └── AdminChatbotFAQ.js
│   ├── assets/                  # Static assets
│   │   ├── BikeGo-logo-orange.png
│   │   ├── BikeGo-logo-white.png
│   │   └── ...
│   ├── App.js                   # Main app component với routing
│   ├── App.css                  # Global styles
│   ├── index.js                 # Entry point
│   ├── index.css                # Global CSS
│   └── theme.js                 # MUI theme configuration
├── server.js                    # JSON Server mock API
├── package.json
└── README.md
```

### Build và Deployment

**Development**:
```bash
npm start
```
- Chạy React app trên port 3000
- Chạy JSON Server trên port 8000 (tự động)

**Production Build**:
```bash
npm run build
```
- Tạo optimized build trong thư mục `build/`
- Có thể deploy lên bất kỳ static hosting nào (Netlify, Vercel, etc.)

---

## Kiến Trúc Frontend

### Component Hierarchy

```
App
├── ThemeProvider
│   └── Router
│       ├── Layout (Customer Routes)
│       │   ├── Header
│       │   ├── Routes
│       │   │   ├── ProductList
│       │   │   ├── ProductDetail
│       │   │   ├── CartPage
│       │   │   └── AccountPage
│       │   └── Footer
│       ├── LoginPage
│       ├── SignUp
│       ├── PaymentPage
│       ├── OrderSuccessPage
│       └── AdminLayout (Admin Routes)
│           ├── AdminSidebar
│           └── Routes
│               ├── AdminDashboard
│               ├── AdminProductList
│               └── ...
```

### Routing Structure

Frontend sử dụng **React Router v7** với nested routes:

**Customer Routes** (`/`):
- `/` - ProductList (trang chủ)
- `/products/:id` - ProductDetail
- `/cart` - CartPage
- `/account` - AccountPage

**Public Routes**:
- `/login` - LoginPage
- `/signup` - SignUp

**Checkout Flow**:
- `/payment` - PaymentPage
- `/order-success` - OrderSuccessPage

**Admin Routes** (`/admin`):
- `/admin/dashboard` - AdminDashboard
- `/admin/products` - AdminProductList
- `/admin/products/add` - AdminProductAdd
- `/admin/products/edit/:id` - AdminProductEdit
- `/admin/orders` - AdminOrderList
- `/admin/orders/:id` - AdminOrderDetail
- `/admin/customers` - AdminCustomerList
- `/admin/categories` - AdminCategoryList
- `/admin/staff` - AdminStaffList
- `/admin/promotions` - AdminPromotionList
- `/admin/promotions/add` - AdminPromotionAdd
- `/admin/promotions/edit/:id` - AdminPromotionEdit
- `/admin/rental-config` - AdminRentalConfig
- `/admin/chatbot-faq` - AdminChatbotFAQ

### State Management Approach

Frontend sử dụng **local state management** với React hooks:

1. **useState**: Cho local component state
2. **useEffect**: Cho side effects (API calls, subscriptions)
3. **localStorage**: Lưu token và user info
4. **Custom Events**: Để communicate giữa components (ví dụ: `cartUpdated` event)

**Không sử dụng**:
- Redux hoặc Context API cho global state (có thể thêm sau nếu cần)

### API Integration Pattern

1. **API Client Layer**: Tất cả API calls được tập trung trong thư mục `src/api/`
2. **Axios Instance**: Sử dụng `axiosClient` với baseURL và interceptors
3. **Request Interceptors**: Tự động thêm Authorization header từ localStorage
4. **Response Handling**: Xử lý errors và success responses

### Theme Configuration

MUI theme được cấu hình trong `src/theme.js`:

```javascript
const theme = createTheme({
  palette: {
    primary: {
      main: '#F4E9DB',  // Màu chủ đạo
    },
    secondary: {
      main: '#dc004e',
    },
    text: {
      primary: '#333333',
      secondary: '#555555',
    }
  },
  typography: {
    fontFamily: 'Montserrat, sans-serif',
    h4: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 500,
    },
  },
});
```

---

## Pages Documentation

### Customer Pages

#### ProductList.js
Trang danh sách sản phẩm (trang chủ).

**Chức năng**:
- Hiển thị danh sách sản phẩm dạng grid
- Pagination (9 sản phẩm/trang)
- Sidebar filters (Condition, Price Range, Size, Color)
- Category drawer navigation

**State**:
- `products`: Danh sách sản phẩm
- `page`: Trang hiện tại
- `openDrawer`: Trạng thái category drawer

**API Calls**:
- `fetchProductsAPI()`: Lấy danh sách sản phẩm

**Components sử dụng**:
- `ProductCard`: Hiển thị từng sản phẩm
- `CategoryDrawer`: Navigation drawer cho categories

**User Flow**:
1. User vào trang chủ → Load danh sách sản phẩm
2. User click vào category → Filter sản phẩm
3. User click vào sản phẩm → Navigate đến ProductDetail

#### ProductDetail.js
Trang chi tiết sản phẩm.

**Chức năng**:
- Hiển thị thông tin chi tiết sản phẩm
- Image gallery với thumbnail navigation
- Variant selection (Size, Color, Condition)
- Tab Buy/Rent
- Quantity selector
- Add to cart / Buy now
- Related products

**State**:
- `product`: Thông tin sản phẩm
- `relatedProducts`: Sản phẩm liên quan
- `quantity`: Số lượng
- `selectedTab`: Tab Buy (1) hoặc Rent (0)
- `selectedSize`, `selectedColor`: Variant đã chọn
- `selectedImage`: Index ảnh đang hiển thị
- `rentalStartDate`, `rentalEndDate`: Ngày thuê (nếu rent)

**API Calls**:
- `fetchProductDetailAPI(id)`: Lấy chi tiết sản phẩm
- `fetchProductsAPI()`: Lấy related products
- `addToCartAPI()`: Thêm vào giỏ hàng

**Components sử dụng**:
- `ProductCard`: Hiển thị related products
- MUI components: Tabs, Rating, Breadcrumbs

**User Flow**:
1. User click vào sản phẩm → Load chi tiết
2. User chọn variant → Update UI
3. User chọn Buy/Rent → Hiển thị form tương ứng
4. User click "Add to Cart" → Thêm vào giỏ → Dispatch `cartUpdated` event
5. User click "Buy Now" → Navigate đến PaymentPage

#### CartPage.js
Trang giỏ hàng.

**Chức năng**:
- Hiển thị items trong giỏ hàng
- Tách riêng "Items to Buy" và "Items to Rent"
- Update quantity
- Remove items
- Select all / Select individual items
- Order summary (subtotal, shipping, total)
- Proceed to checkout

**State**:
- `buyItems`: Danh sách items mua
- `rentItems`: Danh sách items thuê
- `selectedItems`: Items đã chọn

**API Calls**:
- `fetchCartAPI()`: Lấy giỏ hàng
- `updateCartItemAPI(itemId, data)`: Cập nhật quantity
- `deleteCartItemAPI(itemId)`: Xóa item

**Components sử dụng**:
- MUI: Paper, Checkbox, IconButton

**User Flow**:
1. User vào cart → Load giỏ hàng
2. User update quantity → Call API → Update UI
3. User remove item → Call API → Update UI
4. User click "Proceed to Checkout" → Navigate đến PaymentPage

#### LoginPage.js
Trang đăng nhập.

**Chức năng**:
- Form đăng nhập (identifier: email/phone, password)
- Remember me checkbox
- Link đến SignUp
- Xử lý authentication

**State**:
- `identifier`: Email hoặc số điện thoại
- `password`: Mật khẩu
- `rememberMe`: Checkbox state

**API Calls**:
- `loginAPI(credentials)`: Đăng nhập

**User Flow**:
1. User nhập thông tin → Click Login
2. Call API → Nhận token
3. Lưu token vào localStorage
4. Redirect đến trang chủ hoặc trang trước đó

#### SignUp.js
Trang đăng ký.

**Chức năng**:
- Form đăng ký (first name, last name, email, phone, password)
- Validation
- OTP verification flow

**State**:
- Form fields
- `showOTPForm`: Hiển thị form OTP sau khi submit

**API Calls**:
- `register(data)`: Đăng ký
- `verifyOTP()`: Xác thực OTP

#### AccountPage.js
Trang tài khoản (tabs).

**Chức năng**:
- Tab navigation
- Tích hợp các account components

**Tabs**:
- Account Info
- Addresses
- Order History
- Payment Settings

**Components sử dụng**:
- `AccountInfo`
- `AddressList`
- `OrderHistory`
- `PaymentSettings`

#### PaymentPage.js
Trang thanh toán.

**Chức năng**:
- Chọn địa chỉ giao hàng
- Chọn phương thức thanh toán (COD, Banking, Momo, VNPay)
- Nhập voucher code
- Order summary
- Submit order

**State**:
- `selectedAddress`: Địa chỉ đã chọn
- `paymentMethod`: Phương thức thanh toán
- `voucherCode`: Mã voucher
- `orderSummary`: Tổng kết đơn hàng

**API Calls**:
- `checkoutAPI(data)`: Thanh toán

**User Flow**:
1. Load địa chỉ và giỏ hàng
2. User chọn địa chỉ và payment method
3. User nhập voucher (optional)
4. User click "Place Order" → Call API
5. Success → Navigate đến OrderSuccessPage

#### OrderSuccessPage.js
Trang xác nhận đơn hàng.

**Chức năng**:
- Hiển thị thông tin đơn hàng đã đặt
- Order number
- Continue shopping button

### Admin Pages

#### AdminDashboard.js
Dashboard admin với thống kê và biểu đồ.

**Chức năng**:
- Summary cards (Total Revenue, Active Rentals, Total Customers, Overdue Returns)
- Revenue chart (Sales vs Rentals - 7 days)
- Inventory status pie chart
- Revenue reports tab (với date range picker)
- Top selling products table
- Top rented products table

**State**:
- `metrics`: Dashboard metrics
- `salesRentData`: Data cho revenue chart
- `inventoryData`: Data cho inventory chart
- `reportTab`: Tab hiện tại (0: Dashboard, 1: Reports)
- `reportStartDate`, `reportEndDate`: Date range cho reports
- `revenueReport`: Báo cáo doanh thu
- `topSelling`, `topRented`: Top products

**API Calls**:
- `getDashboardMetrics()`: Lấy metrics
- `getSalesVsRentRevenue()`: Lấy data cho chart
- `getInventoryStatus()`: Lấy inventory status
- `getRevenueReport(startDate, endDate)`: Báo cáo doanh thu
- `getTopSellingProducts()`: Top selling
- `getTopRentedProducts()`: Top rented

**Components sử dụng**:
- `DataTable`: Hiển thị top products
- Recharts: BarChart, PieChart

#### AdminProductList.js
Danh sách sản phẩm (admin).

**Chức năng**:
- Data table với pagination
- Search và filter
- Actions: Edit, Delete, View Reviews
- Status badges (Active/Inactive)

**State**:
- `products`: Danh sách sản phẩm
- `page`, `totalPages`: Pagination
- `search`: Từ khóa tìm kiếm
- `filters`: Bộ lọc

**API Calls**:
- `getAdminProducts(params)`: Lấy danh sách
- `deleteProduct(id)`: Xóa sản phẩm

**Components sử dụng**:
- `DataTable`
- `SearchFilterBar`
- `StatusBadge`

#### AdminProductAdd.js
Thêm sản phẩm mới.

**Chức năng**:
- Form nhập thông tin sản phẩm
- Upload images
- Chọn category/subcategory
- Nhập pricing và inventory
- Nhập specs (frame material, size, etc.)
- Rental configuration

**API Calls**:
- `createProduct(data)`: Tạo sản phẩm

#### AdminProductEdit.js
Sửa sản phẩm.

**Chức năng**:
- Tương tự AdminProductAdd nhưng load data sẵn
- Update thay vì create

**API Calls**:
- `getProductDetail(id)`: Lấy chi tiết
- `updateProduct(id, data)`: Cập nhật

#### AdminOrderList.js
Danh sách đơn hàng.

**Chức năng**:
- Data table với filter (type, status, date range)
- Quick view order details
- Status badges

**State**:
- `orders`: Danh sách đơn hàng
- `filters`: Bộ lọc

**API Calls**:
- `getAdminOrders(params)`: Lấy danh sách

#### AdminOrderDetail.js
Chi tiết đơn hàng.

**Chức năng**:
- Hiển thị thông tin đầy đủ đơn hàng
- Customer info
- Order items
- Order status workflow
- Actions: Confirm, Ship, Complete, Cancel
- Invoice generation

**State**:
- `order`: Thông tin đơn hàng
- `loading`: Loading state

**API Calls**:
- `getOrderDetail(id)`: Lấy chi tiết
- `updateOrderStatus(id, status)`: Cập nhật trạng thái
- `handleCancellationRequest()`: Xử lý yêu cầu hủy

**Components sử dụng**:
- `StatusBadge`
- `InvoiceModal`
- `PrepareForPickupModal` (cho rental)
- `CancellationRequestModal`

#### AdminCustomerList.js
Danh sách khách hàng.

**Chức năng**:
- Data table với search
- View customer detail
- View order history per customer
- Ban/Unban customer

**API Calls**:
- `getCustomers(params)`: Lấy danh sách
- `getCustomerDetail(id)`: Chi tiết
- `updateCustomerStatus(id, status)`: Cập nhật trạng thái

#### AdminCategoryList.js
Quản lý categories.

**Chức năng**:
- Hiển thị category hierarchy
- Add/Edit/Delete category
- Category modal

**Components sử dụng**:
- `CategoryModal`

#### AdminStaffList.js
Quản lý nhân viên.

**Chức năng**:
- Danh sách nhân viên
- Add/Edit/Delete staff
- Assign roles

#### AdminPromotionList.js
Danh sách promotion/voucher.

**Chức năng**:
- Data table
- Add/Edit/Delete promotion
- Status toggle

#### AdminPromotionAdd.js & AdminPromotionEdit.js
Thêm/sửa promotion.

**Chức năng**:
- Form nhập thông tin promotion
- Discount type (percentage/amount)
- Date range
- Target ranks
- Usage limits

#### AdminRentalConfig.js
Cấu hình hệ thống thuê.

**Chức năng**:
- Duration limits (min/max days)
- Deposit configuration
- Penalty configuration
- Rent-to-own settings

**API Calls**:
- `getRentalSettings()`: Lấy cấu hình
- `updateRentalSettings(data)`: Cập nhật

#### AdminChatbotFAQ.js
Quản lý FAQ cho chatbot.

**Chức năng**:
- Danh sách FAQ
- Add/Edit/Delete FAQ
- Keywords management

---

## Components Documentation

### Layout Components

#### Header.js
Header với navigation và cart icon.

**Props**: Không có props (sử dụng hooks để lấy state)

**State**:
- `cartItemCount`: Số lượng items trong giỏ
- `openDrawer`: Trạng thái category drawer

**Features**:
- Logo (link về trang chủ)
- Category drawer toggle (hamburger menu)
- Search bar
- Shopping cart icon với badge (số lượng items)
- User menu (nếu đã login)
- Login/Logout buttons

**API Calls**:
- `fetchCartAPI()`: Lấy số lượng items (nếu đã login)

**Events**:
- Listen `cartUpdated` event để update cart count

#### Footer.js
Footer với thông tin công ty và links.

**Props**: Không có

#### Layout.js
Layout wrapper cho customer routes.

**Props**: `children` (React Router Outlet)

**Features**:
- Wraps Header và Footer
- Outlet cho nested routes

#### AdminLayout.js
Layout cho admin routes.

**Props**: `children`

**Features**:
- Sidebar navigation
- Admin header
- Content area với Outlet

### Common Components

#### ProductCard.js
Card hiển thị sản phẩm.

**Props**:
- `product`: Object sản phẩm với các fields:
  - `ProductID`
  - `Name`
  - `ListPrice`
  - `ImageURL` (optional)

**Features**:
- Product image
- Product name (2 lines max)
- Rating display
- Price
- Sold count
- Link đến ProductDetail

**Styling**:
- Hover effect (lift up)
- Border và shadow

#### ProductFilters.js
Bộ lọc sản phẩm (có thể không được sử dụng trong version hiện tại).

#### CategoryDrawer.js
Drawer navigation cho categories.

**State**:
- `open`: Trạng thái mở/đóng
- `categories`: Danh sách categories

**Features**:
- Slide-in drawer từ trái
- Category hierarchy
- Click category → Filter products

#### CategoryList.js
Danh sách categories (có thể không được sử dụng).

#### AddressManager.js
Form quản lý địa chỉ (reusable).

**Props**:
- `address`: Address object (optional, cho edit mode)
- `onSubmit`: Callback khi submit
- `onCancel`: Callback khi cancel

**Fields**:
- Address line 1
- City
- Postal code
- Phone number
- Is default checkbox

### Account Components

#### AccountInfo.js
Thông tin tài khoản.

**Chức năng**:
- Hiển thị thông tin profile
- Form edit profile
- Change password

**API Calls**:
- `getProfile()`: Lấy profile
- `updateProfile(data)`: Cập nhật profile
- `changePassword(data)`: Đổi mật khẩu

#### AddressList.js
Danh sách địa chỉ.

**Chức năng**:
- Hiển thị danh sách địa chỉ
- Add/Edit/Delete address
- Set default address

**API Calls**:
- `getAddresses()`: Lấy danh sách
- `createAddress(data)`: Thêm địa chỉ
- `updateAddress(id, data)`: Cập nhật
- `deleteAddress(id)`: Xóa

**Components sử dụng**:
- `AddressManager`: Form add/edit

#### OrderHistory.js
Lịch sử đơn hàng.

**Chức năng**:
- Hiển thị danh sách đơn hàng
- Filter theo status
- Click vào order → View detail

**API Calls**:
- `fetchOrderHistoryAPI(customerId)`: Lấy lịch sử

**Components sử dụng**:
- `OrderDetail`: Modal hoặc page để xem chi tiết

#### OrderDetail.js
Chi tiết đơn hàng (cho customer).

**Chức năng**:
- Hiển thị thông tin đơn hàng
- Order items
- Status tracking
- Cancel order (nếu chưa shipped)

#### PaymentSettings.js
Cài đặt thanh toán.

**Chức năng**:
- Quản lý payment methods
- Saved cards (nếu có)

### Admin Components

#### DataTable.js
Bảng dữ liệu reusable.

**Props**:
- `columns`: Array of column definitions
  - `id`: Field name
  - `label`: Header label
  - `align`: 'left' | 'center' | 'right'
  - `render`: Custom render function (optional)
- `rows`: Array of data objects
- `page`: Current page (default: 1)
- `totalPages`: Total pages
- `onPageChange`: Callback khi đổi trang
- `onRowClick`: Callback khi click vào row
- `loading`: Loading state
- `emptyMessage`: Message khi không có data

**Features**:
- Pagination
- Row hover effect
- Clickable rows
- Loading state
- Empty state

#### SearchFilterBar.js
Thanh tìm kiếm và filter.

**Props**:
- `onSearch`: Callback khi search
- `filters`: Array of filter configs
- `onFilterChange`: Callback khi filter thay đổi

**Features**:
- Search input
- Filter dropdowns
- Date range picker (nếu cần)
- Clear filters button

#### StatusBadge.js
Badge hiển thị trạng thái.

**Props**:
- `status`: Status value
- `statusMap`: Object mapping status → { label, color }

**Features**:
- Color-coded badges
- Customizable colors

#### StatusToggle.js
Toggle switch cho status (Active/Inactive).

**Props**:
- `status`: Current status
- `onChange`: Callback khi thay đổi
- `confirmDialog`: Show confirmation dialog (optional)

**Features**:
- Toggle switch
- Confirmation dialog (nếu cần)

#### ConfirmDialog.js
Dialog xác nhận hành động.

**Props**:
- `open`: Open state
- `title`: Dialog title
- `message`: Dialog message
- `onConfirm`: Callback khi confirm
- `onCancel`: Callback khi cancel
- `confirmText`: Text của button confirm (default: "Confirm")
- `cancelText`: Text của button cancel (default: "Cancel")

**Features**:
- MUI Dialog
- Customizable buttons

#### Modals

**CategoryModal.js**:
- Form add/edit category
- Name input
- Submit/Cancel buttons

**ProductModal.js**:
- Form add/edit product (có thể không được sử dụng, thay bằng pages riêng)

**InvoiceModal.js**:
- Hiển thị invoice
- Print functionality

**PrepareForPickupModal.js**:
- Form chuẩn bị đơn thuê
- Asset assignment
- Photo upload

**CancellationRequestModal.js**:
- Form xử lý yêu cầu hủy
- Accept/Decline decision
- Reason input

---

## API Integration

### Axios Configuration

File `src/api/axiosClient.js` cấu hình Axios instance:

```javascript
const baseURL = process.env.REACT_APP_API_URL || `http://${window.location.hostname}:8000`;

const axiosClient = axios.create({
    baseURL: baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});
```

**Request Interceptor**:
- Tự động thêm Authorization header từ localStorage:
```javascript
axiosClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
});
```

### API Client Modules

#### authApi.js
```javascript
export const loginAPI = (credentials) => {
    return axiosClient.post('/auth/login', credentials);
};

export const register = (data) => {
    return axiosClient.post('/auth/register/', data);
};
```

#### productApi.js
```javascript
export const fetchProductsAPI = (params = {}) => {
    return axiosClient.get('/api/product/', { params });
};

export const fetchProductDetailAPI = (id) => {
    return axiosClient.get(`/api/product?ProductID=${id}`);
};

export const addToCartAPI = (data) => {
    return axiosClient.post('/api/cart/items/', data);
};
```

#### cartApi.js
```javascript
export const fetchCartAPI = () => {
    return axiosClient.get('/api/cart/');
};

export const updateCartItemAPI = (itemId, data) => {
    return axiosClient.put(`/api/cart/items/${itemId}/`, data);
};

export const deleteCartItemAPI = (itemId) => {
    return axiosClient.delete(`/api/cart/items/${itemId}/`);
};

export const checkoutAPI = (data) => {
    return axiosClient.post('/api/checkout', data);
};
```

#### orderApi.js
```javascript
export const placeOrderAPI = (data) => {
    return axiosClient.post('/api/checkout/', data);
};

export const fetchOrderHistoryAPI = (customerId) => {
    return axiosClient.get(`/api/proc/view-orders/`, {
        params: { customerid: customerId }
    });
};
```

#### userApi.js
```javascript
export const getProfile = () => {
    return axiosClient.get('/user/profile');
};

export const updateProfile = (data) => {
    return axiosClient.patch('/user/profile', data);
};

export const getAddresses = () => {
    return axiosClient.get('/user/addresses');
};

export const createAddress = (data) => {
    return axiosClient.post('/user/addresses', data);
};
```

#### adminApi.js
```javascript
export const getDashboardMetrics = async () => {
    return axiosClient.get('/admin/dashboard');
};

export const getAdminProducts = async (params = {}) => {
    return axiosClient.get('/admin/products', { params });
};

export const createProduct = (data) => {
    return axiosClient.post('/admin/products', data);
};
```

### Error Handling

Frontend xử lý errors trong các components:

```javascript
try {
    const response = await fetchProductsAPI();
    setProducts(response.data);
} catch (error) {
    console.error("Error fetching products:", error);
    // Show error message to user
    alert('Failed to load products');
}
```

**Có thể cải thiện**:
- Global error handler với toast notifications
- Retry logic cho failed requests
- Loading states

---

## Routing

### Route Definitions

File `src/App.js` định nghĩa tất cả routes:

```javascript
<Routes>
    {/* Customer Routes */}
    <Route path="/" element={<Layout />}>
        <Route index element={<ProductList />}/>
        <Route path="products/:id" element={<ProductDetail />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="/account" element={<AccountPage />} />
    </Route>

    {/* Public Routes */}
    <Route path="/login" element={<LoginPage />} />
    <Route path="/signup" element={<SignUp />} />
    <Route path="/payment" element={<PaymentPage />} />
    <Route path="/order-success" element={<OrderSuccessPage />} />

    {/* Admin Routes */}
    <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="products" element={<AdminProductList />} />
        {/* ... more admin routes */}
    </Route>
</Routes>
```

### Protected Routes

Hiện tại chưa có route guards. **Nên implement**:

```javascript
const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    if (!token) {
        return <Navigate to="/login" replace />;
    }
    return children;
};

const AdminRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    if (!token || user?.role !== 'admin') {
        return <Navigate to="/" replace />;
    }
    return children;
};
```

### Navigation Flow

**Customer Flow**:
1. Home → ProductList
2. Click product → ProductDetail
3. Add to cart → CartPage
4. Checkout → PaymentPage
5. Success → OrderSuccessPage

**Admin Flow**:
1. Login với admin account
2. Redirect đến `/admin/dashboard`
3. Navigate giữa các admin pages qua sidebar

---

## State Management

### Local State (useState)

Mỗi component quản lý state riêng:

```javascript
const [products, setProducts] = useState([]);
const [loading, setLoading] = useState(false);
const [page, setPage] = useState(1);
```

### Token Storage

Token được lưu trong `localStorage`:

```javascript
// Save token after login
localStorage.setItem('token', response.data.access_token);
localStorage.setItem('user', JSON.stringify({
    id: response.data.id,
    role: response.data.role,
    name: response.data.name
}));

// Get token
const token = localStorage.getItem('token');

// Remove token on logout
localStorage.removeItem('token');
localStorage.removeItem('user');
```

### Cart State Management

Cart state được quản lý qua:
1. **API calls**: Mỗi khi cần cart data, gọi API
2. **Custom Events**: Dispatch `cartUpdated` event khi cart thay đổi
3. **Header listens**: Header component listen event để update cart count

```javascript
// Dispatch event
window.dispatchEvent(new CustomEvent('cartUpdated'));

// Listen event
useEffect(() => {
    const handleCartUpdate = () => {
        updateCartCount();
    };
    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => {
        window.removeEventListener('cartUpdated', handleCartUpdate);
    };
}, []);
```

**Có thể cải thiện**:
- Context API cho cart state
- Redux cho global state (nếu app phức tạp hơn)

---

## Theme & Styling

### MUI Theme

Theme được cấu hình trong `src/theme.js` với:
- Primary color: `#F4E9DB` (beige)
- Secondary color: `#dc004e` (pink)
- Font: Montserrat
- Custom typography weights

### CSS Files

- `src/App.css`: Global styles
- `src/index.css`: Base styles
- Component-specific CSS: `ProductList.css`, `ProductDetail.css`, `CartPage.css`

### Responsive Design

Sử dụng MUI Grid system và breakpoints:

```javascript
<Grid container spacing={4}>
    <Grid item xs={12} md={8}>
        {/* Content */}
    </Grid>
    <Grid item xs={12} md={4}>
        {/* Sidebar */}
    </Grid>
</Grid>
```

**Breakpoints**:
- `xs`: Mobile (< 600px)
- `sm`: Tablet (≥ 600px)
- `md`: Desktop (≥ 900px)
- `lg`: Large desktop (≥ 1200px)

---

## Kết Luận

Frontend của hệ thống BikeGo E-commerce được xây dựng với React và Material-UI, cung cấp:

- **User-friendly interface** cho khách hàng
- **Comprehensive admin panel** cho quản trị viên
- **Responsive design** cho mọi thiết bị
- **Modular architecture** dễ maintain và extend

Hệ thống sử dụng local state management và API integration pattern rõ ràng, dễ hiểu và phát triển.
