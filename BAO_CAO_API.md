# Báo Cáo API Reference - BikeGo E-commerce System

## Mục Lục

1. [API Overview](#api-overview)
2. [Authentication](#authentication)
3. [API Endpoints Summary](#api-endpoints-summary)
4. [Request/Response Examples](#requestresponse-examples)
5. [Error Handling](#error-handling)

---

## API Overview

### Base URL

- **Development**: `http://localhost:8001`
- **Production**: (Tùy cấu hình)

### Authentication Method

Hệ thống sử dụng **JWT Bearer Token** authentication:

```
Authorization: Bearer <access_token>
```

Token được lấy từ endpoint `/auth/login` và có thời hạn **30 ngày**.

### Response Format

Tất cả API responses đều tuân theo format chuẩn:

**Success Response (Single Object)**:
```json
{
  "status": "success",
  "code": 200,
  "data": {
    // Response data
  },
  "message": "Optional message"
}
```

**Success Response (List with Pagination)**:
```json
{
  "status": "success",
  "code": 200,
  "data": [
    // Array of items
  ],
  "pagination": {
    "total_items": 100,
    "total_pages": 10,
    "current_page": 1,
    "limit": 12
  }
}
```

**Error Response**:
```json
{
  "detail": "Error message"
}
```

### Content Type

- **Request**: `application/json`
- **Response**: `application/json`

### API Documentation

Interactive API documentation có sẵn tại:
- **Swagger UI**: `http://localhost:8001/docs`
- **ReDoc**: `http://localhost:8001/redoc`

---

## Authentication

### POST `/auth/login`

Đăng nhập cho cả Customer và Employee.

**Request**:
```json
{
  "identifier": "user@example.com",
  "password": "password123"
}
```

**Response** (200 OK):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "role": "customer",
  "name": "Nguyễn Văn A",
  "id": 1
}
```

**Error Responses**:
- `401`: Thông tin đăng nhập không chính xác

**cURL Example**:
```bash
curl -X POST "http://localhost:8001/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "user@example.com",
    "password": "password123"
  }'
```

**JavaScript Example**:
```javascript
const response = await fetch('http://localhost:8001/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    identifier: 'user@example.com',
    password: 'password123'
  })
});

const data = await response.json();
localStorage.setItem('token', data.access_token);
```

### POST `/auth/register`

Đăng ký tài khoản khách hàng mới.

**Request**:
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
- Phone phải đúng định dạng Việt Nam: `(84|0[3|5|7|8|9])+([0-9]{8})\b`
- Password tối thiểu 6 ký tự

### POST `/auth/verify_registration`

Xác thực OTP đăng ký.

**Request**:
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

### POST `/auth/forgot_password`

Yêu cầu reset mật khẩu (gửi OTP qua email).

**Request**:
```json
{
  "email": "user@example.com"
}
```

### POST `/auth/reset_password`

Đặt lại mật khẩu với OTP.

**Request**:
```json
{
  "email": "user@example.com",
  "otp": "123456",
  "new_password": "newpassword123"
}
```

---

## API Endpoints Summary

### Auth Endpoints (`/auth`)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/auth/login` | No | Đăng nhập |
| POST | `/auth/register` | No | Đăng ký |
| POST | `/auth/verify_registration` | No | Xác thực OTP đăng ký |
| POST | `/auth/forgot_password` | No | Quên mật khẩu |
| POST | `/auth/reset_password` | No | Đặt lại mật khẩu |

### Store Endpoints (`/store`)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/store/products/featured` | No | Sản phẩm nổi bật |
| GET | `/store/products/search` | No | Tìm kiếm sản phẩm |
| GET | `/store/products/{product_id}/detail` | No | Chi tiết sản phẩm |
| GET | `/store/products/{product_id}/reviews` | No | Đánh giá sản phẩm |
| GET | `/store/products/{product_id}/similar` | No | Sản phẩm tương tự |
| GET | `/store/cart` | Yes | Lấy giỏ hàng |
| POST | `/store/cart/items` | Yes | Thêm vào giỏ hàng |
| PATCH | `/store/cart/items/{cart_item_id}` | Yes | Cập nhật giỏ hàng |
| DELETE | `/store/cart/items/{cart_item_id}` | Yes | Xóa khỏi giỏ hàng |
| GET | `/store/vouchers` | No | Danh sách voucher |
| POST | `/store/order/checkout` | Yes | Thanh toán đơn hàng |

