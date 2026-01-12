from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date, datetime
from app.schemas.common import SuccessResponse, PaginationInfo


# Dashboard Schemas
class RevenueGrowth(BaseModel):
    value: float
    growth_percentage: float
    growth_direction: str = Field(..., pattern="^(up|down)$")


class MetricValue(BaseModel):
    value: int
    unit: str


class OverdueReturn(BaseModel):
    value: int
    has_warning: bool
    warning_message: str


class DashboardSummary(BaseModel):
    total_revenue: RevenueGrowth
    active_rental: MetricValue
    total_customers: MetricValue
    overdue_return: OverdueReturn


class ChartSeries(BaseModel):
    name: str
    data: List[float]


class RevenueChart(BaseModel):
    labels: List[str]
    series: List[ChartSeries]


class InventoryBreakdown(BaseModel):
    label: str
    percentage: float
    value: int
    status: str


class InventoryStatus(BaseModel):
    total_items: int
    breakdown: List[InventoryBreakdown]


class DashboardData(BaseModel):
    summary: DashboardSummary
    revenue_chart: RevenueChart
    inventory_status: InventoryStatus


class DashboardResponse(BaseModel):
    success: bool
    data: DashboardData


# Reports Schemas
class RevenueReport(BaseModel):
    total_revenue: float
    total_orders: int
    avg_daily_revenue: float


class TopProduct(BaseModel):
    rank: int
    product_id: int
    product_number: str
    product_name: str
    category_name: str
    image_url: str
    quantity_sold: Optional[int] = None
    times_rented: Optional[int] = None
    revenue: float


class ReportsData(BaseModel):
    revenue_report: RevenueReport
    top_selling_products: List[TopProduct]
    top_rented_products: List[TopProduct]


class ReportsResponse(BaseModel):
    success: bool
    data: ReportsData


# Product Schemas
class ProductPrices(BaseModel):
    list_price: float
    rent_price: Optional[float] = None
    rent_unit: Optional[str] = None


class ProductStock(BaseModel):
    total_stock: int
    maintenance_stock: int
    available_stock: int
    renting_stock: int


class ProductListItem(BaseModel):
    id: int
    name: str
    product_number: str
    category_name: str
    image_url: str
    prices: ProductPrices
    stock: ProductStock
    status_label: str


class ProductListResponse(BaseModel):
    success: bool
    data: List[ProductListItem]
    pagination: PaginationInfo


class ProductAttributes(BaseModel):
    color: Optional[str] = None
    size: Optional[str] = None
    condition: Optional[str] = None
    frame_material: Optional[str] = None
    wheel_size: Optional[str] = None


class RentalConfig(BaseModel):
    is_rentable: bool
    security_deposit: float


class StockDetails(BaseModel):
    total_stock: int
    maintenance_stock: int


class ProductCreateRequest(BaseModel):
    name: str
    product_number: str
    subcategory_id: int
    list_price: float
    standard_cost: Optional[float] = None
    safety_stock_level: Optional[int] = None
    reorder_point: Optional[int] = None
    attributes: Optional[ProductAttributes] = None
    rental_config: Optional[RentalConfig] = None
    rent_price: Optional[float] = None
    stock_details: StockDetails
    images: List[str]
    description: Optional[str] = None


class ProductUpdateRequest(BaseModel):
    name: Optional[str] = None
    product_number: Optional[str] = None
    subcategory_id: Optional[int] = None
    list_price: Optional[float] = None
    standard_cost: Optional[float] = None
    attributes: Optional[ProductAttributes] = None
    rental_config: Optional[RentalConfig] = None
    rent_price: Optional[float] = None
    stock_details: Optional[StockDetails] = None
    images: Optional[List[str]] = None
    description: Optional[str] = None


class ProductImage(BaseModel):
    url: str
    is_primary: bool


