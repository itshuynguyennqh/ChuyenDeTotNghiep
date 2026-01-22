# API Documentation - Bike Go Backend

Tài liệu API đầy đủ cho hệ thống Bike Go E-commerce Backend. Tài liệu này giúp các agent và developer frontend tích hợp với backend một cách dễ dàng.

## Mục lục

1. [Tổng quan](#tổng-quan)
2. [Base URL & Authentication](#base-url--authentication)
3. [Response Format](#response-format)
4. [API Endpoints](#api-endpoints)
   - [Authentication](#authentication)
   - [Store](#store)
   - [User](#user)
   - [Admin](#admin)
   - [Chatbot](#chatbot)

---

## Tổng quan

- **Framework**: FastAPI
- **Base URL**: `http://localhost:8001` (Development)
- **API Version**: 1.0.0
- **Content-Type**: `application/json`

---

## Base URL & Authentication

### Base URL
```
http://localhost:8001
```

### Authentication

Hệ thống sử dụng **JWT Bearer Token** để xác thực.

#### Cách lấy token:
1. Gọi API `/auth/login` với thông tin đăng nhập
2. Nhận `access_token` từ response
3. Gửi token trong header của các request tiếp theo:

```
Authorization: Bearer <access_token>
```

#### Token Expiry
- Token có thời hạn: **30 ngày** (720 giờ)
- Sau khi hết hạn, cần đăng nhập lại

---

## Response Format

### Success Response

#### Single Object Response
```json
{
  "status": "success",
  "code": 200,
  "data": {
    // Dữ liệu trả về
  },
  "message": "Optional message"
}
```

#### Paginated Response
```json
{
  "status": "success",
  "code": 200,
  "data": [
    // Mảng dữ liệu
  ],
  "pagination": {
    "total_items": 100,
    "total_pages": 10,
    "current_page": 1,
    "limit": 10
  }
}
```

### Error Response
```json
{
  "detail": "Error message description"
}
```

#### Common HTTP Status Codes
- `200` - Success
- `400` - Bad Request (Validation error, Invalid input)
- `401` - Unauthorized (Missing or invalid token)
- `403` - Forbidden (Insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

## API Endpoints

## Authentication

Base path: `/auth`

### POST `/auth/login`

Đăng nhập cho cả Customer và Employee.

**Auth Required**: ❌ No

**Request Body**:
```json
{
  "identifier": "user@example.com",  // Email hoặc số điện thoại
  "password": "password123"
}
```

**Response** (`200 OK`):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "role": "customer",  // "customer" hoặc tên phòng ban của nhân viên
  "name": "Nguyễn Văn A",
  "id": 12345
}
```

**Error Responses**:
- `401`: Thông tin đăng nhập không chính xác

---

### POST `/auth/register`

Đăng ký tài khoản khách hàng mới. Hệ thống sẽ gửi OTP qua email.

**Auth Required**: ❌ No

**Request Body**:
```json
{
  "first_name": "Nguyễn",
  "last_name": "Văn A",
  "email": "user@example.com",
  "phone": "0123456789",  // Format: (84|0[3|5|7|8|9])+([0-9]{8})
  "password": "password123"
}
```

**Response** (`200 OK`):
```json
{
  "message": "Mã xác thực đã được gửi đến email. Vui lòng kiểm tra và nhập mã để hoàn tất.",
  "email": "user@example.com"
}
```

**Error Responses**:
- `400`: Email hoặc số điện thoại đã được sử dụng
- `400`: Số điện thoại không đúng định dạng Việt Nam

---

### POST `/auth/verify_registration`

Xác thực OTP đăng ký để hoàn tất việc tạo tài khoản.

**Auth Required**: ❌ No

**Request Body**:
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response** (`200 OK`):
```json
{
  "message": "Xác thực thành công! Tài khoản đã được tạo.",
  "customer_id": 12345
}
```

**Error Responses**:
- `400`: Mã OTP không chính xác hoặc đã hết hạn (5 phút)
- `400`: Yêu cầu đăng ký không tồn tại hoặc đã hết hạn

---

### POST `/auth/forgot_password`

Gửi OTP quên mật khẩu qua email.

**Auth Required**: ❌ No

**Request Body**:
```json
{
  "email": "user@example.com"
}
```

**Response** (`200 OK`):
```json
{
  "message": "Mã xác thực đã được gửi đến email của bạn."
}
```

**Error Responses**:
- `404`: Email này chưa được đăng ký tài khoản

---

### POST `/auth/reset_password`

Đặt lại mật khẩu mới sau khi xác thực OTP.

**Auth Required**: ❌ No

**Request Body**:
```json
{
  "email": "user@example.com",
  "otp": "123456",
  "new_password": "newpassword123"
}
```

**Response** (`200 OK`):
```json
{
  "message": "Đổi mật khẩu thành công. Bạn có thể đăng nhập ngay bây giờ."
}
```

**Error Responses**:
- `400`: Mã xác thực không chính xác hoặc đã được sử dụng
- `400`: Mã xác thực đã hết hạn (5 phút)
- `404`: Không tìm thấy tài khoản người dùng

---

## Store

Base path: `/store`

### GET `/store/products/featured`

Lấy danh sách sản phẩm nổi bật (top 4 sản phẩm bán chạy nhất).

**Auth Required**: ❌ No

**Response** (`200 OK`):
```json
{
  "status": "success",
  "code": 200,
  "data": [
    {
      "id": 1,
      "name": "Road-150 Red, 62",
      "price": 3578.27,
      "thumbnail": "https://example.com/image.jpg",
      "rating": 4.5,
      "sold_count": 150,
      "condition": "New",
      "size": "62",
      "color": "Red"
    }
  ]
}
```

---

### GET `/store/products/search`

Tìm kiếm và lọc sản phẩm với phân trang.

**Auth Required**: ❌ No

**Query Parameters**:
- `category_id` (optional, int): ID danh mục
- `condition` (optional, string): Tình trạng sản phẩm
- `price_range` (optional, string): Khoảng giá - `"under 1000"`, `"1000-2000"`, `"2000-3000"`, `"above 3000"`
- `size` (optional, array[string]): Kích thước (có thể gửi nhiều giá trị)
- `color` (optional, array[string]): Màu sắc (có thể gửi nhiều giá trị)
- `min_rating` (optional, float, 0-5): Đánh giá tối thiểu
- `search` (optional, string): Từ khóa tìm kiếm
- `page` (optional, int, default: 1): Trang hiện tại
- `limit` (optional, int, default: 12): Số lượng mỗi trang

**Response** (`200 OK`):
```json
{
  "status": "success",
  "code": 200,
  "data": [
    {
      "id": 1,
      "name": "Road-150 Red, 62",
      "price": 3578.27,
      "thumbnail": "https://example.com/image.jpg",
      "rating": 4.5,
      "sold_count": 150,
      "condition": "New",
      "size": "62",
      "color": "Red"
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

---

### GET `/store/products/{product_id}/detail`

Lấy thông tin chi tiết sản phẩm.

**Auth Required**: ❌ No

**Path Parameters**:
- `product_id` (int): ID sản phẩm

**Response** (`200 OK`):
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "id": 1,
    "name": "Road-150 Red, 62",
    "price": 3578.27,
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
        "size": "62",
        "condition": "New",
        "price": 3578.27,
        "is_rentable": true,
        "rent_price": 150.00
      }
    ],
    "rental_info": {
      "is_rentable": true,
      "rent_price": 150.00,
      "rent_unit": "day",
      "security_deposit": 2862.62
    },
    "specs": {
      "model": "BK-R50R-62",
      "color": "Red",
      "frame_material": "Aluminum",
      "frame_size": "62",
      "wheel_size": "700c",
      "suspension": "None"
    }
  }
}
```

**Error Responses**:
- `404`: Product not found

---

### GET `/store/products/{product_id}/reviews`

Lấy danh sách đánh giá sản phẩm với phân trang.

**Auth Required**: ❌ No

**Path Parameters**:
- `product_id` (int): ID sản phẩm

**Query Parameters**:
- `page` (optional, int, default: 1): Trang hiện tại
- `limit` (optional, int, default: 5): Số lượng review mỗi trang

**Response** (`200 OK`):
```json
{
  "status": "success",
  "code": 200,
  "data": [
    {
      "username": "Nguyễn Văn A",
      "rate": 5,
      "date": "2024-01-15T10:30:00",
      "comment": "Sản phẩm rất tốt!",
      "review_image": "https://example.com/review.jpg",
      "is_helpful": 10
    }
  ],
  "pagination": {
    "total_items": 25,
    "total_pages": 5,
    "current_page": 1,
    "limit": 5
  },
  "product_id": 1,
  "average_rating": 4.5
}
```

---

### GET `/store/products/{product_id}/similar`

Lấy danh sách sản phẩm tương tự (cùng danh mục).

**Auth Required**: ❌ No

**Path Parameters**:
- `product_id` (int): ID sản phẩm

**Response** (`200 OK`):
```json
{
  "status": "success",
  "code": 200,
  "data": [
    {
      "id": 2,
      "name": "Road-150 Blue, 62",
      "price": 3578.27,
      "thumbnail": "https://example.com/image2.jpg",
      "rating": 0,
      "sold_count": 0
    }
  ]
}
```

---

### GET `/store/cart`

Lấy thông tin giỏ hàng của người dùng hiện tại.

**Auth Required**: ✅ Yes

**Response** (`200 OK`):
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "cart_id": 1,
    "total_items": 3,
    "total_buy_amount": 5000.00,
    "total_rent_amount": 300.00,
    "grand_total": 5300.00,
    "items": [
      {
        "id": 1,
        "product_id": 1,
        "product_name": "Road-150 Red, 62",
        "thumbnail": "https://example.com/image.jpg",
        "transaction_type": "buy",
        "rental_days": null,
        "variant": {
          "color": "Red",
          "size": "62",
          "condition": "New",
          "model_number": "BK-R50R-62"
        },
        "quantity": 1,
        "unit_price": 5000.00,
        "subtotal": 5000.00
      },
      {
        "id": 2,
        "product_id": 2,
        "product_name": "Mountain-200 Silver, 38",
        "thumbnail": "https://example.com/image2.jpg",
        "transaction_type": "rent",
        "rental_days": 2,
        "variant": {
          "color": "Silver",
          "size": "38",
          "condition": "New",
          "model_number": "BK-M68S-38"
        },
        "quantity": 1,
        "unit_price": 150.00,
        "subtotal": 300.00
      }
    ]
  }
}
```

---

### POST `/store/cart/items`

Thêm sản phẩm vào giỏ hàng.

**Auth Required**: ✅ Yes

**Request Body**:
```json
{
  "product_id": 1,
  "quantity": 1,
  "transaction_type": "buy",  // "buy" hoặc "rent"
  "rental_days": 2  // Bắt buộc nếu transaction_type = "rent"
}
```

**Response** (`200 OK`):
```json
{
  "status": "success",
  "code": 200,
  "message": "Added to cart successfully"
}
```

**Error Responses**:
- `400`: Product not available for rent (khi cố gắng thuê sản phẩm không hỗ trợ thuê)
- `400`: Rental price not set
- `404`: Product not found

---

### PATCH `/store/cart/items/{cart_item_id}`

Cập nhật số lượng hoặc số ngày thuê của item trong giỏ hàng.

**Auth Required**: ✅ Yes

**Path Parameters**:
- `cart_item_id` (int): ID item trong giỏ hàng

**Request Body**:
```json
{
  "quantity": 2,  // optional
  "rental_days": 3  // optional, chỉ update được cho item thuê
}
```

**Response** (`200 OK`):
```json
{
  "status": "success",
  "code": 200,
  "message": "Cart item updated"
}
```

**Error Responses**:
- `400`: Cannot set rental days for buy items
- `404`: Cart item not found

---

### DELETE `/store/cart/items/{cart_item_id}`

Xóa item khỏi giỏ hàng.

**Auth Required**: ✅ Yes

**Path Parameters**:
- `cart_item_id` (int): ID item trong giỏ hàng

**Response** (`200 OK`):
```json
{
  "status": "success",
  "code": 200,
  "message": "Item removed from cart"
}
```

**Error Responses**:
- `404`: Cart item not found

---

### GET `/store/vouchers`

Lấy danh sách voucher khả dụng.

**Auth Required**: ❌ No

**Query Parameters**:
- `scope` (optional, string): Filter theo scope - `"buy"`, `"rent"`, hoặc `"all"`

**Response** (`200 OK`):
```json
{
  "status": "success",
  "code": 200,
  "data": [
    {
      "id": 1,
      "code": "SUMMER2024",
      "name": "Giảm giá mùa hè",
      "scope": "all",
      "discount_type": "percentage",
      "discount_value": 10.00,
      "min_order_amount": 1000.00,
      "start_date": "2024-06-01T00:00:00",
      "end_date": "2024-08-31T23:59:59",
      "target_rank": "Gold"
    }
  ]
}
```

---

### POST `/store/order/checkout`

Tạo đơn hàng từ giỏ hàng (checkout).

**Auth Required**: ✅ Yes

**Request Body**:
```json
{
  "address_id": 1,
  "payment_method": "cod",  // "cod", "banking", "momo", "vnpay"
  "voucher_code": "SUMMER2024",  // optional
  "note": "Giao hàng vào buổi sáng"  // optional
}
```

**Response** (`200 OK`):
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "message": "Order placed successfully",
    "buy_order_id": 100,
    "buy_order_number": "SO-20240115-ABCD",
    "rent_order_id": 50,
    "rent_order_number": "RN-20240115-EFGH",
    "total_amount": 5300.00
  }
}
```

**Error Responses**:
- `400`: Cart is empty
- `400`: Invalid address
- `400`: Invalid or expired voucher
- `400`: Order needs minimum {amount} (không đủ điều kiện voucher)

---

## User

Base path: `/user`

**Lưu ý**: Tất cả endpoints trong section này yêu cầu authentication với role `"customer"`.

### GET `/user/profile`

Lấy thông tin profile của người dùng hiện tại.

**Auth Required**: ✅ Yes (Customer)

**Response** (`200 OK`):
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "first_name": "Nguyễn",
    "last_name": "Văn A",
    "email": "user@example.com",
    "phone": "0123456789",
    "avatar_url": "https://example.com/avatar.jpg"
  }
}
```

---

### PATCH `/user/profile`

Cập nhật thông tin profile.

**Auth Required**: ✅ Yes (Customer)

**Request Body**:
```json
{
  "first_name": "Nguyễn",  // optional
  "last_name": "Văn A",  // optional
  "phone": "0987654321",  // optional
  "avatar_url": "https://example.com/new-avatar.jpg"  // optional
}
```

**Response** (`200 OK`):
```json
{
  "status": "success",
  "code": 200,
  "message": "Profile updated successfully"
}
```

---

### GET `/user/addresses`

Lấy danh sách địa chỉ của người dùng.

**Auth Required**: ✅ Yes (Customer)

**Response** (`200 OK`):
```json
{
  "status": "success",
  "code": 200,
  "data": [
    {
      "id": 1,
      "address_line1": "123 Đường ABC",
      "city": "Hà Nội",
      "postal_code": "100000",
      "phone_number": "0123456789",
      "is_default": true
    }
  ]
}
```

---

### POST `/user/addresses`

Thêm địa chỉ mới.

**Auth Required**: ✅ Yes (Customer)

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

**Response** (`200 OK`):
```json
{
  "status": "success",
  "code": 200,
  "message": "Address created successfully",
  "data": {
    "id": 1,
    "address_line1": "123 Đường ABC",
    "city": "Hà Nội",
    "postal_code": "100000",
    "phone_number": "0123456789",
    "is_default": false
  }
}
```

---

### PATCH `/user/addresses/{address_id}`

Cập nhật địa chỉ.

**Auth Required**: ✅ Yes (Customer)

**Path Parameters**:
- `address_id` (int): ID địa chỉ

**Request Body**:
```json
{
  "address_line1": "456 Đường XYZ",  // optional
  "city": "TP.HCM",  // optional
  "postal_code": "700000",  // optional
  "phone_number": "0987654321",  // optional
  "is_default": true  // optional
}
```

**Response** (`200 OK`):
```json
{
  "status": "success",
  "code": 200,
  "message": "Address updated successfully"
}
```

**Error Responses**:
- `404`: Address not found

---

### DELETE `/user/addresses/{address_id}`

Xóa địa chỉ.

**Auth Required**: ✅ Yes (Customer)

**Path Parameters**:
- `address_id` (int): ID địa chỉ

**Response** (`200 OK`):
```json
{
  "status": "success",
  "code": 200,
  "message": "Address deleted successfully"
}
```

**Error Responses**:
- `400`: Cannot delete default address. Please set another address as default first.
- `404`: Address not found

---

## Admin

Base path: `/admin`

**Lưu ý**: Tất cả endpoints trong section này yêu cầu authentication với role là Admin hoặc Employee.

### GET `/admin/dashboard`

Lấy thống kê tổng quan dashboard.

**Auth Required**: ✅ Yes (Admin)

**Response** (`200 OK`):
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
        "unit": "vehicles"
      },
      "total_customers": {
        "value": 500,
        "unit": "people"
      },
      "overdue_return": {
        "value": 3,
        "has_warning": true,
        "warning_message": "Late returns detected"
      }
    },
    "revenue_chart": {
      "labels": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      "series": [
        {
          "name": "Sales",
          "data": [10000, 15000, 12000, 18000, 20000, 25000, 22000]
        },
        {
          "name": "Rentals",
          "data": [5000, 6000, 5500, 7000, 8000, 9000, 8500]
        }
      ]
    },
    "inventory_status": {
      "total_items": 1000,
      "breakdown": [
        {
          "label": "Available",
          "percentage": 70.0,
          "value": 700,
          "status": "available"
        },
        {
          "label": "Renting",
          "percentage": 20.0,
          "value": 200,
          "status": "renting"
        },
        {
          "label": "Maintenance",
          "percentage": 10.0,
          "value": 100,
          "status": "maintenance"
        }
      ]
    }
  }
}
```

---

### GET `/admin/reports`

Lấy báo cáo doanh thu và sản phẩm bán/chơi thuê hàng đầu.

**Auth Required**: ✅ Yes (Admin)

**Query Parameters**:
- `start_date` (required, date): Ngày bắt đầu (YYYY-MM-DD)
- `end_date` (required, date): Ngày kết thúc (YYYY-MM-DD)
- `page` (optional, int, default: 1): Trang hiện tại cho danh sách top
- `limit` (optional, int, default: 5): Số lượng top sản phẩm

**Response** (`200 OK`):
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "revenue_report": {
      "total_revenue": 500000.00,
      "total_orders": 150,
      "avg_daily_revenue": 16666.67
    },
    "top_selling_products": [
      {
        "rank": 1,
        "product_id": 1,
        "product_number": "BK-R50R-62",
        "product_name": "Road-150 Red, 62",
        "category_name": "Road Bikes",
        "image_url": "https://example.com/image.jpg",
        "quantity_sold": 50,
        "revenue": 178913.50
      }
    ],
    "top_rented_products": [
      {
        "rank": 1,
        "product_id": 2,
        "product_number": "BK-M68S-38",
        "product_name": "Mountain-200 Silver, 38",
        "category_name": "Mountain Bikes",
        "image_url": "https://example.com/image2.jpg",
        "times_rented": 30,
        "revenue": 4500.00
      }
    ]
  }
}
```

---

### GET `/admin/products`

Lấy danh sách sản phẩm với phân trang và tìm kiếm.

**Auth Required**: ✅ Yes (Admin)

**Query Parameters**:
- `page` (optional, int, default: 1)
- `limit` (optional, int, default: 10)
- `search` (optional, string): Từ khóa tìm kiếm

**Response** (`200 OK`):
```json
{
  "status": "success",
  "code": 200,
  "data": [
    {
      "id": 1,
      "name": "Road-150 Red, 62",
      "product_number": "BK-R50R-62",
      "category_name": "Road Bikes",
      "image_url": "https://example.com/image.jpg",
      "prices": {
        "list_price": 3578.27,
        "rent_price": 150.00,
        "rent_unit": "day"
      },
      "stock": {
        "total_stock": 100,
        "maintenance_stock": 5,
        "available_stock": 90,
        "renting_stock": 5
      },
      "status_label": "In Stock"
    }
  ],
  "pagination": {
    "total_items": 50,
    "total_pages": 5,
    "current_page": 1,
    "limit": 10
  }
}
```

---

### POST `/admin/products`

Tạo sản phẩm mới.

**Auth Required**: ✅ Yes (Admin)

**Request Body**:
```json
{
  "name": "Road-150 Red, 62",
  "product_number": "BK-R50R-62",
  "subcategory_id": 1,
  "standard_cost": 2000.00,
  "list_price": 3578.27,
  "attributes": {
    "size": "62",
    "color": "Red",
    "condition": "New",
    "frame_material": "Aluminum",
    "wheel_size": "700c"
  },
  "rental_config": {
    "is_rentable": true,
    "security_deposit": 2862.62
  },
  "rent_price": 150.00,
  "safety_stock_level": 10,
  "reorder_point": 5,
  "stock_details": {
    "total_stock": 100,
    "maintenance_stock": 5
  },
  "images": [
    "https://example.com/image1.jpg",
    "https://example.com/image2.jpg"
  ],
  "description": "Mô tả sản phẩm..."
}
```

**Response** (`200 OK`):
```json
{
  "status": "success",
  "code": 200,
  "message": "Product created successfully"
}
```

---

### GET `/admin/products/{product_id}`

Lấy chi tiết sản phẩm.

**Auth Required**: ✅ Yes (Admin)

**Path Parameters**:
- `product_id` (int): ID sản phẩm

**Response**: Tương tự như POST `/admin/products` nhưng có thêm `images` array với `url` và `is_primary`.

---

### PATCH `/admin/products/{product_id}`

Cập nhật sản phẩm.

**Auth Required**: ✅ Yes (Admin)

**Path Parameters**:
- `product_id` (int): ID sản phẩm

**Request Body**: Tương tự như POST `/admin/products` (tất cả fields optional)

**Response** (`200 OK`):
```json
{
  "status": "success",
  "code": 200,
  "message": "Product updated successfully"
}
```

---

### DELETE `/admin/products/{product_id}`

Xóa sản phẩm (soft delete nếu có lịch sử giao dịch, hard delete nếu không).

**Auth Required**: ✅ Yes (Admin)

**Path Parameters**:
- `product_id` (int): ID sản phẩm

**Response** (`200 OK`):
```json
{
  "status": "success",
  "code": 200,
  "message": "Product permanently deleted"
}
```

Hoặc nếu có lịch sử:
```json
{
  "status": "success",
  "code": 200,
  "message": "Product has transaction history. It has been deactivated (Soft Deleted) instead of removed."
}
```

---

### GET `/admin/reviews/{product_id}`

Lấy đánh giá sản phẩm với filter và phân trang.

**Auth Required**: ✅ Yes (Admin)

**Path Parameters**:
- `product_id` (int): ID sản phẩm

**Query Parameters**:
- `page` (optional, int, default: 1)
- `limit` (optional, int, default: 5)
- `filter_type` (optional, string): `"all"`, `"highest"`, `"lowest"`, `"unanswered"`

**Response** (`200 OK`):
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "summary": {
      "product_id": 1,
      "product_name": "Road-150 Red, 62",
      "average_rating": 4.5,
      "total_reviews": 25,
      "rating_distribution": {
        "star_5": 15,
        "star_4": 7,
        "star_3": 2,
        "star_2": 1,
        "star_1": 0
      }
    },
    "reviews": [
      {
        "id": "REV-1",
        "user": {
          "id": "CUS-123",
          "username": "Nguyễn Văn A",
          "avatar_url": "https://example.com/avatar.jpg"
        },
        "rating": 5,
        "created_at": "2024-01-15T10:30:00",
        "content": "Sản phẩm rất tốt!",
        "images": ["https://example.com/review.jpg"],
        "admin_reply": {
          "replied_at": "2024-01-16T09:00:00",
          "content": "Cảm ơn bạn đã đánh giá!"
        },
        "permissions": {
          "can_reply": false
        }
      }
    ]
  }
}
```

---

### GET `/admin/promotions`

Lấy danh sách khuyến mãi với phân trang.

**Auth Required**: ✅ Yes (Admin)

**Query Parameters**:
- `page` (optional, int, default: 1)
- `limit` (optional, int, default: 10)

**Response** (`200 OK`):
```json
{
  "status": "success",
  "code": 200,
  "data": [
    {
      "id": 1,
      "name": "Giảm giá mùa hè",
      "code": "SUMMER2024",
      "scope": "all",
      "start_date": "2024-06-01T00:00:00",
      "end_date": "2024-08-31T23:59:59",
      "quantity": 100,
      "target_ranks": ["Gold", "Diamond"],
      "status": true,
      "discount_config": {
        "type": "percentage",
        "value": 10.00
      },
      "min_order_amount": 1000.00,
      "used_count": 25
    }
  ],
  "pagination": {
    "total_items": 10,
    "total_pages": 1,
    "current_page": 1,
    "limit": 10
  }
}
```

---

### POST `/admin/promotions`

Tạo khuyến mãi mới.

**Auth Required**: ✅ Yes (Admin)

**Request Body**:
```json
{
  "name": "Giảm giá mùa hè",
  "code": "SUMMER2024",
  "scope": "all",  // "buy", "rent", "all"
  "start_date": "2024-06-01T00:00:00",
  "end_date": "2024-08-31T23:59:59",
  "quantity": 100,
  "target_ranks": ["Gold", "Diamond"],
  "status": true,
  "discount_config": {
    "type": "percentage",  // "percentage" hoặc "amount"
    "value": 10.00
  },
  "min_order_amount": 1000.00
}
```

**Response** (`200 OK`):
```json
{
  "status": "success",
  "code": 200,
  "message": "Promotion Created"
}
```

---

### GET `/admin/promotions/{promotion_id}`

Lấy chi tiết khuyến mãi.

**Auth Required**: ✅ Yes (Admin)

**Path Parameters**:
- `promotion_id` (int): ID khuyến mãi

**Response**: Tương tự như item trong GET `/admin/promotions`

---

### PATCH `/admin/promotions/{promotion_id}`

Cập nhật khuyến mãi.

**Auth Required**: ✅ Yes (Admin)

**Path Parameters**:
- `promotion_id` (int): ID khuyến mãi

**Request Body**: Tương tự như POST `/admin/promotions` (tất cả fields optional)

**Response** (`200 OK`):
```json
{
  "status": "success",
  "code": 200,
  "message": "Promotion updated successfully"
}
```

---

### DELETE `/admin/promotions/{promotion_id}`

Xóa khuyến mãi (soft delete nếu đã được sử dụng).

**Auth Required**: ✅ Yes (Admin)

**Path Parameters**:
- `promotion_id` (int): ID khuyến mãi

**Response** (`200 OK`):
```json
{
  "status": "success",
  "code": 200,
  "message": "Promotion permanently deleted"
}
```

Hoặc nếu đã được sử dụng:
```json
{
  "status": "success",
  "code": 200,
  "message": "Promotion has usage history. It has been deactivated/expired instead of deleted."
}
```

---

### GET `/admin/categories`

Lấy danh sách danh mục với phân trang.

**Auth Required**: ✅ Yes (Admin)

**Query Parameters**:
- `page` (optional, int, default: 1)
- `limit` (optional, int, default: 10)
- `search` (optional, string)

**Response** (`200 OK`):
```json
{
  "status": "success",
  "code": 200,
  "data": [
    {
      "id": 1,
      "name": "Road Bikes",
      "product_count": 25
    }
  ],
  "pagination": {
    "total_items": 10,
    "total_pages": 1,
    "current_page": 1,
    "limit": 10
  }
}
```

---

### POST `/admin/categories`

Tạo danh mục mới.

**Auth Required**: ✅ Yes (Admin)

**Request Body**:
```json
{
  "name": "Road Bikes"
}
```

**Response** (`200 OK`):
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "id": 1
  },
  "message": "Category created successfully"
}
```

