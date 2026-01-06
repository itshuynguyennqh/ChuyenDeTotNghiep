# Staff Pages Implementation Guide

## Overview
This document outlines the staff pages implementation for the BikeGo e-commerce platform. All pages are built using React, Material-UI (MUI), and are fully responsive with easy backend integration.

## Project Structure

```
frontend/src/
├── components/
│   └── admin/
│       ├── AdminLayout.js          # Main layout with sidebar navigation
│       └── modals/
│           ├── CancellationRequestModal.js
│           ├── PrepareForPickupModal.js
│           ├── InvoiceModal.js
│           ├── CategoryModal.js
│           ├── ProductModal.js
│           └── ProductReviewsModal.js
├── pages/
│   └── admin/
│       ├── AdminDashboard.js
│       ├── AdminProductList.js      # Enhanced product management
│       ├── AdminOrderList.js        # Order list with tabs
│       ├── AdminOrderDetail.js      # Order detail page
│       └── AdminCategoryList.js     # Category management
└── api/
    └── staffApi.js                  # Staff-specific API functions
```

## Features Implemented

### 1. Admin Layout (`AdminLayout.js`)
- **Sidebar Navigation**: Full menu with all sections (Dashboard, Product, Sales, Category, Customer, Orders, Staff, Setting, Rental Config, Chatbot & FAQ)
- **Header**: Logo, page title, user info with logout
- **Footer**: Contact information
- **Responsive**: Sidebar collapses on mobile, header adapts

### 2. Order Management

#### Order List (`AdminOrderList.js`)
- **Tabs**: Purchase Orders and Rental Orders
- **Filters**: Status filter dropdown
- **Search**: Real-time search by order ID
- **Status Badges**: Color-coded status chips (Pending, Confirmed, Processing, etc.)
- **Pagination**: Page-based navigation
- **Responsive Table**: Adapts to screen size

#### Order Detail (`AdminOrderDetail.js`)
- **Order Header**: Order ID, status badge, placed date, invoice button
- **Status Update**: Dropdown to change order status
- **Information Cards**: 
  - Update Status card with action buttons
  - Customer card with contact info
  - Delivery/Rental Period card
- **Order Items Table**: Product details, quantities, prices
- **Order Summary**: Subtotal, shipping, discounts, grand total
- **Modals Integration**: Cancellation, Prepare for Pickup, Invoice

### 3. Product Management

#### Product List (`AdminProductList.js`)
- **Enhanced Table**: Image, name, price (sell/rent), rating, stock, status
- **Filters**: Status filter (All, In Stock, Low Stock, Out of Stock, Rented Out)
- **Search**: Product name search
- **Status Badges**: Color-coded inventory status
- **Stock Information**: Total, Available, Renting, Maintenance
- **Actions**: Edit and Delete buttons
- **Add Product Button**: Opens product modal

#### Product Modal (`ProductModal.js`)
- **Form Fields**:
  - Product Name, Category
  - Stock Quantity (Total, Available, Maintenance, Renting)
  - Size, Color, Condition
  - Selling Price, Status
  - Rental Toggle with Rental Price and Security Deposit
  - Description (textarea)
  - Product Images (upload with preview)
- **Validation**: Required fields validation
- **Edit Mode**: Pre-fills form with existing product data

### 4. Category Management

#### Category List (`AdminCategoryList.js`)
- **Search Bar**: Filter categories by name
- **Table**: Category name and actions
- **Actions**: Edit and Delete
- **Add Button**: Opens category modal
- **Pagination**: For large category lists

#### Category Modal (`CategoryModal.js`)
- **Add Mode**: Create new category
- **Edit Mode**: Update existing category
- **Simple Form**: Category name input
- **Validation**: Required field check

### 5. Modals

#### Cancellation Request Modal
- **Reason Display**: Shows customer cancellation reason
- **Warning Info**: Explains refund and stock restoration
- **Actions**: Accept or Decline cancellation

#### Prepare for Pickup Modal
- **Customer Info Banner**: Customer name, rental period, status
- **Bike Selection**: Dropdown to select bike item
- **Description**: Text area for condition notes
- **Photo Evidence**: File upload for pickup photos

#### Invoice Modal
- **Invoice Header**: Invoice number, issue date, due date
- **Status Badge**: Paid/Unpaid indicator
- **Customer Info**: Name, address, phone
- **Order Items Table**: Products with images, prices, quantities
- **Summary**: Subtotal, shipping, discount, grand total
- **Actions**: Download PDF, Print

#### Product Reviews Modal
- **Overall Rating**: Large star rating with review count
- **Filter Buttons**: All Review, Unanswered, Highest Rated
- **Review List**: 
  - User avatar and username
  - Star rating
  - Review text and date
  - Product images (if any)
  - Reply functionality