class ProductDetailData(BaseModel):
    id: int
    name: str
    product_number: str
    category_name: str
    description: Optional[str] = None
    prices: ProductPrices
    stock: ProductStock
    attributes: Optional[ProductAttributes] = None
    rental_config: Optional[RentalConfig] = None
    images: List[ProductImage]
    status_label: str


class ProductDetailResponse(BaseModel):
    success: bool
    data: ProductDetailData


# Review Schemas
class ReviewUser(BaseModel):
    id: str
    username: str
    avatar_url: str


class AdminReply(BaseModel):
    content: str
    replied_at: datetime


class ReviewPermissions(BaseModel):
    can_reply: bool


class ReviewItem(BaseModel):
    id: str
    user: ReviewUser
    rating: int
    created_at: datetime
    content: str
    images: List[str]
    admin_reply: Optional[AdminReply] = None
    permissions: ReviewPermissions


class RatingDistribution(BaseModel):
    star_1: int
    star_2: int
    star_3: int
    star_4: int
    star_5: int


class ReviewSummary(BaseModel):
    product_id: int
    product_name: str
    average_rating: float
    total_reviews: int
    rating_distribution: RatingDistribution


class ReviewsData(BaseModel):
    summary: ReviewSummary
    reviews: List[ReviewItem]


class ReviewsResponse(BaseModel):
    success: bool
    data: ReviewsData


# Promotion Schemas
class DiscountConfig(BaseModel):
    type: str = Field(..., pattern="^(percentage|fixed)$")
    value: float


class PromotionItem(BaseModel):
    id: int
    name: str
    code: str
    scope: str
    start_date: date
    end_date: date
    quantity: Optional[int] = None
    target_ranks: List[str]
    status: bool
    discount_config: DiscountConfig
    min_order_amount: Optional[float] = None
    used_count: int


class PromotionListResponse(BaseModel):
    success: bool
    data: List[PromotionItem]
    pagination: PaginationInfo


class PromotionCreateRequest(BaseModel):
    name: str
    code: str
    scope: Optional[str] = None
    start_date: date
    end_date: date
    quantity: Optional[int] = None
    target_ranks: Optional[List[str]] = None
    status: Optional[bool] = True
    discount_config: DiscountConfig
    min_order_amount: Optional[float] = None


