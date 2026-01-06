# Features and Changes Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture](#architecture)
4. [Frontend Features](#frontend-features)
5. [Backend Features](#backend-features)
6. [Database Models](#database-models)
7. [API Endpoints](#api-endpoints)
8. [Authentication & Authorization](#authentication--authorization)
9. [Key Features](#key-features)
10. [Admin Panel Features](#admin-panel-features)
11. [Recent Changes](#recent-changes)

---

## Project Overview

This is a full-stack e-commerce application for a bicycle shop (BikeGo) built with React frontend and Django REST Framework backend. The application supports both sales and rental operations, with comprehensive admin management capabilities.

---

## Technology Stack

### Frontend
- **React 19.2.0** - UI framework
- **Material-UI (MUI) 7.3.5** - Component library
- **React Router DOM 7.9.6** - Routing
- **Axios 1.13.2** - HTTP client
- **Recharts 2.12.7** - Data visualization
- **Date-fns 2.30.0** - Date manipulation
- **JSON Server** - Mock API server for development

### Backend
- **Django 5.2.7** - Web framework
- **Django REST Framework** - API framework
- **SQLite3** - Database (development)
- **SQL Server** - Production database (via stored procedures)
- **JWT Authentication** - Token-based auth
- **CORS Headers** - Cross-origin support
- **Django Filters** - Query filtering
- **drf-yasg** - API documentation

---

## Architecture

### Project Structure
```
ChuyenDeTotNghiep/
├── frontend/              # React application
│   ├── src/
│   │   ├── api/          # API client modules
│   │   ├── components/   # Reusable components
│   │   ├── pages/        # Page components
│   │   └── theme.js      # MUI theme configuration
│   └── server.js         # JSON Server mock API
└── ecommerce_backend/     # Django backend
    ├── store/            # Main app
    │   ├── models.py     # Database models
    │   ├── views.py      # API views
    │   ├── procedure_views.py  # Stored procedure views
    │   ├── serializers.py      # DRF serializers
    │   └── urls.py       # URL routing
    └── media/            # Uploaded files
```

---

## Frontend Features

### Customer-Facing Pages

#### 1. **Product List Page** (`ProductList.js`)
- Display all products with pagination
- Product filtering by category, price, and rating
- Search functionality
- Sort by price (low to high, high to low)
- Product cards with images, names, prices, and ratings
- Category navigation drawer

#### 2. **Product Detail Page** (`ProductDetail.js`)
- Detailed product information
- Product images gallery
- Product specifications
- Add to cart functionality
- Product reviews display
- Related products suggestions

#### 3. **Shopping Cart Page** (`CartPage.js`)
- View cart items
- Update quantities
- Remove items
- Calculate subtotal and total
- Proceed to checkout
- Guest cart support (session-based)

#### 4. **Authentication Pages**
- **Login Page** (`LoginPage.js`)
  - Email/password authentication
  - Support for customer and staff accounts
  - JWT token management
  - Remember me functionality
  
- **Sign Up Page** (`SignUp.js`)
  - User registration
  - Form validation
  - Account creation via stored procedure

#### 5. **Account Management** (`AccountPage.js`)
- **Account Information** (`AccountInfo.js`)
  - View and edit profile
  - Update email and phone
  - Change password
  
- **Address Management** (`AddressList.js`)
  - View saved addresses
  - Add new addresses
  - Edit existing addresses
  - Set default address
  
- **Order History** (`OrderHistory.js`)
  - View past orders
  - Order status tracking
  - Order details view
  
- **Payment Settings** (`PaymentSettings.js`)
  - Payment method management

#### 6. **Checkout & Payment**
- **Payment Page** (`PaymentPage.js`)
  - Shipping address selection
  - Payment method selection
  - Order summary
  - Voucher code application
  - Guest checkout support
  
- **Order Success Page** (`OrderSuccessPage.js`)
  - Order confirmation
  - Order number display
  - Continue shopping option

### Common Components

#### Layout Components
- **Header** (`Header.js`)
  - Navigation menu
  - Search bar
  - Shopping cart icon with item count
  - User account menu
  - Login/logout buttons
  
- **Footer** (`Footer.js`)
  - Company information
  - Links and contact details
  
- **Layout** (`Layout.js`)
  - Main layout wrapper
  - Header and footer integration

#### Product Components
- **ProductCard** (`ProductCard.js`)
  - Product display card
  - Image, name, price, rating
  - Quick add to cart
  
- **ProductFilters** (`ProductFilters.js`)
  - Category filter
  - Price sorting
  - Rating filter
  
- **CategoryDrawer** (`CategoryDrawer.js`)
  - Side navigation for categories
  - Category hierarchy display
  
- **CategoryList** (`CategoryList.js`)
  - Category navigation component

#### Utility Components
- **AddressManager** (`AddressManager.js`)
  - Reusable address form
  - Address validation

---

## Backend Features

### API Views

#### Product Management
- **ProductList** - List and create products
- **ProductDetail** - Retrieve, update, delete products
- **ProductSearchView** - Search products with filters
- **CategoryList** - List product categories
- **CategoryManageView** - Admin category management

#### Cart Management
- **CartDetailView** - Get current cart
- **AddCartItemView** - Add items to cart
  - Supports authenticated users (via stored procedure)
  - Supports guest users (session-based)
- **CartItemUpdateDeleteView** - Update/delete cart items

#### Order Management
- **CheckoutView** - Process orders
  - Creates customer profile for guests
  - Creates sales order
  - Handles order details
- **XemDanhSachDonView** - List orders
- **DatHangView** - Place order via stored procedure
- **HuyDonView** - Cancel order
- **ConfirmDonHangView** - Confirm order
- **HoanThanhDonHangView** - Complete order and update customer rank
- **CapNhatTrangThaiDonView** - Update order status

#### Customer Management
- **CurrentUserView** - Get current authenticated user
- **AddressViewSet** - CRUD operations for addresses
- **QuanLyTaiKhoanView** - Update customer profile

#### Review Management
- **KhachHangDanhGiaView** - Submit product review
- **XoaBinhLuanView** - Delete review

#### Admin Management
- **AdminUserListView** - List all users
- **VoucherManageView** - Manage vouchers
- **RevenueReportView** - Generate revenue reports

### Stored Procedures Integration

The backend integrates with SQL Server stored procedures for complex business logic:

1. **dbo.Dang_Ky_Tai_Khoan** - User registration
2. **dbo.Tao_Gio_Va_Them_San_Pham** - Create cart and add product
3. **dbo.Dat_Hang** - Place order
4. **dbo.Huy_Don** - Cancel order
5. **dbo.ConfirmDonHang** - Confirm order
6. **dbo.HoanThanhDonHang_UpdateRank** - Complete order and update customer ranking
7. **dbo.Cap_Nhat_Trang_Thai_Don** - Update order status
8. **dbo.Khach_Hang_Danh_Gia** - Customer review
9. **dbo.Quan_Ly_Tai_Khoan** - Manage account
10. **dbo.Sua_San_Pham** - Edit product
11. **dbo.Them_San_Pham** - Add product
12. **dbo.Xoa_San_Pham** - Delete product
13. **dbo.Xoa_Binh_Luan** - Delete comment

---

## Database Models

### Core Models

#### Customer Models
- **Customer** - Customer information
- **CustomerEmailAddress** - Customer email addresses
- **CustomerPhone** - Customer phone numbers
- **CustomerAdress** - Customer addresses
- **CustomerPassword** - Customer passwords
- **RankCustomer** - Customer ranking system (R-F-M analysis)

#### Product Models
- **Product** - Main product information
- **ProductCategory** - Product categories
- **ProductSubcategory** - Product subcategories
- **ProductDescription** - Product descriptions
- **ProductInventory** - Inventory tracking by location
- **ProductReview** - Product reviews and ratings

#### Order Models
- **SalesOrderHeader** - Order headers
- **SalesOrderDetail** - Order line items

#### Cart Models
- **Cart** - Shopping cart
  - Supports both authenticated and guest users
  - Session-based cart for guests
- **CartItem** - Cart items with quantity and pricing

#### Voucher Models
- **Voucher** - Discount vouchers
  - Percentage or fixed amount discounts
  - Date range validation
  - Minimum order amount
  - Usage quantity limits
- **VoucherUsage** - Voucher usage tracking

#### Employee Models
- **Employees** - Staff/employee information
  - Department and group management
  - Authentication support

#### Location Models
- **Location** - Warehouse/store locations
  - Inventory tracking by location

---

## API Endpoints

### Authentication
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login (JWT)
- `POST /api/auth/refresh/` - Refresh JWT token
- `GET /api/account/me/` - Get current user
- `POST /api/account/profile/` - Update profile

### Products
- `GET /api/products/` - List products
- `POST /api/products/` - Create product (admin)
- `GET /api/products/<id>/` - Product details
- `PUT /api/products/<id>/` - Update product (admin)
- `DELETE /api/products/<id>/` - Delete product (admin)
- `GET /api/products/search/` - Search products
- `POST /api/products/create/` - Create via stored procedure
- `POST /api/products/edit/` - Edit via stored procedure
- `POST /api/products/delete/` - Delete via stored procedure

### Categories
- `GET /api/categories/` - List categories
- `GET /api/categories/manage/` - List categories (admin)
- `POST /api/categories/manage/` - Create category (admin)
- `GET /api/categories/manage/<id>/` - Category details (admin)
- `PUT /api/categories/manage/<id>/` - Update category (admin)
- `DELETE /api/categories/manage/<id>/` - Delete category (admin)

### Cart
- `GET /api/cart/` - Get current cart
- `POST /api/cart/items/` - Add item to cart
- `GET /api/cart/items/<id>/` - Get cart item
- `PUT /api/cart/items/<id>/` - Update cart item
- `DELETE /api/cart/items/<id>/` - Remove cart item

### Orders
- `POST /api/checkout/` - Process checkout
- `GET /api/orders/` - List orders
- `POST /api/orders/place/` - Place order
- `POST /api/orders/cancel/` - Cancel order
- `POST /api/orders/confirm/` - Confirm order
- `POST /api/orders/complete/` - Complete order
- `POST /api/orders/status/` - Update order status

### Reviews
- `POST /api/reviews/` - Submit review
- `POST /api/reviews/delete/` - Delete review

### Addresses
- `GET /api/addresses/` - List addresses
- `POST /api/addresses/` - Create address
- `GET /api/addresses/<id>/` - Get address
- `PUT /api/addresses/<id>/` - Update address
- `DELETE /api/addresses/<id>/` - Delete address

### Admin
- `GET /api/admin/users/` - List users
- `GET /api/admin/vouchers/` - List vouchers
- `POST /api/admin/vouchers/` - Create voucher
- `GET /api/admin/vouchers/<id>/` - Get voucher
- `PUT /api/admin/vouchers/<id>/` - Update voucher
- `DELETE /api/admin/vouchers/<id>/` - Delete voucher
- `GET /api/admin/reports/revenue/` - Revenue report

---

## Authentication & Authorization

### Authentication Methods
1. **JWT Authentication** (Primary)
   - Access token lifetime: 60 minutes
   - Refresh token lifetime: 24 hours
   - Token refresh endpoint available

2. **Session Authentication** (Fallback)
   - Used for guest cart functionality
   - Session-based cart management

3. **Basic Authentication** (Development)

### User Roles
1. **Customer** - Regular users
   - Browse products
   - Add to cart
   - Place orders
   - Manage account
   - Write reviews

2. **Staff** - Store employees
   - **Order Staff** - Manage orders
   - **Product Staff** - Manage products
   - Access to admin panel based on role

3. **Admin** - Full access
   - All staff permissions
   - User management
   - System configuration
   - Reports and analytics

### Permission Classes
- `AllowAny` - Public access (products, categories, cart)
- `IsAuthenticated` - Requires login (account, orders)
- `IsAdminUser` - Admin only (management features)

---

## Key Features

### 1. Dual Cart System
- **Authenticated Users**: Cart linked to customer account, uses stored procedures
- **Guest Users**: Session-based cart, automatically converted on login

### 2. Guest Checkout
- Guests can checkout without registration
- System creates customer profile during checkout
- Email and address collection for order processing

### 3. Customer Ranking System
- RFM (Recency, Frequency, Monetary) analysis
- Automatic rank calculation
- Discount tiers based on customer rank
- Rank updates on order completion

### 4. Voucher System
- Percentage or fixed amount discounts
- Date range validation
- Minimum order amount requirements
- Usage quantity limits
- Per-customer usage tracking

### 5. Product Inventory Management
- Multi-location inventory tracking
- Stock level monitoring
- Reorder point alerts
- Safety stock levels

### 6. Order Status Workflow
- Pending → Confirmed → Preparing → Shipped → Completed
- Cancellation support
- Status update tracking

### 7. Product Reviews
- Rating system (1-5 stars)
- Written comments
- Reviewer information
- Review moderation (admin)

---

## Admin Panel Features

### Dashboard (`AdminDashboard.js`)
- **Key Metrics**
  - Total revenue with percentage change
  - Active rentals count
  - Total customers
  - Overdue returns alerts

- **Charts & Visualizations**
  - Sales vs Rental revenue comparison (bar chart)
  - Inventory status (pie chart)
  - Revenue reports by date range
  - Top selling products table
  - Top rented products table

- **Features**
  - Date range selection for reports
  - Export functionality
  - Real-time data refresh

### Product Management
- **Product List** (`AdminProductList.js`)
  - View all products in table format
  - Search and filter products
  - Status badges (Active/Inactive)
  - Quick actions (Edit, Delete, View Reviews)
  - Pagination

- **Add Product** (`AdminProductAdd.js`)
  - Product information form
  - Image upload
  - Category selection
  - Pricing and inventory
  - Product specifications

- **Edit Product** (`AdminProductEdit.js`)
  - Update product details
  - Modify images
  - Change pricing and inventory
  - Update status

- **Product Reviews Modal** (`ProductReviewsModal.js`)
  - View all reviews for a product
  - Review details and ratings
  - Delete reviews

### Order Management
- **Order List** (`AdminOrderList.js`)
  - View all orders
  - Filter by status, date, customer
  - Search functionality
  - Status badges
  - Quick view details

- **Order Detail** (`AdminOrderDetail.js`)
  - Complete order information
  - Customer details
  - Order items list
  - Status update workflow
  - Invoice generation
  - Cancellation handling

- **Order Status Management**
  - Confirm orders
  - Prepare for pickup
  - Mark as shipped
  - Complete orders
  - Cancel orders with reason

### Customer Management
- **Customer List** (`AdminCustomerList.js`)
  - View all customers
  - Search and filter
  - Customer details view
  - Order history per customer
  - Customer ranking display

- **Customer Detail** (`AdminCustomerDetail.js`)
  - Full customer profile
  - Contact information
  - Address list
  - Order history
  - Customer rank and discount

### Category Management
- **Category List** (`AdminCategoryList.js`)
  - View categories and subcategories
  - Add new categories
  - Edit categories
  - Delete categories
  - Category hierarchy display

### Staff Management
- **Staff List** (`AdminStaffList.js`)
  - View all staff members
  - Staff roles (Admin, Order Staff, Product Staff)
  - Department information
  - Add/Edit/Delete staff
  - Role assignment

### Promotion Management
- **Promotion List** (`AdminPromotionList.js`)
  - View all promotions/vouchers
  - Active/Inactive status
  - Date range display
  - Usage statistics

- **Add Promotion** (`AdminPromotionAdd.js`)
  - Create new vouchers
  - Set discount type and amount
  - Configure date range
  - Set minimum order amount
  - Set usage limits

- **Edit Promotion** (`AdminPromotionEdit.js`)
  - Update promotion details
  - Modify discount settings
  - Change status

### System Configuration
- **Rental Configuration** (`AdminRentalConfig.js`)
  - Configure rental settings
  - Pricing rules
  - Duration settings
  - Terms and conditions

- **Chatbot FAQ** (`AdminChatbotFAQ.js`)
  - Manage FAQ entries
  - Chatbot responses
  - Customer support automation

### Admin Components
- **DataTable** (`DataTable.js`)
  - Reusable data table component
  - Sorting, filtering, pagination
  - Action buttons
  - Status badges

- **SearchFilterBar** (`SearchFilterBar.js`)
  - Search input
  - Filter dropdowns
  - Date range picker
  - Clear filters

- **StatusBadge** (`StatusBadge.js`)
  - Color-coded status indicators
  - Customizable colors

- **StatusToggle** (`StatusToggle.js`)
  - Toggle active/inactive status
  - Confirmation dialogs

- **Modals**
  - **CategoryModal** - Add/Edit categories
  - **ProductModal** - Add/Edit products
  - **InvoiceModal** - View/Print invoices
  - **PrepareForPickupModal** - Order preparation
  - **CancellationRequestModal** - Handle cancellations

- **ConfirmDialog** (`ConfirmDialog.js`)
  - Reusable confirmation dialogs
  - Delete confirmations
  - Action confirmations

---

## Recent Changes

### Cart System Enhancement
- **Dual Cart Support**: Implemented separate cart logic for authenticated and guest users
- **Stored Procedure Integration**: Authenticated users now use `dbo.Tao_Gio_Va_Them_San_Pham` procedure
- **Session-Based Guest Cart**: Guest users use session keys for cart identification
- **Cart Migration**: Guest cart items can be migrated to user account on login

### Authentication Improvements
- **JWT Token Management**: Implemented proper JWT token storage and refresh
- **Role-Based Access**: Added role checking for staff and admin users
- **Guest Checkout**: Enabled checkout without registration

### Order Processing
- **Guest Order Creation**: System creates customer profiles for guest checkouts
- **Order Status Workflow**: Implemented complete order lifecycle management
- **Customer Rank Updates**: Automatic rank calculation on order completion

### Admin Panel
- **Dashboard Analytics**: Added comprehensive dashboard with charts and metrics
- **Data Tables**: Implemented reusable data table component with sorting and filtering
- **Modal System**: Created modal components for various admin operations
- **Status Management**: Added status badges and toggles throughout admin panel

### API Enhancements
- **Stored Procedure Views**: Created procedure_views.py for SQL Server procedure integration
- **Error Handling**: Improved error responses and validation
- **CORS Configuration**: Proper CORS setup for frontend-backend communication
- **Media Handling**: Image upload and serving configuration

### Frontend Improvements
- **Material-UI Integration**: Complete UI redesign using MUI components
- **Theme Configuration**: Custom theme with brand colors
- **Responsive Design**: Mobile-friendly layouts
- **Loading States**: Added loading indicators and skeleton screens
- **Error Handling**: User-friendly error messages

### Database Integration
- **Model Mapping**: Created Django models for existing SQL Server database
- **Composite Keys**: Support for composite primary keys
- **Managed Models**: Configured models to work with existing database schema

---

## Development Notes

### Running the Application

#### Frontend
```bash
cd frontend
npm install
npm start  # Runs both React app and JSON server
```

#### Backend
```bash
cd ecommerce_backend
python manage.py runserver
```

### Environment Setup
- Frontend runs on `http://localhost:3000`
- Backend API runs on `http://localhost:8000`
- JSON Server (mock API) runs on `http://localhost:3001`

### Database
- Development: SQLite3 (`db.sqlite3`)
- Production: SQL Server (via stored procedures)

### Media Files
- Product images stored in `ecommerce_backend/media/product_images/`
- Served at `/media/product_images/`

---

## Future Enhancements

### Planned Features
1. **Payment Gateway Integration**
   - Stripe/PayPal integration
   - Payment processing
   - Refund handling

2. **Email Notifications**
   - Order confirmations
   - Shipping notifications
   - Promotional emails

3. **Advanced Search**
   - Full-text search
   - Faceted search
   - Search suggestions

4. **Recommendation System**
   - Product recommendations
   - Related products
   - Personalized suggestions

5. **Inventory Alerts**
   - Low stock notifications
   - Reorder alerts
   - Inventory reports

6. **Analytics Dashboard**
   - Sales analytics
   - Customer analytics
   - Product performance
   - Revenue forecasting

7. **Mobile App**
   - React Native app
   - Push notifications
   - Mobile-optimized experience

---

## Conclusion

This e-commerce application provides a comprehensive solution for bicycle sales and rentals, with robust admin management capabilities, flexible cart system, and integration with existing SQL Server database through stored procedures. The application supports both authenticated and guest users, with role-based access control for staff and administrators.