**Error Responses**:
- `400`: Category name already exists

---

### PATCH `/admin/categories/{category_id}`

Cập nhật danh mục.

**Auth Required**: ✅ Yes (Admin)

**Path Parameters**:
- `category_id` (int): ID danh mục

**Request Body**:
```json
{
  "name": "Road Bikes Updated"
}
```

**Response** (`200 OK`):
```json
{
  "status": "success",
  "code": 200,
  "message": "Category updated successfully"
}
```

---

### DELETE `/admin/categories/{category_id}`

Xóa danh mục.

**Auth Required**: ✅ Yes (Admin)

**Path Parameters**:
- `category_id` (int): ID danh mục

**Response** (`200 OK`):
```json
{
  "status": "success",
  "code": 200,
  "message": "Category deleted successfully"
}
```

**Error Responses**:
- `400`: Cannot delete category because it contains {count} products. Please move or delete products first.

---

### GET `/admin/customers`

Lấy danh sách khách hàng với phân trang.

**Auth Required**: ✅ Yes (Admin)

**Query Parameters**:
- `page` (optional, int, default: 1)
- `limit` (optional, int, default: 10)
- `search` (optional, string)

**Response** (`200 OK`):
```json
{
  "status": "success",
  "code": 200,
  "data": [
    {
      "id": 1,
      "full_name": "Nguyễn Văn A",
      "email": "user@example.com",
      "phone": "0123456789",
      "status": 1,
      "avatar_url": "https://example.com/avatar.jpg",
      "stats": null
    }
  ],
  "pagination": {
    "total_items": 100,
    "total_pages": 10,
    "current_page": 1,
    "limit": 10
  }
}
```