### User Endpoints (`/user`)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/user/profile` | Yes | Lấy thông tin profile |
| PATCH | `/user/profile` | Yes | Cập nhật profile |
| GET | `/user/addresses` | Yes | Danh sách địa chỉ |
| POST | `/user/addresses` | Yes | Thêm địa chỉ |
| PATCH | `/user/addresses/{address_id}` | Yes | Cập nhật địa chỉ |
| DELETE | `/user/addresses/{address_id}` | Yes | Xóa địa chỉ |

### Admin Endpoints (`/admin`)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/admin/dashboard` | Yes (Admin) | Dashboard thống kê |
| GET | `/admin/reports` | Yes (Admin) | Báo cáo doanh thu |
| GET | `/admin/products` | Yes (Admin) | Danh sách sản phẩm |
| POST | `/admin/products` | Yes (Admin) | Tạo sản phẩm |
| GET | `/admin/products/{product_id}` | Yes (Admin) | Chi tiết sản phẩm |
| PATCH | `/admin/products/{product_id}` | Yes (Admin) | Cập nhật sản phẩm |
| DELETE | `/admin/products/{product_id}` | Yes (Admin) | Xóa sản phẩm |
| GET | `/admin/reviews/{product_id}` | Yes (Admin) | Đánh giá sản phẩm |
| GET | `/admin/promotions` | Yes (Admin) | Danh sách promotion |
| POST | `/admin/promotions` | Yes (Admin) | Tạo promotion |
| GET | `/admin/promotions/{promotion_id}` | Yes (Admin) | Chi tiết promotion |
| PATCH | `/admin/promotions/{promotion_id}` | Yes (Admin) | Cập nhật promotion |
| DELETE | `/admin/promotions/{promotion_id}` | Yes (Admin) | Xóa promotion |
| GET | `/admin/categories` | Yes (Admin) | Danh sách categories |
| POST | `/admin/categories` | Yes (Admin) | Tạo category |
| PATCH | `/admin/categories/{category_id}` | Yes (Admin) | Cập nhật category |
| DELETE | `/admin/categories/{category_id}` | Yes (Admin) | Xóa category |
| GET | `/admin/customers` | Yes (Admin) | Danh sách khách hàng |
| GET | `/admin/customers/{customer_id}` | Yes (Admin) | Chi tiết khách hàng |
| GET | `/admin/customers/{customer_id}/orders` | Yes (Admin) | Đơn hàng của khách hàng |
| PATCH | `/admin/customers/{customer_id}` | Yes (Admin) | Cập nhật khách hàng |
| GET | `/admin/orders` | Yes (Admin) | Danh sách đơn hàng |
| GET | `/admin/orders/{order_id}` | Yes (Admin) | Chi tiết đơn hàng |
| PATCH | `/admin/orders/{order_id}/status` | Yes (Admin) | Cập nhật trạng thái đơn hàng |
| POST | `/admin/orders/{order_id}/request-review` | Yes (Admin) | Xử lý yêu cầu hủy |
| POST | `/admin/orders/{order_id}/rental-preparation` | Yes (Admin) | Chuẩn bị đơn thuê |
| GET | `/admin/staffs` | Yes (Admin) | Danh sách nhân viên |
| POST | `/admin/staffs` | Yes (Admin) | Tạo nhân viên |
| GET | `/admin/staffs/{staff_id}` | Yes (Admin) | Chi tiết nhân viên |
| PATCH | `/admin/staffs/{staff_id}` | Yes (Admin) | Cập nhật nhân viên |
| DELETE | `/admin/staffs/{staff_id}` | Yes (Admin) | Xóa nhân viên |
| GET | `/admin/settings/rental` | Yes (Admin) | Cấu hình hệ thống thuê |
| PATCH | `/admin/settings/rental` | Yes (Admin) | Cập nhật cấu hình thuê |
| GET | `/admin/faqs` | Yes (Admin) | Danh sách FAQ |
| POST | `/admin/faqs` | Yes (Admin) | Tạo FAQ |
| GET | `/admin/faqs/{faq_id}` | Yes (Admin) | Chi tiết FAQ |
| PATCH | `/admin/faqs/{faq_id}` | Yes (Admin) | Cập nhật FAQ |
| DELETE | `/admin/faqs/{faq_id}` | Yes (Admin) | Xóa FAQ |

