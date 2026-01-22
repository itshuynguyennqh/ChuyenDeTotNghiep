# Backend APIs (routes/)

This document lists all FastAPI endpoints found under `backendfapi/src/app/routes/**/apis.py`.

## Conventions / Notes

- **Full path** = `router.prefix` + decorator path.
- **Auth notes** are based on dependencies visible in the route module (some routes may rely on middleware not shown here).
- **Request model** is the typed body parameter in the handler (if any).
- **Response model** is taken from `response_model=...` on the decorator (if present).

---

## Authentication (`routes/auth/apis.py`)

Router: `auth_router = APIRouter(tags=["Authentication"])` (no prefix)

| Method | Path | Request | Response | Handler |
|---|---|---|---|---|
| POST | `/auth/login` | `LoginRequest` | `TokenResponse` | `login` |
| POST | `/auth/register` | `RegisterRequest` | (not declared) | `register` |
| POST | `/auth/verify_registration` | `VerifyOTPRequest` | (not declared) | `verify_registration` |
| POST | `/auth/forgot_password` | `ForgotPasswordRequest` | (not declared) | `forgot_password` |
| POST | `/auth/reset_password` | `ResetPasswordRequest` | (not declared) | `reset_password` |

---

## Chatbot (`routes/chatbot/apis.py`)

Router: `chatbot_router = APIRouter(prefix="/chatbot", tags=["Chatbot"])`

| Method | Path | Request | Response | Handler |
|---|---|---|---|---|
| POST | `/chatbot/message` | `ChatRequest` | `ChatResponse` | `chat_with_bot` |

---

## User (`routes/users/apis.py`)

Router: `users_router = APIRouter(prefix="/user", tags=["User"])`

Auth: uses `OAuth2PasswordBearer(tokenUrl="/auth/login")` and `get_current_user(...)` dependency (customer role).

| Method | Path | Request | Response | Handler |
|---|---|---|---|---|
| GET | `/user/profile` | (none) | `APIResponse[UserProfileResponse]` | `get_profile` |
| PATCH | `/user/profile` | `ProfileUpdate` | `APIResponse` | `update_profile` |
| GET | `/user/addresses` | (none) | `APIResponse[List[AddressResponse]]` | `get_addresses` |
| POST | `/user/addresses` | `AddressCreate` | `APIResponse[AddressResponse]` | `create_address` |
| PATCH | `/user/addresses/{address_id}` | `AddressUpdate` | `APIResponse` | `update_address` |
| DELETE | `/user/addresses/{address_id}` | (none) | `APIResponse` | `delete_address` |

---

## Store (`routes/store/apis.py`)

Router: `store_router = APIRouter(prefix="/store", tags=["Store"])`

Auth: the cart/checkout routes currently use a mock dependency `get_current_user_id()` returning a fixed user id (`21788`).

### Product

| Method | Path | Request | Response | Handler |
|---|---|---|---|---|
| GET | `/store/products/featured` | (none) | `APIResponse[List[ProductCard]]` | `get_featured_products` |
| GET | `/store/products/search` | (query) | `PagedResponse[ProductCard]` | `search_products` |
| GET | `/store/products/{product_id}/detail` | (none) | `APIResponse[ProductDetail]` | `get_product_detail` |
| GET | `/store/products/{product_id}/reviews` | (query: `page`, `limit`) | `ProductReviewsResponse` | `get_product_reviews` |
| GET | `/store/products/{product_id}/similar` | (none) | `APIResponse[List[ProductCard]]` | `get_similar_products` |

### Cart

| Method | Path | Request | Response | Handler |
|---|---|---|---|---|
| GET | `/store/cart` | (none) | `APIResponse[CartSummaryResponse]` | `get_my_cart` |
| POST | `/store/cart/items` | `CartAddRequest` | `APIResponse` | `add_to_cart` |
| PATCH | `/store/cart/items/{cart_item_id}` | `CartUpdateRequest` | `APIResponse` | `update_cart_item` |
| DELETE | `/store/cart/items/{cart_item_id}` | (none) | `APIResponse` | `remove_cart_item` |

### Vouchers / Checkout

| Method | Path | Request | Response | Handler |
|---|---|---|---|---|
| GET | `/store/vouchers` | (query: `scope`) | `APIResponse[list[VoucherItem]]` | `get_available_vouchers` |
| POST | `/store/order/checkout` | `CheckoutRequest` | `APIResponse[CheckoutResponse]` | `create_order` |

---

## Admin (`routes/admin/apis.py`)

Router: `admin_router = APIRouter(prefix="/admin", tags=["Admin"])`

Auth: no explicit auth dependency is visible in this module’s endpoint signatures (may be enforced elsewhere).

### Dashboard / Reports

| Method | Path | Request | Response | Handler |
|---|---|---|---|---|
| GET | `/admin/dashboard` | (none) | `APIResponse[DashboardData]` | `get_dashboard_stats` |
| GET | `/admin/reports` | (query: `start_date`, `end_date`, `page`, `limit`) | `APIResponse[ReportData]` | `get_reports` |

### Products