---

### GET `/admin/customers/{customer_id}`

Lấy chi tiết khách hàng.

**Auth Required**: ✅ Yes (Admin)

**Path Parameters**:
- `customer_id` (int): ID khách hàng

**Response** (`200 OK`):
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "id": 1,
    "full_name": "Nguyễn Văn A",
    "email": "user@example.com",
    "phone": "0123456789",
    "status": 1,
    "avatar_url": "https://example.com/avatar.jpg",
    "stats": {
      "total_orders": 10,
      "total_spent": 50000.00,
      "rank_name": "Gold",
      "current_score": 850.00
    },
    "address_list": ["123 Đường ABC, Hà Nội"],
    "recent_activity": []
  }
}
```

---

### GET `/admin/customers/{customer_id}/orders`

Lấy đơn hàng của khách hàng.

**Auth Required**: ✅ Yes (Admin)

**Path Parameters**:
- `customer_id` (int): ID khách hàng

**Query Parameters**:
- `page` (optional, int, default: 1)
- `limit` (optional, int, default: 10)
- `type` (optional, string): `"all"`, `"sale"`, `"rental"` (default: "all")

**Response** (`200 OK`):
```json
{
  "status": "success",
  "code": 200,
  "data": [
    {
      "id": "ORD-100",
      "db_id": 100,
      "type": "sale",
      "customer_name": "Nguyễn Văn A",
      "created_at": "2024-01-15T10:30:00",
      "status": "Shipped",
      "status_label": "Shipped",
      "total_amount": 5000.00
    }
  ],
  "pagination": {
    "total_items": 10,
    "total_pages": 1,
    "current_page": 1,
    "limit": 10
  }
}
```

---

### PATCH `/admin/customers/{customer_id}`

Cập nhật trạng thái khách hàng (active/banned).

**Auth Required**: ✅ Yes (Admin)

**Path Parameters**:
- `customer_id` (int): ID khách hàng

**Request Body**:
```json
{
  "status": "active"  // "active" hoặc "banned" (hoặc 1/0)
}
```

**Response** (`200 OK`):
```json
{
  "status": "success",
  "code": 200,
  "message": "Customer has been active"
}
```

---

### GET `/admin/orders`

Lấy danh sách đơn hàng (Sales & Rental) với phân trang.

**Auth Required**: ✅ Yes (Admin)

**Query Parameters**:
- `type` (optional, string): `"all"`, `"sale"`, `"rental"` (default: "all")
- `page` (optional, int, default: 1)
- `limit` (optional, int, default: 10)
- `search` (optional, string)

**Response**: Tương tự như GET `/admin/customers/{customer_id}/orders`

---

### GET `/admin/orders/{order_id}`

Lấy chi tiết đơn hàng.

**Auth Required**: ✅ Yes (Admin)

**Path Parameters**:
- `order_id` (int): ID đơn hàng

**Query Parameters**:
- `type` (required, string): `"sale"` hoặc `"rental"`

**Response** (`200 OK`):
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "id": "ORD-100",
    "type": "sale",
    "status": "Shipped",
    "created_at": "2024-01-15T10:30:00",
    "customer": {
      "id": 1,
      "name": "Nguyễn Văn A",
      "phone": "0123456789",
      "email": "user@example.com",
      "avatar": "https://example.com/avatar.jpg"
    },
    "items": [
      {
        "product_id": 1,
        "product_name": "Road-150 Red, 62",
        "product_image": "https://example.com/image.jpg",
        "quantity": 1,
        "unit_price": 5000.00,
        "total_line": 5000.00
      }
    ],
    "subtotal": 5000.00,
    "freight": 0,
    "tax_amt": 0,
    "total_due": 5000.00,
    "rental_start": null,
    "rental_end": null,
    "actions": {
      "can_cancel": true,
      "can_confirm": false,
      "can_ship": true,
      "can_complete": true
    }
  }
}
```