### Chatbot Endpoints (`/chatbot`)

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/chatbot/message` | No | Gửi tin nhắn chatbot |

---

## Request/Response Examples

### Use Case 1: Tìm kiếm và xem chi tiết sản phẩm

**Step 1: Tìm kiếm sản phẩm**

```bash
curl -X GET "http://localhost:8001/store/products/search?search=mountain&page=1&limit=12" \
  -H "Content-Type: application/json"
```

**Response**:
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
  ],
  "pagination": {
    "total_items": 50,
    "total_pages": 5,
    "current_page": 1,
    "limit": 12
  }
}
```

**Step 2: Xem chi tiết sản phẩm**

```bash
curl -X GET "http://localhost:8001/store/products/1/detail" \
  -H "Content-Type: application/json"
```

**Response**:
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "product_id": 1,
    "name": "Mountain Bike Pro",
    "price": 1500.00,
    "thumbnail": "https://example.com/image.jpg",
    "description": "High-quality mountain bike...",
    "images": [
      {
        "image_id": 1,
        "url": "https://example.com/image1.jpg",
        "is_primary": true
      }
    ],
    "variants": [
      {
        "product_id": 1,
        "color": "Red",
        "size": "M",
        "condition": "New",
        "price": 1500.00
      }
    ],
    "rental_info": {
      "is_rentable": true,
      "rent_price": 50.00,
      "rent_unit": "day",
      "security_deposit": 300.00
    },
    "specs": {
      "frame_material": "Aluminum",
      "frame_size": "M",
      "wheel_size": "26 inch"
    }
  }
}
```

### Use Case 2: Thêm vào giỏ hàng và checkout

**Step 1: Đăng nhập**

```bash
curl -X POST "http://localhost:8001/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "user@example.com",
    "password": "password123"
  }'
```

**Response**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "role": "customer",
  "name": "Nguyễn Văn A",
  "id": 1
}
```

**Step 2: Thêm vào giỏ hàng**

```bash
curl -X POST "http://localhost:8001/store/cart/items" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "product_id": 1,
    "quantity": 1,
    "transaction_type": "buy"
  }'
```

**Response**:
```json
{
  "status": "success",
  "code": 200,
  "message": "Đã thêm vào giỏ hàng"
}
```

**Step 3: Xem giỏ hàng**

```bash
curl -X GET "http://localhost:8001/store/cart" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response**:
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "cart_id": 1,
    "total_items": 1,
    "total_buy_amount": 1500.00,
    "total_rent_amount": 0.00,
    "grand_total": 1500.00,
    "items": [
      {
        "cart_item_id": 1,
        "product_id": 1,
        "product_name": "Mountain Bike Pro",
        "thumbnail": "https://example.com/image.jpg",
        "transaction_type": "buy",
        "quantity": 1,
        "unit_price": 1500.00,
        "subtotal": 1500.00
      }
    ]
  }
}
```

**Step 4: Checkout**

```bash
curl -X POST "http://localhost:8001/store/order/checkout" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "address_id": 1,
    "payment_method": "cod",
    "voucher_code": null,
    "note": "Giao hàng vào buổi sáng"
  }'
```

**Response**:
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "message": "Đặt hàng thành công",
    "buy_order_id": 1,
    "buy_order_number": "ORD-2024-001",
    "total_amount": 1500.00
  }
}
```

### Use Case 3: Admin quản lý sản phẩm

**Step 1: Lấy danh sách sản phẩm**

```bash
curl -X GET "http://localhost:8001/admin/products?page=1&limit=20" \
  -H "Authorization: Bearer <admin_token>"
```

**Step 2: Tạo sản phẩm mới**

```bash
curl -X POST "http://localhost:8001/admin/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin_token>" \
  -d '{
    "name": "New Product",
    "product_number": "NP-001",
    "subcategory_id": 1,
    "standard_cost": 1000.00,
    "list_price": 1500.00,
    "attributes": {
      "size": "M",
      "color": "Red",
      "condition": "New"
    },
    "safety_stock_level": 10,
    "reorder_point": 5,
    "stock_details": {
      "total_stock": 50
    },
    "rental_config": {
      "is_rentable": true,
      "security_deposit": 300.00
    },
    "rent_price": 50.00,
    "description": "Mô tả sản phẩm",
    "images": ["https://example.com/image1.jpg"]
  }'