| Method | Path | Request | Response | Handler |
|---|---|---|---|---|
| GET | `/admin/products` | (query: `page`, `limit`, `search`) | `PagedResponse[ProductResponse]` | `get_products` |
| POST | `/admin/products` | `ProductCreateUpdate` | `APIResponse` | `create_product` |
| GET | `/admin/products/{product_id}` | (none) | `APIResponse[ProductDetailResponse]` | `get_product_detail` |
| PATCH | `/admin/products/{product_id}` | `ProductCreateUpdate` | `APIResponse` | `update_product` |
| DELETE | `/admin/products/{product_id}` | (none) | `APIResponse` | `delete_product` |

### Reviews

| Method | Path | Request | Response | Handler |
|---|---|---|---|---|
| GET | `/admin/reviews/{product_id}` | (query: `page`, `limit`, `filter_type`) | `APIResponse[ReviewsResponseData]` | `get_product_reviews` |

### Promotions

| Method | Path | Request | Response | Handler |
|---|---|---|---|---|
| GET | `/admin/promotions` | (query: `page`, `limit`) | `PagedResponse[PromotionResponse]` | `get_promotions` |
| POST | `/admin/promotions` | `PromotionCreate` | `APIResponse` | `create_promotion` |
| GET | `/admin/promotions/{promotion_id}` | (none) | `APIResponse[PromotionResponse]` | `get_promotion_detail` |
| PATCH | `/admin/promotions/{promotion_id}` | `PromotionUpdate` | `APIResponse` | `update_promotion` |
| DELETE | `/admin/promotions/{promotion_id}` | (none) | `APIResponse` | `delete_promotion` |

### Categories

| Method | Path | Request | Response | Handler |
|---|---|---|---|---|
| GET | `/admin/categories` | (query: `page`, `limit`, `search`) | `PagedResponse[CategoryResponse]` | `get_categories` |
| GET | `/admin/categories/{category_id}` | (none) | `APIResponse[CategoryResponse]` | `get_category_detail` |
| POST | `/admin/categories` | `CategoryCreate` | `APIResponse` | `create_category` |
| PATCH | `/admin/categories/{category_id}` | `CategoryUpdate` | `APIResponse` | `update_category` |
| DELETE | `/admin/categories/{category_id}` | (none) | `APIResponse` | `delete_category` |

### Customers

| Method | Path | Request | Response | Handler |
|---|---|---|---|---|
| GET | `/admin/customers` | (query: `page`, `limit`, `search`) | `PagedResponse[CustomerItem]` | `get_customers` |
| GET | `/admin/customers/{customer_id}` | (none) | `APIResponse[CustomerDetail]` | `get_customer_detail` |
| GET | `/admin/customers/{customer_id}/orders` | (query: `page`, `limit`, `type`) | `PagedResponse[OrderListItem]` | `get_customer_orders` |
| PATCH | `/admin/customers/{customer_id}` | `CustomerUpdate` | `APIResponse` | `update_customer` |

### Orders

| Method | Path | Request | Response | Handler |
|---|---|---|---|---|
| GET | `/admin/orders` | (query: `type`, `page`, `limit`, `search`) | `PagedResponse[OrderListItem]` | `get_orders` |
| GET | `/admin/orders/{order_id}` | (query: `type`) | `APIResponse[OrderDetailData]` | `get_order_detail` |
| PATCH | `/admin/orders/{order_id}/status` | `OrderStatusUpdate` (query: `type`) | `APIResponse` | `update_order_status` |
| POST | `/admin/orders/{order_id}/request-review` | `CancellationReview` (query: `type`) | `APIResponse` | `review_order_request` |
| POST | `/admin/orders/{order_id}/rental-preparation` | `RentalPreparation` | `APIResponse` | `prepare_rental_item` |

### Staff

| Method | Path | Request | Response | Handler |
|---|---|---|---|---|
| GET | `/admin/staffs` | (query: `page`, `limit`) | `PagedResponse[StaffResponse]` | `get_staffs` |
| POST | `/admin/staffs` | `StaffCreateRequest` | `APIResponse` | `create_staff` |
| GET | `/admin/staffs/{staff_id}` | (none) | `APIResponse[StaffResponse]` | `get_staff_detail` |
| PATCH | `/admin/staffs/{staff_id}` | `StaffUpdateRequest` | `APIResponse` | `update_staff` |
| DELETE | `/admin/staffs/{staff_id}` | (none) | `APIResponse` | `delete_staff` |

### Rental settings

| Method | Path | Request | Response | Handler |
|---|---|---|---|---|
| GET | `/admin/settings/rental` | (none) | `APIResponse[RentalSettingsData]` | `get_rental_settings` |
| PATCH | `/admin/settings/rental` | `RentalSettingsUpdate` | `APIResponse` | `update_rental_settings` |

### FAQs

| Method | Path | Request | Response | Handler |
|---|---|---|---|---|
| GET | `/admin/faqs` | (query: `page`, `limit`, `search`, `status`) | `PagedResponse[FAQResponse]` | `get_faqs` |
| POST | `/admin/faqs` | `FAQCreate` | `APIResponse` | `create_faq` |
| GET | `/admin/faqs/{faq_id}` | (none) | `APIResponse[FAQResponse]` | `get_faq_detail` |
| PATCH | `/admin/faqs/{faq_id}` | `FAQUpdate` | `APIResponse` | `update_faq` |
| DELETE | `/admin/faqs/{faq_id}` | (none) | `APIResponse` | `delete_faq` |