---

### PATCH `/admin/orders/{order_id}/status`

Cập nhật trạng thái đơn hàng.

**Auth Required**: ✅ Yes (Admin)

**Path Parameters**:
- `order_id` (int): ID đơn hàng

**Query Parameters**:
- `type` (required, string): `"sale"` hoặc `"rental"`

**Request Body**:
```json
{
  "status": "Shipped",  // "Pending", "Confirmed", "Shipped", "Delivered", "Cancelled", etc.
  "note": "Optional note"  // optional
}
```

**Response** (`200 OK`):
```json
{
  "status": "success",
  "code": 200,
  "message": "Order status updated to Shipped"
}
```

---

### POST `/admin/orders/{order_id}/request-review`

Duyệt yêu cầu hủy đơn hoặc trả xe.

**Auth Required**: ✅ Yes (Admin)

**Path Parameters**:
- `order_id` (int): ID đơn hàng

**Query Parameters**:
- `type` (required, string): `"sale"` hoặc `"rental"`

**Request Body**:
```json
{
  "decision": "accept",  // "accept" hoặc "decline"
  "reason": "Optional reason"  // optional
}
```

**Response** (`200 OK`):
```json
{
  "status": "success",
  "code": 200,
  "message": "Sales order request accepted"
}
```

---

### POST `/admin/orders/{order_id}/rental-preparation`