```

**Step 3: Cập nhật sản phẩm**

```bash
curl -X PATCH "http://localhost:8001/admin/products/1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin_token>" \
  -d '{
    "list_price": 1600.00
  }'
```

### Use Case 4: Admin xem dashboard

```bash
curl -X GET "http://localhost:8001/admin/dashboard" \
  -H "Authorization: Bearer <admin_token>"
```

**Response**:
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
        "has_warning": true
      }
    },
    "revenue_chart": {
      "labels": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      "series": [
        {
          "name": "Sales",
          "data": [100000, 150000, 120000, 180000, 200000, 250000, 220000]
        },
        {
          "name": "Rentals",
          "data": [50000, 60000, 55000, 70000, 80000, 90000, 85000]
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
        }
      ]
    }
  }
}
```

### Use Case 5: Chatbot

```bash
curl -X POST "http://localhost:8001/chatbot/message" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Có những loại xe đạp nào?"
  }'
```

**Response**:
```json
{
  "response": "Chúng tôi có các loại xe đạp: Mountain Bike, Road Bike, City Bike...",
  "type": "text"
}
```

---

## Error Handling

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (Validation error) |
| 401 | Unauthorized (Invalid token hoặc chưa đăng nhập) |
| 403 | Forbidden (Không có quyền truy cập) |
| 404 | Not Found |
| 422 | Unprocessable Entity (Validation error) |
| 500 | Internal Server Error |

### Error Response Format

```json
{
  "detail": "Error message here"
}
```

**Ví dụ**:
```json
{
  "detail": "Email này đã được sử dụng"
}
```

### Common Error Scenarios

#### 1. Invalid Credentials (401)

```json
{
  "detail": "Thông tin đăng nhập hoặc mật khẩu không chính xác"
}
```

#### 2. Validation Error (400)

```json
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "value is not a valid email address",
      "type": "value_error.email"
    }
  ]
}
```

#### 3. Unauthorized (401)

```json
{
  "detail": "Could not validate credentials"
}
```

#### 4. Not Found (404)

```json
{
  "detail": "Product not found"
}
```

#### 5. Forbidden (403)

```json
{
  "detail": "You do not have permission to access this resource"
}
```

### Error Handling Best Practices

1. **Always check response status**: Kiểm tra `response.status` trước khi parse JSON
2. **Handle network errors**: Catch exceptions khi gọi API
3. **Show user-friendly messages**: Hiển thị thông báo lỗi dễ hiểu cho người dùng
4. **Log errors**: Log errors để debug

**JavaScript Example**:
```javascript
try {
  const response = await fetch('http://localhost:8001/store/products/search');
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'An error occurred');
  }
  
  const data = await response.json();
  // Handle success
} catch (error) {
  console.error('API Error:', error);
  // Show error message to user
  alert(error.message);
}
```

---

## Rate Limiting

Hiện tại chưa có rate limiting. **Nên implement**:
- Rate limiting cho login/register endpoints (ví dụ: 5 requests/minute)
- Rate limiting cho API calls chung (ví dụ: 100 requests/minute)

---

## API Versioning

Hiện tại chưa có versioning. **Nên implement**:
- Version trong URL: `/api/v1/...`
- Hoặc version trong header: `Accept: application/vnd.bikego.v1+json`

---

## Testing

### Swagger UI

Truy cập `http://localhost:8001/docs` để test API trực tiếp:
1. Click vào endpoint
2. Click "Try it out"
3. Nhập request body
4. Click "Execute"
5. Xem response

### Postman Collection

Có thể export Postman collection từ Swagger UI:
1. Vào Swagger UI
2. Click "Export" → "OpenAPI 3.0"
3. Import vào Postman

---

## Kết Luận

API của hệ thống BikeGo E-commerce cung cấp:

- **RESTful design**: Tuân thủ REST principles
- **Consistent response format**: Dễ xử lý ở frontend
- **Comprehensive endpoints**: Đầy đủ cho tất cả chức năng
- **Security**: JWT authentication và role-based access control
- **Documentation**: Swagger UI tự động generate từ code

API được thiết kế để dễ sử dụng và maintain, hỗ trợ tốt cho frontend React application.