class PromotionUpdateRequest(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    scope: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    quantity: Optional[int] = None
    target_ranks: Optional[List[str]] = None
    status: Optional[bool] = None
    discount_config: Optional[DiscountConfig] = None
    min_order_amount: Optional[float] = None


class PromotionDetailResponse(BaseModel):
    success: bool
    data: PromotionItem


# Category Schemas
class CategoryItem(BaseModel):
    id: int
    name: str
    product_count: int


class CategoryListResponse(BaseModel):
    success: bool
    data: List[CategoryItem]
    pagination: PaginationInfo


class CategoryCreateRequest(BaseModel):
    name: str


class CategoryUpdateRequest(BaseModel):
    name: str


class CategoryDetailResponse(BaseModel):
    success: bool
    data: CategoryItem


# Customer Schemas
class CustomerItem(BaseModel):
    id: int
    full_name: str
    email: str
    phone: str
    status: int
    avatar_url: Optional[str] = None
    rank_name: str
    total_orders: int
    total_spent: float


class CustomerListResponse(BaseModel):
    success: bool
    data: List[CustomerItem]
    pagination: PaginationInfo


class CustomerStats(BaseModel):
    total_orders: int
    total_spent: float
    rank_name: str
    current_score: int


class RecentActivity(BaseModel):
    type: str
    description: str
    date: datetime


class CustomerDetailData(BaseModel):
    id: int
    full_name: str
    email: str
    phone: str
    status: int
    avatar_url: Optional[str] = None
    stats: CustomerStats
    address_list: List[str]
    recent_activity: List[RecentActivity]


class CustomerDetailResponse(BaseModel):
    success: bool
    data: CustomerDetailData


class CustomerUpdateRequest(BaseModel):
    status: str = Field(..., pattern="^(active|banned)$")


# Order Schemas
class OrderItem(BaseModel):
    id: str
    type: str
    customer: Optional[str] = None
    date: date
    status: str
    total_amount: float
    items_count: Optional[int] = None


class OrderListResponse(BaseModel):
    success: bool
    data: List[OrderItem]
    pagination: PaginationInfo


class OrderCustomer(BaseModel):
    id: int
    name: str
    email: str
    phone: str


class OrderDetailItem(BaseModel):
    product_id: int
    product_name: str
    quantity: int
    unit_price: float
    total: float


class OrderDetailData(BaseModel):
    id: str
    type: str
    customer: OrderCustomer
    date: date
    status: str
    total_amount: float
    items: List[OrderDetailItem]


class OrderDetailResponse(BaseModel):
    success: bool
    data: OrderDetailData


class OrderStatusUpdateRequest(BaseModel):
    status: str


class CancellationRequestDecision(BaseModel):
    decision: str = Field(..., pattern="^(accept|decline)$")
    reason: Optional[str] = None


class RentalPreparationRequest(BaseModel):
    order_item_id: int
    inventory_asset_id: str
    description: Optional[str] = None
    evidence_photos: Optional[List[str]] = None


# Staff Schemas
class StaffItem(BaseModel):
    id: int
    full_name: str
    email: str
    phone_number: str
    group_name: str
    department: str
    role: str
    role_label: str
    status: str
    status_label: str
    avatar_url: Optional[str] = None


class StaffListResponse(BaseModel):
    success: bool
    data: List[StaffItem]
    pagination: PaginationInfo


class StaffCreateRequest(BaseModel):
    full_name: str
    phone_number: str
    email: str
    password: str
    role: str = Field(..., pattern="^(product_staff|order_staff)$")
    status: Optional[str] = Field("active", pattern="^(active|inactive)$")


class StaffUpdateRequest(BaseModel):
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = Field(None, pattern="^(product_staff|order_staff)$")
    status: Optional[str] = Field(None, pattern="^(active|inactive)$")
    password: Optional[str] = None


class StaffDetailResponse(BaseModel):
    success: bool
    data: StaffItem


# Settings Schemas
class DurationLimits(BaseModel):
    min_days: int
    max_days: int


class DepositConfig(BaseModel):
    default_rate: float


class PenaltyConfig(BaseModel):
    overdue_fee_rate: float
    cancellation_policy: str


class RentToOwnConfig(BaseModel):
    enabled: bool
    rent_deduction: float


class RentalSettings(BaseModel):
    duration_limits: DurationLimits
    deposit: DepositConfig
    penalty: PenaltyConfig
    rent_to_own: RentToOwnConfig


class RentalSettingsResponse(BaseModel):
    success: bool
    data: RentalSettings


class RentalSettingsUpdateRequest(BaseModel):
    duration_limits: Optional[DurationLimits] = None
    deposit: Optional[DepositConfig] = None
    penalty: Optional[PenaltyConfig] = None
    rent_to_own: Optional[RentToOwnConfig] = None


# FAQ Schemas
class FAQItem(BaseModel):
    id: int
    question: str
    answer: str
    answer_preview: str
    keywords: List[str]
    status: str
    status_label: str


class FAQListResponse(BaseModel):
    success: bool
    data: List[FAQItem]
    pagination: PaginationInfo


class FAQCreateRequest(BaseModel):
    question: str
    answer: str
    keywords: Optional[List[str]] = None
    status: Optional[str] = Field("active", pattern="^(active|inactive)$")


class FAQUpdateRequest(BaseModel):
    question: Optional[str] = None
    answer: Optional[str] = None
    keywords: Optional[List[str]] = None
    status: Optional[str] = Field(None, pattern="^(active|inactive)$")


class FAQDetailResponse(BaseModel):
    success: bool
    data: FAQItem
