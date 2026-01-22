# API Integration Summary

Tài liệu này tóm tắt việc tích hợp các API từ `API_DOCUMENTATION.md` vào frontend.

## ✅ Đã tích hợp đầy đủ

### 1. Authentication APIs (`/auth`)
**File**: `authApi.js`

- ✅ `POST /auth/login` - Đăng nhập
- ✅ `POST /auth/register` - Đăng ký
- ✅ `POST /auth/verify_registration` - Xác thực OTP đăng ký
- ✅ `POST /auth/forgot_password` - Gửi OTP quên mật khẩu
- ✅ `POST /auth/reset_password` - Đặt lại mật khẩu

**Lưu ý**: Đã sửa các endpoint từ kebab-case (`verify-registration`) sang snake_case (`verify_registration`) để khớp với documentation.

### 2. Store APIs (`/store`)
**File**: `storeApi.js`

#### Product APIs:
- ✅ `GET /store/products/featured` - Sản phẩm nổi bật
- ✅ `GET /store/products/search` - Tìm kiếm sản phẩm với filters
- ✅ `GET /store/products/{product_id}/detail` - Chi tiết sản phẩm
- ✅ `GET /store/products/{product_id}/reviews` - Đánh giá sản phẩm
- ✅ `GET /store/products/{product_id}/similar` - Sản phẩm tương tự

#### Cart APIs:
- ✅ `GET /store/cart` - Lấy giỏ hàng
- ✅ `POST /store/cart/items` - Thêm vào giỏ hàng
- ✅ `PATCH /store/cart/items/{cart_item_id}` - Cập nhật giỏ hàng
- ✅ `DELETE /store/cart/items/{cart_item_id}` - Xóa khỏi giỏ hàng

#### Voucher APIs:
- ✅ `GET /store/vouchers` - Danh sách voucher

#### Checkout APIs:
- ✅ `POST /store/order/checkout` - Thanh toán đơn hàng

### 3. User APIs (`/user`)
**File**: `userApi.js`

#### Profile APIs:
- ✅ `GET /user/profile` - Lấy thông tin profile
- ✅ `PATCH /user/profile` - Cập nhật profile

#### Address APIs:
- ✅ `GET /user/addresses` - Danh sách địa chỉ
- ✅ `POST /user/addresses` - Thêm địa chỉ
- ✅ `PATCH /user/addresses/{address_id}` - Cập nhật địa chỉ
- ✅ `DELETE /user/addresses/{address_id}` - Xóa địa chỉ

**Lưu ý**: Đã sửa các endpoint từ `/users/` sang `/user/` để khớp với documentation.

**Đã xóa**: Các API không có trong documentation:
- ❌ Wishlist APIs
- ❌ Notification APIs
- ❌ Settings APIs
- ❌ Logout API

### 4. Admin APIs (`/admin`)
**File**: `adminApi.js`

#### Dashboard:
- ✅ `GET /admin/dashboard` - Dashboard thống kê

#### Reports:
- ✅ `GET /admin/reports` - Báo cáo doanh thu

#### Product Management:
- ✅ `GET /admin/products` - Danh sách sản phẩm
- ✅ `POST /admin/products` - Tạo sản phẩm
- ✅ `GET /admin/products/{product_id}` - Chi tiết sản phẩm
- ✅ `PATCH /admin/products/{product_id}` - Cập nhật sản phẩm
- ✅ `DELETE /admin/products/{product_id}` - Xóa sản phẩm

#### Product Reviews:
- ✅ `GET /admin/reviews/{product_id}` - Đánh giá sản phẩm (admin view)

#### Order Management:
- ✅ `GET /admin/orders` - Danh sách đơn hàng
- ✅ `GET /admin/orders/{order_id}` - Chi tiết đơn hàng
- ✅ `PATCH /admin/orders/{order_id}/status` - Cập nhật trạng thái đơn hàng
- ✅ `POST /admin/orders/{order_id}/request-review` - Duyệt yêu cầu hủy/trả
- ✅ `POST /admin/orders/{order_id}/rental-preparation` - Chuẩn bị xe cho thuê

#### Customer Management:
- ✅ `GET /admin/customers` - Danh sách khách hàng
- ✅ `GET /admin/customers/{customer_id}` - Chi tiết khách hàng
- ✅ `GET /admin/customers/{customer_id}/orders` - Đơn hàng của khách hàng
- ✅ `PATCH /admin/customers/{customer_id}` - Cập nhật trạng thái khách hàng

#### Category Management:
- ✅ `GET /admin/categories` - Danh sách danh mục
- ✅ `POST /admin/categories` - Tạo danh mục
- ✅ `PATCH /admin/categories/{category_id}` - Cập nhật danh mục
- ✅ `DELETE /admin/categories/{category_id}` - Xóa danh mục