## API Integration

### Staff API (`staffApi.js`)

#### Order APIs
- `fetchOrdersAPI(params)` - Get orders with filters
- `fetchOrderDetailAPI(orderId)` - Get single order details
- `updateOrderStatusAPI(orderId, status)` - Update order status
- `cancelOrderAPI(orderId, reason)` - Cancel order
- `prepareForPickupAPI(orderId, data)` - Prepare for pickup
- `returnRequestAPI(orderId, data)` - Handle return request

#### Category APIs
- `fetchCategoriesAPI()` - Get all categories
- `createCategoryAPI(data)` - Create new category
- `updateCategoryAPI(id, data)` - Update category
- `deleteCategoryAPI(id)` - Delete category

#### Product APIs
- `fetchProductsWithFiltersAPI(params)` - Get products with filters
- `updateProductStatusAPI(id, status)` - Update product status

#### Invoice APIs
- `fetchInvoiceAPI(orderId)` - Get invoice data
- `downloadInvoicePDFAPI(orderId)` - Download PDF invoice

## Responsive Design

All components are responsive using MUI's Grid system and breakpoints:

- **Mobile (< 600px)**: 
  - Sidebar hidden/collapsible
  - Tables scroll horizontally
  - Cards stack vertically
  - Modals full-screen

- **Tablet (600px - 960px)**:
  - Sidebar visible
  - Tables adapt columns
  - Cards in 2 columns

- **Desktop (> 960px)**:
  - Full layout with sidebar
  - All features visible
  - Optimal spacing

## Status Colors

### Order Statuses
- **Pending**: Light yellow (#FEF9C3)
- **Confirmed**: Light blue (#DBEAFE)
- **Processing/Preparing/Renting**: Orange (#FED7AA)
- **Shipped**: Purple (#E9D5FF)
- **Delivered**: Green (#D1FAE5)
- **Inspecting**: Beige (#FEF3C7)
- **Overdue**: Red (#FEE2E2)
- **Cancelled**: Pink (#FCE7F3)

### Product Statuses
- **In Stock**: Green (#2e7d32)
- **Low Stock**: Orange (#ed6c02)
- **Out Of Stock**: Red (#d32f2f)
- **Rented Out**: Blue (#1976d2)

## Backend Integration Points

### Expected Backend Endpoints

1. **Orders**
   - `GET /api/proc/view-orders/` - List orders
   - `POST /api/proc/update-order-status/` - Update status
   - `POST /api/orders/cancel/` - Cancel order
   - `POST /api/orders/:id/prepare-pickup/` - Prepare pickup
   - `GET /api/orders/:id/invoice/` - Get invoice

2. **Categories**
   - `GET /api/categories/` - List categories
   - `POST /api/categories/` - Create category
   - `PUT /api/categories/:id/` - Update category
   - `DELETE /api/categories/:id/` - Delete category

3. **Products**
   - `GET /api/product/` - List products (with filters)
   - `POST /api/product/` - Create product
   - `PUT /api/product/:id/` - Update product
   - `DELETE /api/product/:id/` - Delete product

## Usage Examples

### Adding a New Order Status
1. Add status to `orderStatuses` array in `AdminOrderList.js`
2. Add color mapping in `getStatusColor()` function
3. Update backend to handle new status

### Adding a New Product Field
1. Add field to `formData` state in `ProductModal.js`
2. Add TextField/Select in form
3. Include in `handleSubmit` data object
4. Update backend model and API

### Customizing Colors
All colors are defined in component files. Main brand colors:
- Primary Orange: `#FE7E15`
- Primary Blue: `#1976d2`
- Background Beige: `#F4E9DB`

## Testing Checklist

- [ ] Order list loads and filters correctly
- [ ] Order detail shows all information
- [ ] Status updates work
- [ ] Modals open and close properly
- [ ] Product list displays correctly
- [ ] Product add/edit form works
- [ ] Category management functions
- [ ] Responsive design on mobile/tablet/desktop
- [ ] API calls handle errors gracefully
- [ ] Loading states display correctly

## Next Steps

1. **Backend Integration**: Connect all API endpoints to actual backend
2. **Authentication**: Add role-based access control
3. **Real-time Updates**: Add WebSocket for order status updates
4. **Export Features**: Add CSV/Excel export for orders and products
5. **Advanced Filters**: Add date range, customer filters
6. **Bulk Actions**: Add bulk status update, bulk delete
7. **Analytics**: Add charts and statistics to dashboard

## Notes

- All components use MUI's theming system
- API calls use axios with interceptors for auth tokens
- Error handling is implemented with try-catch blocks
- Loading states use CircularProgress component
- Form validation is client-side (add server-side validation)
- Image uploads need backend support for file storage