Chuẩn bị xe cho thuê (gán AssetID và mô tả tình trạng).

**Auth Required**: ✅ Yes (Admin)

**Path Parameters**:
- `order_id` (int): ID đơn thuê

**Request Body**:
```json
{
  "order_item_id": 1,
  "inventory_asset_id": "ASSET-001",
  "description": "Xe mới, tình trạng tốt",
  "evidence_photos": ["https://example.com/photo1.jpg"]  // optional
}
```

**Response** (`200 OK`):
```json
{
  "status": "success",
  "code": 200,
  "message": "Rental item prepared and assigned successfully"
}
```

**Error Responses**:
- `400`: Cannot update preparation details when order is '{status}'. Request must be Confirmed or Preparing.

---

### GET `/admin/staffs`

Lấy danh sách nhân viên với phân trang.

**Auth Required**: ✅ Yes (Admin)

**Query Parameters**:
- `page` (optional, int, default: 1)
- `limit` (optional, int, default: 10)

**Response** (`200 OK`):
```json
{
  "status": "success",
  "code": 200,
  "data": [
    {
      "id": 1,
      "full_name": "Trần Văn B",
      "email": "staff@example.com",
      "phone_number": "0987654321",
      "group_name": "Product Staff",
      "department": "Operations",
      "role": "product_staff",
      "role_label": "Product Staff",
      "status": "active",
      "status_label": "Active",
      "avatar_url": null
    }
  ],
  "pagination": {
    "total_items": 20,
    "total_pages": 2,
    "current_page": 1,
    "limit": 10
  }
}
```

