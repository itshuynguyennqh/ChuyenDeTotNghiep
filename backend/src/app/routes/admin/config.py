from pydantic import BaseModel, Field, EmailStr, validator, ConfigDict
from typing import List, Optional, Union, Literal
from datetime import date, datetime
from decimal import Decimal
from app.helper import *

# ==========================================
# 2. DASHBOARD & REPORTS
# ==========================================

# --- Dashboard Component Schemas ---
class RevenueItem(BaseModel):
    value: Decimal
    currency: str = "VND"
    growth_percentage: float
    growth_direction: Literal['up', 'down', 'flat']

class CountItem(BaseModel):
    value: int
    unit: str

class OverdueItem(BaseModel):
    value: int
    has_warning: bool
    warning_message: Optional[str] = None

class DashboardSummary(BaseModel):
    total_revenue: RevenueItem
    active_rental: CountItem
    total_customers: CountItem
    overdue_return: OverdueItem

class ChartSeriesItem(BaseModel):
    name: str
    data: List[Decimal]

class DashboardChart(BaseModel):
    labels: List[str]
    series: List[ChartSeriesItem]

class InventoryStatus(BaseModel):
    total_items: int
    breakdown: List[dict] # { "label": str, "percentage": float, "value": int, "status": str }

class DashboardData(BaseModel):
    summary: DashboardSummary
    revenue_chart: DashboardChart
    inventory_status: InventoryStatus

# --- Report Component Schemas ---
class RevenueReportItem(BaseModel):
    total_revenue: Decimal
    total_orders: int
    avg_daily_revenue: Decimal

class TopProductItem(BaseModel):
    rank: int
    product_id: int
    product_number: str
    product_name: str
    category_name: str
    image_url: Optional[str] = None
    quantity_sold: Optional[int] = 0 # Dùng cho top selling
    times_rented: Optional[int] = 0  # Dùng cho top renting
    revenue: Decimal

class ReportData(BaseModel):
    revenue_report: RevenueReportItem
    top_selling_products: List[TopProductItem]
    top_rented_products: List[TopProductItem]


# ==========================================
# 3. CATEGORIES
# ==========================================

class CategoryBase(BaseModel):
    name: str

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(BaseModel):
    name: str

class CategoryResponse(CategoryBase):
    id: int 
    product_count: Optional[int] = 0
    
    model_config = ConfigDict(from_attributes=True)


# ==========================================
# 4. PRODUCTS & REVIEWS
# ==========================================

# --- Sub-schemas ---
class StockDetails(BaseModel):
    total_stock: int
    maintenance_stock: int = 0
    available_stock: Optional[int] = None # Read-only
    renting_stock: Optional[int] = None   # Read-only

class ProductPrices(BaseModel):
    list_price: Decimal 
    rent_price: Optional[Decimal] = None
    currency: str = "VND"
    rent_unit: str = "day"

class ProductAttributes(BaseModel):
    size: Optional[str] = None
    color: Optional[str] = None
    frame_material: Optional[str] = None
    wheel_size: Optional[str] = None
    condition: str = "New"

class RentalConfigInfo(BaseModel):
    is_rentable: bool
    security_deposit: Decimal = 0

# --- Main Product Schemas ---
class ProductCreateUpdate(BaseModel):
    name: str
    product_number: str
    subcategory_id: int
    
    # Pricing
    standard_cost: Decimal
    list_price: Decimal
    
    # Specs
    attributes: ProductAttributes
    
    # Inventory
    safety_stock_level: int
    reorder_point: int
    stock_details: StockDetails
    
    # Rental
    rental_config: RentalConfigInfo
    rent_price: Optional[Decimal] = None
    
    description: Optional[str] = None
    images: List[str] 

class ProductResponse(BaseModel):
    id: int
    name: str
    product_number: str
    category_name: str
    image_url: Optional[str] = None
    
    prices: ProductPrices
    stock: StockDetails
    status_label: str
    
    model_config = ConfigDict(from_attributes=True)

class ProductDetailResponse(ProductResponse):
    description: Optional[str]
    images: List[ImageItem]
    attributes: ProductAttributes
    rental_config: RentalConfigInfo

# --- Review Schemas ---
class RatingDistribution(BaseModel):
    star_5: int = Field(0, alias="5_star")
    star_4: int = Field(0, alias="4_star")
    star_3: int = Field(0, alias="3_star")
    star_2: int = Field(0, alias="2_star")
    star_1: int = Field(0, alias="1_star")

class ReviewSummary(BaseModel):
    product_id: int
    product_name: str
    average_rating: float
    total_reviews: int
    rating_distribution: RatingDistribution

class ReviewUser(BaseModel):
    id: str
    username: str
    avatar_url: Optional[str] = None

class AdminReplyData(BaseModel):
    replied_at: datetime
    content: str

class ReplyPermissions(BaseModel):
    can_reply: bool

class ReviewItem(BaseModel):
    id: str
    user: ReviewUser
    rating: int
    created_at: datetime
    content: Optional[str]
    images: List[str]
    admin_reply: Optional[AdminReplyData] = None
    permissions: ReplyPermissions

class ReviewsResponseData(BaseModel):
    summary: ReviewSummary
    reviews: List[ReviewItem]


# ==========================================
# 5. ORDERS (Unified Sales & Rental)
# ==========================================

class OrderListItem(BaseModel):
    id: str # Format: "ORD-123"
    db_id: int 
    type: Literal['sale', 'rental']
    customer_name: str
    created_at: datetime
    status: str 
    status_label: str
    total_amount: Decimal

class OrderCustomerInfo(BaseModel):
    id: int
    name: str
    phone: Optional[str]
    email: Optional[str]
    avatar: Optional[str]

