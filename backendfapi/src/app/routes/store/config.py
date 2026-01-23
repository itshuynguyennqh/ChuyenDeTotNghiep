from pydantic import BaseModel, Field, ConfigDict, validator
from typing import List, Optional, Literal
from decimal import Decimal
from datetime import datetime
from app.helper import *

# --- SHARED ---
class ProductImageItem(BaseModel):
    id: int = Field(..., alias="image_id")
    url: str
    is_primary: bool
    caption: Optional[str] = None

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

# --- PRODUCT LISTING ---
class ProductCard(BaseModel):
    """Dùng cho Featured, Search, Similar"""
    id: int = Field(..., alias="product_id")
    name: str
    price: Decimal
    thumbnail: str
    rating: float = Field(0.0, alias="average_rating")
    sold_count: int = Field(0, alias="total_sold")
    
    # Các field optional cho filter
    condition: Optional[str] = None
    size: Optional[str] = None
    color: Optional[str] = None
    
    # Rental info
    rent_price: Optional[Decimal] = None
    is_rentable: Optional[bool] = False

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

# --- PRODUCT DETAIL ---
class VariantItem(BaseModel):
    product_id: int
    color: Optional[str]
    size: Optional[str]
    condition: str
    price: Decimal
    
    # Rental info cho biến thể
    is_rentable: bool = False
    rent_price: Optional[Decimal] = None

class ProductDetail(BaseModel):
    id: int = Field(..., alias="product_id")
    name: str
    price: Decimal
    thumbnail: Optional[str]
    description: Optional[str] = None
    
    images: List[ProductImageItem]
    variants: List[VariantItem]
    
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

class RentalInfo(BaseModel):
    is_rentable: bool = False
    rent_price: Optional[Decimal] = None
    rent_unit: str = "day" # day, week, month
    security_deposit: Decimal = Field(0, description="Tiền cọc")

class ProductSpecs(BaseModel):
    model: Optional[str] = Field(None, description="Mã model hoặc số hiệu sản phẩm")
    color: Optional[str] = None
    frame_material: Optional[str] = Field(None, alias="frame_material")
    frame_size: Optional[str] = Field(None, alias="frame_size")
    wheel_size: Optional[str] = Field(None, alias="wheel_size")
    suspension: Optional[str] = None

    model_config = ConfigDict(populate_by_name=True)

class ProductDetail(BaseModel):
    id: int = Field(..., alias="product_id")
    name: str
    price: Decimal
    thumbnail: Optional[str]
    description: Optional[str] = None
    
    images: List[ProductImageItem]
    variants: List[VariantItem]
    
    rental_info: RentalInfo
    specs: ProductSpecs # <--- Field mới thêm
    
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


# --- REVIEWS ---
class ReviewItem(BaseModel):
    username: str
    rate: int
    date: datetime
    comment: Optional[str]
    review_image: Optional[str]
    is_helpful: int

class ProductReviewsResponse(PagedResponse[ReviewItem]):
    product_id: int
    average_rating: float

class CartVariantInfo(BaseModel):
    color: Optional[str] = None
    size: Optional[str] = None
    condition: Optional[str] = None
    model_number: Optional[str] = None

# Thông tin chi tiết Item
class CartItemResponse(BaseModel):
    id: int = Field(..., alias="cart_item_id")
    product_id: int
    product_name: str
    thumbnail: str
    
    # Loại giao dịch: buy/rent
    transaction_type: Literal['buy', 'rent']
    rental_days: Optional[int] = None # Trả về số ngày thuê nếu có
    
    variant: CartVariantInfo
    
    quantity: int
    unit_price: Decimal # Giá gốc (Giá bán hoặc Giá thuê/ngày)
    subtotal: Decimal   # Tổng tiền item này
    
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

# Tổng quan giỏ hàng
class CartSummaryResponse(BaseModel):
    cart_id: int
    total_items: int
    total_buy_amount: Decimal = 0
    total_rent_amount: Decimal = 0
    discounted_buy_amount: Decimal = 0  # Tổng tiền mua sau khi giảm giá
    discounted_rent_amount: Decimal = 0  # Tổng tiền thuê sau khi giảm giá
    grand_total: Decimal = 0
    items: List[CartItemResponse]

# --- REQUEST ---

# Payload thêm vào giỏ
class CartAddRequest(BaseModel):
    product_id: int
    quantity: int = Field(..., gt=0)
    transaction_type: Literal['buy', 'rent'] = 'buy'
    rental_days: Optional[int] = Field(None, ge=1, description="Bắt buộc nếu type=rent")

    @validator('rental_days')
    def validate_rental_days(cls, v, values):
        if values.get('transaction_type') == 'rent' and not v:
            raise ValueError('Rental days required for rental items')
        return v

# Payload cập nhật (PATCH)
class CartUpdateRequest(BaseModel):
    quantity: Optional[int] = Field(None, gt=0)
    rental_days: Optional[int] = Field(None, ge=1, description="Chỉ update được cho item thuê")


class VoucherItem(BaseModel):
    id: int = Field(..., alias="voucher_id")
    code: str
    name: str
    scope: Literal['buy', 'rent', 'all'] # Phạm vi áp dụng
    
    # Logic hiển thị loại giảm giá
    discount_type: Literal['percentage', 'amount']
    discount_value: Decimal
    
    min_order_amount: Decimal
    start_date: datetime
    end_date: datetime
    target_rank: Optional[str] = None # Rank áp dụng (Diamond, Gold...)

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

class VoucherListResponse(BaseModel):
    items: List[VoucherItem]


# --- REQUEST ---
class CheckoutRequest(BaseModel):
    address_id: int
    payment_method: Literal['cod', 'banking', 'momo', 'vnpay']
    voucher_code: Optional[str] = None
    note: Optional[str] = None

# --- RESPONSE ---
class CheckoutResponse(BaseModel):
    message: str
    buy_order_id: Optional[int] = None
    buy_order_number: Optional[str] = None
    rent_order_id: Optional[int] = None
    rent_order_number: Optional[str] = None
    total_amount: Decimal