---

### POST `/admin/staffs`

Tạo nhân viên mới.

**Auth Required**: ✅ Yes (Admin)

**Request Body**:
```json
{
  "full_name": "Trần Văn B",
  "email": "staff@example.com",
  "phone_number": "0987654321",
  "password": "password123",
  "role": "product_staff",  // "product_staff" hoặc "order_staff"
  "status": "active"  // "active" hoặc "inactive"
}
```

**Response** (`200 OK`):
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "id": 1
  },
  "message": "Staff created successfully"
}
```

---

### GET `/admin/staffs/{staff_id}`

Lấy chi tiết nhân viên.

**Auth Required**: ✅ Yes (Admin)

**Path Parameters**:
- `staff_id` (int): ID nhân viên

**Response**: Tương tự như item trong GET `/admin/staffs`

---

### PATCH `/admin/staffs/{staff_id}`

Cập nhật thông tin nhân viên.

**Auth Required**: ✅ Yes (Admin)

**Path Parameters**:
- `staff_id` (int): ID nhân viên

**Request Body**:
```json
{
  "full_name": "Trần Văn B Updated",  // optional
  "phone_number": "0987654321",  // optional
  "email": "newemail@example.com",  // optional
  "role": "order_staff",  // optional
  "status": "inactive",  // optional
  "password": "newpassword123"  // optional
}
```

**Response** (`200 OK`):
```json
{
  "status": "success",
  "code": 200,
  "message": "Staff updated successfully"
}
```

---

### DELETE `/admin/staffs/{staff_id}`

Xóa nhân viên.

**Auth Required**: ✅ Yes (Admin)

**Path Parameters**:
- `staff_id` (int): ID nhân viên

**Response** (`200 OK`):
```json
{
  "status": "success",
  "code": 200,
  "message": "Staff deleted successfully"
}
```

---

### GET `/admin/settings/rental`

Lấy cài đặt cho thuê.

**Auth Required**: ✅ Yes (Admin)

**Response** (`200 OK`):
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "duration_limits": {
      "min_days": 1,
      "max_days": 30
    },
    "deposit": {
      "default_rate": 80.0
    },
    "penalty": {
      "overdue_fee_rate": 150.0,
      "cancellation_policy": "flexible"
    },
    "rent_to_own": {
      "enabled": true,
      "rent_deduction": 100.0
    }
  }
}
```