#### Staff Management:
- ✅ `GET /admin/staffs` - Danh sách nhân viên
- ✅ `POST /admin/staffs` - Tạo nhân viên
- ✅ `GET /admin/staffs/{staff_id}` - Chi tiết nhân viên
- ✅ `PATCH /admin/staffs/{staff_id}` - Cập nhật nhân viên
- ✅ `DELETE /admin/staffs/{staff_id}` - Xóa nhân viên

#### Promotion Management:
- ✅ `GET /admin/promotions` - Danh sách khuyến mãi
- ✅ `POST /admin/promotions` - Tạo khuyến mãi
- ✅ `GET /admin/promotions/{promotion_id}` - Chi tiết khuyến mãi
- ✅ `PATCH /admin/promotions/{promotion_id}` - Cập nhật khuyến mãi
- ✅ `DELETE /admin/promotions/{promotion_id}` - Xóa khuyến mãi

#### Rental Settings:
- ✅ `GET /admin/settings/rental` - Lấy cài đặt cho thuê
- ✅ `PATCH /admin/settings/rental` - Cập nhật cài đặt cho thuê

#### FAQ Management:
- ✅ `GET /admin/faqs` - Danh sách FAQ
- ✅ `POST /admin/faqs` - Tạo FAQ
- ✅ `GET /admin/faqs/{faq_id}` - Chi tiết FAQ
- ✅ `PATCH /admin/faqs/{faq_id}` - Cập nhật FAQ
- ✅ `DELETE /admin/faqs/{faq_id}` - Xóa FAQ

### 5. Chatbot APIs (`/chatbot`)
**File**: `chatbotApi.js` (MỚI)

- ✅ `POST /chatbot/message` - Gửi tin nhắn đến chatbot

## ⚠️ Legacy APIs (Deprecated)

Các file sau đây sử dụng legacy endpoints và đã được đánh dấu deprecated:

- `cartApi.js` - Sử dụng `/api/cart/` (legacy)
  - **Khuyến nghị**: Sử dụng `storeApi.js` thay thế
  
- `productApi.js` - Sử dụng `/api/product/` (legacy)
  - **Khuyến nghị**: Sử dụng `storeApi.js` (customer) hoặc `adminApi.js` (admin)
  
- `orderApi.js` - Sử dụng `/api/checkout/`, `/api/proc/view-orders/` (legacy)
  - **Khuyến nghị**: Sử dụng `storeApi.checkout()` cho checkout
  
- `staffApi.js` - Sử dụng `/api/proc/view-orders/` (legacy)
  - **Khuyến nghị**: Sử dụng `adminApi.js` cho tất cả admin/staff operations

## 📝 Cấu hình

### Base URL
**File**: `axiosClient.js`

- Base URL mặc định: `http://localhost:8001` (theo API documentation)
- Có thể override bằng biến môi trường `REACT_APP_API_URL`

### Authentication
- Token được tự động gắn vào header `Authorization: Bearer <token>`
- Token được lưu trong `localStorage` với key `token`

## 📦 Sử dụng

### Import từng module:
```javascript
import { loginAPI, register } from './api/authApi';
import { getCart, addToCart } from './api/storeApi';
import { getUserProfile } from './api/userApi';
import { getDashboardMetrics } from './api/adminApi';
import { sendChatbotMessage } from './api/chatbotApi';
```

### Import tất cả từ index:
```javascript
import {
    loginAPI,
    getCart,
    getUserProfile,
    getDashboardMetrics,
    sendChatbotMessage
} from './api';
```

## 🔄 Migration Guide

Nếu bạn đang sử dụng các legacy APIs, vui lòng migrate sang các API mới:

### Cart APIs:
```javascript
// Cũ (deprecated)
import { fetchCartAPI } from './api/cartApi';

// Mới
import { getCart } from './api/storeApi';
```

### Product APIs:
```javascript
// Cũ (deprecated)
import { fetchProductsAPI } from './api/productApi';

// Mới (customer)
import { searchProducts } from './api/storeApi';

// Mới (admin)
import { getAdminProducts } from './api/adminApi';
```

### User APIs:
```javascript
// Cũ
import { getUserProfile } from './api/userApi'; // Đang dùng /users/profile

// Mới (đã được sửa tự động)
import { getUserProfile } from './api/userApi'; // Bây giờ dùng /user/profile
```

## ✅ Checklist tích hợp

- [x] Authentication APIs - Đã tích hợp đầy đủ
- [x] Store APIs - Đã tích hợp đầy đủ
- [x] User APIs - Đã tích hợp đầy đủ và sửa endpoints
- [x] Admin APIs - Đã tích hợp đầy đủ
- [x] Chatbot APIs - Đã tạo mới
- [x] Axios Client - Đã cập nhật baseURL (port 8001)
- [x] Legacy APIs - Đã đánh dấu deprecated
- [x] Index file - Đã tạo để export tất cả APIs

## 📚 Tài liệu tham khảo

- API Documentation: `API_DOCUMENTATION.md`
- Base URL: `http://localhost:8001`
- API Version: 1.0.0