class OrderItemDetail(BaseModel):
    product_id: int
    product_name: str
    product_image: Optional[str]
    quantity: int
    unit_price: Decimal
    total_line: Decimal
    # Chỉ có ở Rental
    assigned_asset_id: Optional[str] = None
    condition_desc: Optional[str] = None

class OrderActionCapabilities(BaseModel):
    can_cancel: bool
    can_confirm: bool
    can_ship: bool
    can_complete: bool

class OrderDetailData(BaseModel):
    id: str
    type: Literal['sale', 'rental']
    status: str
    created_at: datetime
    
    customer: OrderCustomerInfo
    items: List[OrderItemDetail]
    
    subtotal: Decimal
    tax_amt: Decimal = 0
    freight: Decimal = 0
    total_due: Decimal
    
    rental_start: Optional[datetime] = None
    rental_end: Optional[datetime] = None
    
    actions: OrderActionCapabilities

# --- Order Actions Payloads ---
class OrderStatusUpdate(BaseModel):
    status: str
    note: Optional[str] = None

class CancellationReview(BaseModel):
    decision: Literal['accept', 'decline']
    reason: Optional[str] = None

class RentalPreparation(BaseModel):
    order_item_id: int
    inventory_asset_id: str
    description: Optional[str] = None
    evidence_photos: Optional[List[str]] = []


# ==========================================
# 6. CUSTOMERS
# ==========================================

class CustomerStats(BaseModel):
    total_orders: int
    total_spent: Decimal
    rank_name: str
    current_score: Decimal

class CustomerItem(BaseModel):
    id: int
    full_name: str
    email: Optional[str]
    phone: Optional[str]
    status: int
    avatar_url: Optional[str]
    stats: Optional[CustomerStats] = None

    model_config = ConfigDict(from_attributes=True)

class CustomerDetail(CustomerItem):
    address_list: List[str]
    recent_activity: List[OrderListItem]

class CustomerUpdate(BaseModel):
    # Hỗ trợ cả string và int cho linh hoạt
    status: Union[Literal['active', 'banned'], Literal[1, 0]]


# ==========================================
# 7. PROMOTIONS
# ==========================================

class DiscountConfig(BaseModel):
    type: Literal['percentage', 'amount']
    value: Decimal

class PromotionBase(BaseModel):
    name: str
    code: str
    scope: Literal['buy', 'rent', 'all'] = "all"
    start_date: datetime
    end_date: datetime
    
    discount_config: DiscountConfig
    min_order_amount: Optional[Decimal] = 0
    quantity: int
    target_ranks: List[str]
    status: bool = True

    @validator('code')
    def uppercase_code(cls, v):
        return v.upper()

class PromotionCreate(PromotionBase):
    pass

class PromotionUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    scope: Optional[Literal['buy', 'rent', 'all']] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    quantity: Optional[int] = None
    target_ranks: Optional[List[str]] = None
    status: Optional[bool] = None
    discount_config: Optional[DiscountConfig] = None

class PromotionResponse(PromotionBase):
    id: int
    used_count: int = 0
    
    model_config = ConfigDict(from_attributes=True)


# ==========================================
# 8. STAFF
# ==========================================

class StaffBase(BaseModel):
    full_name: str
    email: Optional[str]
    phone_number: str
    group_name: str
    department: str
    is_active: bool = True

class StaffCreateRequest(BaseModel):
    full_name: str
    email: EmailStr
    phone_number: str
    password: str
    role: Literal['order_staff', 'product_staff']
    status: Literal['active', 'inactive']
    
    department: str = "Operations"
    birth_date: date = date(2000, 1, 1) 
    start_date: date = date.today()

class StaffUpdateRequest(BaseModel):
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[Literal['order_staff', 'product_staff']] = None
    status: Optional[Literal['active', 'inactive']] = None
    password: Optional[str] = None

class StaffResponse(BaseModel):
    # ID là string để format đẹp "STF-xxx", dù URL input là int
    id: str  
    full_name: str
    email: Optional[str] = None
    phone_number: str
    group_name: str
    department: str
    
    role: str
    role_label: str
    status: str
    status_label: str
    avatar_url: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)


# ==========================================
# 9. SETTINGS (RENTAL CONFIG)
# ==========================================

class DurationLimits(BaseModel):
    min_days: int
    max_days: Optional[int] = None

class DepositConfig(BaseModel):
    default_rate: float

class PenaltyConfig(BaseModel):
    overdue_fee_rate: float
    cancellation_policy: Literal['flexible', 'moderate', 'strict']

class RentToOwnConfig(BaseModel):
    enabled: bool
    rent_deduction: float

class RentalSettingsData(BaseModel):
    duration_limits: DurationLimits
    deposit: DepositConfig
    penalty: PenaltyConfig
    rent_to_own: RentToOwnConfig

class RentalSettingsUpdate(BaseModel):
    duration_limits: Optional[DurationLimits] = None
    deposit: Optional[DepositConfig] = None
    penalty: Optional[PenaltyConfig] = None
    rent_to_own: Optional[RentToOwnConfig] = None


# ==========================================
# 10. FAQs
# ==========================================

class FAQCreate(BaseModel):
    question: str
    answer: str
    keywords: List[str]
    status: Literal['active', 'inactive']

class FAQUpdate(BaseModel):
    question: Optional[str] = None
    answer: Optional[str] = None
    keywords: Optional[List[str]] = None
    status: Optional[Literal['active', 'inactive']] = None

class FAQResponse(BaseModel):
    id: str # Format FAQ-xxx
    question: str
    answer: str
    answer_preview: str
    keywords: List[str]
    status: str
    status_label: str
    
    model_config = ConfigDict(from_attributes=True)