---

### PATCH `/admin/settings/rental`

Cập nhật cài đặt cho thuê.

**Auth Required**: ✅ Yes (Admin)

**Request Body**:
```json
{
  "duration_limits": {
    "min_days": 1,
    "max_days": 30
  },  // optional
  "deposit": {
    "default_rate": 80.0
  },  // optional
  "penalty": {
    "overdue_fee_rate": 150.0,
    "cancellation_policy": "flexible"  // "flexible", "moderate", "strict"
  },  // optional
  "rent_to_own": {
    "enabled": true,
    "rent_deduction": 100.0
  }  // optional
}
```

**Response** (`200 OK`):
```json
{
  "status": "success",
  "code": 200,
  "message": "Rental configuration updated successfully"
}
```

---

### GET `/admin/faqs`

Lấy danh sách FAQ với phân trang.

**Auth Required**: ✅ Yes (Admin)

**Query Parameters**:
- `page` (optional, int, default: 1)
- `limit` (optional, int, default: 10)
- `search` (optional, string)
- `status` (optional, string): `"active"` hoặc `"inactive"`

**Response** (`200 OK`):
```json
{
  "status": "success",
  "code": 200,
  "data": [
    {
      "id": 1,
      "question": "Làm sao để thuê xe?",
      "answer": "Để thuê xe, bạn cần...",
      "answer_preview": "Để thuê xe, bạn cần...",
      "keywords": ["thuê xe", "rental", "hướng dẫn"],
      "status": "active",
      "status_label": "Active"
    }
  ],
  "pagination": {
    "total_items": 20,
    "total_pages": 2,
    "current_page": 1,
    "limit": 10
  }
}
```

---

### POST `/admin/faqs`

Tạo FAQ mới.

**Auth Required**: ✅ Yes (Admin)

**Request Body**:
```json
{
  "question": "Làm sao để thuê xe?",
  "answer": "Để thuê xe, bạn cần chọn sản phẩm có hỗ trợ thuê...",
  "keywords": ["thuê xe", "rental", "hướng dẫn"],
  "status": "active"  // "active" hoặc "inactive"
}
```

**Response** (`200 OK`):
```json
{
  "status": "success",
  "code": 200,
  "message": "FAQ created successfully"
}
```

---

### GET `/admin/faqs/{faq_id}`

Lấy chi tiết FAQ.

**Auth Required**: ✅ Yes (Admin)

**Path Parameters**:
- `faq_id` (int): ID FAQ

**Response**: Tương tự như item trong GET `/admin/faqs`

---

### PATCH `/admin/faqs/{faq_id}`

Cập nhật FAQ.

**Auth Required**: ✅ Yes (Admin)

**Path Parameters**:
- `faq_id` (int): ID FAQ

**Request Body**:
```json
{
  "question": "Updated question",  // optional
  "answer": "Updated answer",  // optional
  "keywords": ["new", "keywords"],  // optional
  "status": "inactive"  // optional
}
```

**Response** (`200 OK`):
```json
{
  "status": "success",
  "code": 200,
  "message": "FAQ updated successfully"
}
```

---

### DELETE `/admin/faqs/{faq_id}`

Xóa FAQ.

**Auth Required**: ✅ Yes (Admin)

**Path Parameters**:
- `faq_id` (int): ID FAQ

**Response** (`200 OK`):
```json
{
  "status": "success",
  "code": 200,
  "message": "FAQ deleted successfully"
}
```

---

## Chatbot

Base path: `/chatbot`

### POST `/chatbot/message`

Gửi tin nhắn đến chatbot và nhận phản hồi.

**Auth Required**: ❌ No

**Request Body**:
```json
{
  "message": "Xe Road-150 giá bao nhiêu?",
  "history": []  // optional: List các message trước đó để giữ context
}
```

**Response** (`200 OK`):
```json
{
  "response": "Xe Road-150 có giá 3,578,270 VND. Bạn có muốn xem thêm thông tin chi tiết không?",
  "action_type": "sql_query",  // "greeting", "sql_query", "policy", "irrelevant", "error"
  "sql_executed": "SELECT ProductID, Name, ListPrice FROM Product WHERE Name LIKE N'%Road-150%'"  // optional, chỉ có khi action_type = "sql_query"
}
```

**Các loại action_type**:
- `greeting`: Câu chào hỏi
- `sql_query`: Truy vấn dữ liệu từ database
- `policy`: Câu hỏi về chính sách/quy trình
- `irrelevant`: Câu hỏi không liên quan
- `error`: Lỗi xử lý

---

## Ghi chú quan trọng

### 1. Authentication Flow
- Đăng nhập qua `/auth/login` để lấy `access_token`
- Gửi token trong header: `Authorization: Bearer <token>`
- Token có thời hạn 30 ngày

### 2. Phân trang
- Tất cả endpoints trả về danh sách đều hỗ trợ phân trang
- Mặc định: `page=1`, `limit=10` (hoặc `limit=12` cho product search)
- Response luôn có `pagination` object với thông tin phân trang

### 3. Error Handling
- Luôn kiểm tra `status` code trong response
- `400`: Validation error hoặc business logic error
- `401`: Cần đăng nhập lại
- `404`: Resource not found
- `500`: Server error

### 4. Date/Time Format
- Tất cả datetime được trả về dạng ISO 8601: `"2024-01-15T10:30:00"`
- Date parameters: `YYYY-MM-DD`

### 5. Decimal/Number Format
- Giá tiền sử dụng `Decimal` type, trả về dạng số (không có dấu phẩy)
- Ví dụ: `3578.27` = 3,578.27 VND

### 6. Transaction Types
- `buy`: Mua hàng
- `rent`: Thuê xe

### 7. Order Status
- Sales: `"Pending"`, `"Confirmed"`, `"Shipped"`, `"Delivered"`, `"Cancelled"`, `"Cancel Requested"`
- Rental: `1` (Active), `2` (Completed), `3` (Overdue), `4` (Cancelled), hoặc string như `"Confirmed"`, `"Preparing"`, `"Returned"`, `"Return Requested"`

---

## Liên hệ & Hỗ trợ

Nếu có thắc mắc hoặc cần hỗ trợ về API, vui lòng liên hệ team backend.

**Version**: 1.0.0  
**Last Updated**: 2024-01-15
