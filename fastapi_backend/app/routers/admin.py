from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from datetime import date
from typing import Optional
from app.database import get_db
from app.dependencies import require_role
from app.schemas.admin import *
from app.services.admin_service import (
    get_dashboard_data,
    get_reports_data,
    get_products_list,
    get_product_detail,
    create_product,
    update_product,
    delete_product,
    get_categories_list,
    get_customers_list,
    get_vouchers_list
)
from math import ceil

router = APIRouter(prefix="/admin", tags=["Admin"])


# Dashboard
@router.get("/dashboard", response_model=DashboardResponse)
async def get_dashboard(
    current_user: dict = Depends(require_role(["admin", "staff"])),
    db: Session = Depends(get_db)
):
    """Lấy thống kê tổng quan dashboard"""
    data = get_dashboard_data(db)
    return DashboardResponse(success=True, data=DashboardData(**data))


# Reports
@router.get("/reports", response_model=ReportsResponse)
async def get_reports(
    start_date: date = Query(..., description="Ngày bắt đầu (YYYY-MM-DD)"),
    end_date: date = Query(..., description="Ngày kết thúc (YYYY-MM-DD)"),
    page: int = Query(1, ge=1),
    limit: int = Query(5, ge=1, le=100),
    current_user: dict = Depends(require_role(["admin", "staff"])),
    db: Session = Depends(get_db)
):
    """Lấy báo cáo doanh thu và sản phẩm"""
    data = get_reports_data(db, start_date, end_date, page, limit)
    return ReportsResponse(success=True, data=ReportsData(**data))


# Products
@router.get("/products", response_model=ProductListResponse)
async def list_products(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None),
    current_user: dict = Depends(require_role(["admin", "staff"])),
    db: Session = Depends(get_db)
):
    """Lấy danh sách sản phẩm với phân trang và tìm kiếm"""
    products, total = get_products_list(db, page, limit, search)
    total_pages = ceil(total / limit) if limit > 0 else 0
    return ProductListResponse(
        success=True,
        data=[ProductListItem(**p) for p in products],
        pagination=PaginationInfo(
            page=page,
            limit=limit,
            total_items=total,
            total_pages=total_pages
        )
    )


@router.post("/products", response_model=SuccessResponse)
async def create_product_endpoint(
    request: ProductCreateRequest,
    current_user: dict = Depends(require_role(["admin", "staff"])),
    db: Session = Depends(get_db)
):
    """Tạo sản phẩm mới"""
    create_product(db, request.dict())
    return SuccessResponse(success=True, message="Product created successfully")


@router.get("/products/{product_id}", response_model=ProductDetailResponse)
async def get_product(
    product_id: int,
    current_user: dict = Depends(require_role(["admin", "staff"])),
    db: Session = Depends(get_db)
):
    """Lấy chi tiết sản phẩm"""
    data = get_product_detail(db, product_id)
    return ProductDetailResponse(success=True, data=ProductDetailData(**data))


@router.patch("/products/{product_id}", response_model=SuccessResponse)
async def update_product_endpoint(
    product_id: int,
    request: ProductUpdateRequest,
    current_user: dict = Depends(require_role(["admin", "staff"])),
    db: Session = Depends(get_db)
):
    """Cập nhật sản phẩm"""
    update_data = request.dict(exclude_unset=True)
    update_product(db, product_id, update_data)
    return SuccessResponse(success=True, message="Product updated successfully")


@router.delete("/products/{product_id}", response_model=SuccessResponse)
async def delete_product_endpoint(
    product_id: int,
    current_user: dict = Depends(require_role(["admin", "staff"])),
    db: Session = Depends(get_db)
):
    """Xóa sản phẩm"""
    delete_product(db, product_id)
    return SuccessResponse(success=True, message="Product deleted successfully")


# Reviews (stub - needs implementation)
@router.get("/reviews/{product_id}", response_model=ReviewsResponse)
async def get_reviews(
    product_id: int,
    page: int = Query(1, ge=1),
    limit: int = Query(5, ge=1, le=100),
    filter_type: Optional[str] = Query("all", pattern="^(all|highest|lowest|unanswered)$"),
    current_user: dict = Depends(require_role(["admin", "staff"])),
    db: Session = Depends(get_db)
):
    """Lấy đánh giá sản phẩm"""
    # Stub implementation
    raise HTTPException(status_code=501, detail="Not implemented")


# Promotions/Vouchers
@router.get("/promotions", response_model=PromotionListResponse)
async def list_promotions(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    current_user: dict = Depends(require_role(["admin", "staff"])),
    db: Session = Depends(get_db)
):
    """Lấy danh sách khuyến mãi"""
    promotions, total = get_vouchers_list(db, page, limit)
    total_pages = ceil(total / limit) if limit > 0 else 0
    return PromotionListResponse(
        success=True,
        data=[PromotionItem(**p) for p in promotions],
        pagination=PaginationInfo(
            page=page,
            limit=limit,
            total_items=total,
            total_pages=total_pages
        )
    )


@router.post("/promotions", response_model=SuccessResponse)
async def create_promotion(
    request: PromotionCreateRequest,
    current_user: dict = Depends(require_role(["admin", "staff"])),
    db: Session = Depends(get_db)
):
    """Tạo khuyến mãi"""
    # Stub implementation
    raise HTTPException(status_code=501, detail="Not implemented")


@router.get("/promotions/{promotion_id}", response_model=PromotionDetailResponse)
async def get_promotion(
    promotion_id: int,
    current_user: dict = Depends(require_role(["admin", "staff"])),
    db: Session = Depends(get_db)
):
    """Lấy chi tiết khuyến mãi"""
    # Stub implementation
    raise HTTPException(status_code=501, detail="Not implemented")


@router.patch("/promotions/{promotion_id}", response_model=SuccessResponse)
async def update_promotion(
    promotion_id: int,
    request: PromotionUpdateRequest,
    current_user: dict = Depends(require_role(["admin", "staff"])),
    db: Session = Depends(get_db)
):
    """Cập nhật khuyến mãi"""
    # Stub implementation
    raise HTTPException(status_code=501, detail="Not implemented")


@router.delete("/promotions/{promotion_id}", response_model=SuccessResponse)
async def delete_promotion(
    promotion_id: int,
    current_user: dict = Depends(require_role(["admin", "staff"])),
    db: Session = Depends(get_db)
):
    """Xóa khuyến mãi"""
    # Stub implementation
    raise HTTPException(status_code=501, detail="Not implemented")


# Categories
@router.get("/categories", response_model=CategoryListResponse)
async def list_categories(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None),
    current_user: dict = Depends(require_role(["admin", "staff"])),
    db: Session = Depends(get_db)
):
    """Lấy danh sách danh mục"""
    categories, total = get_categories_list(db, page, limit, search)
    total_pages = ceil(total / limit) if limit > 0 else 0
    return CategoryListResponse(
        success=True,
        data=[CategoryItem(**c) for c in categories],
        pagination=PaginationInfo(
            page=page,
            limit=limit,
            total_items=total,
            total_pages=total_pages
        )
    )


@router.post("/categories", response_model=SuccessResponse)
async def create_category(
    request: CategoryCreateRequest,
    current_user: dict = Depends(require_role(["admin", "staff"])),
    db: Session = Depends(get_db)
):
    """Tạo danh mục"""
    # Stub implementation
    raise HTTPException(status_code=501, detail="Not implemented")


@router.get("/categories/{category_id}", response_model=CategoryDetailResponse)
async def get_category(
    category_id: int,
    current_user: dict = Depends(require_role(["admin", "staff"])),
    db: Session = Depends(get_db)
):
    """Lấy chi tiết danh mục"""
    # Stub implementation
    raise HTTPException(status_code=501, detail="Not implemented")


@router.patch("/categories/{category_id}", response_model=SuccessResponse)
async def update_category(
    category_id: int,
    request: CategoryUpdateRequest,
    current_user: dict = Depends(require_role(["admin", "staff"])),
    db: Session = Depends(get_db)
):
    """Cập nhật danh mục"""
    # Stub implementation
    raise HTTPException(status_code=501, detail="Not implemented")


@router.delete("/categories/{category_id}", response_model=SuccessResponse)
async def delete_category(
    category_id: int,
    current_user: dict = Depends(require_role(["admin", "staff"])),
    db: Session = Depends(get_db)
):
    """Xóa danh mục"""
    # Stub implementation
    raise HTTPException(status_code=501, detail="Not implemented")


# Customers
@router.get("/customers", response_model=CustomerListResponse)
async def list_customers(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None),
    current_user: dict = Depends(require_role(["admin", "staff"])),
    db: Session = Depends(get_db)
):
    """Lấy danh sách khách hàng"""
    customers, total = get_customers_list(db, page, limit, search)
    total_pages = ceil(total / limit) if limit > 0 else 0
    return CustomerListResponse(
        success=True,
        data=[CustomerItem(**c) for c in customers],
        pagination=PaginationInfo(
            page=page,
            limit=limit,
            total_items=total,
            total_pages=total_pages
        )
    )


@router.get("/customers/{customer_id}", response_model=CustomerDetailResponse)
async def get_customer(
    customer_id: int,
    current_user: dict = Depends(require_role(["admin", "staff"])),
    db: Session = Depends(get_db)
):
    """Lấy chi tiết khách hàng"""
    # Stub implementation
    raise HTTPException(status_code=501, detail="Not implemented")


@router.patch("/customers/{customer_id}", response_model=SuccessResponse)
async def update_customer(
    customer_id: int,
    request: CustomerUpdateRequest,
    current_user: dict = Depends(require_role(["admin", "staff"])),
    db: Session = Depends(get_db)
):
    """Cập nhật trạng thái khách hàng"""
    # Stub implementation
    raise HTTPException(status_code=501, detail="Not implemented")


# Orders (stubs - need implementation)
@router.get("/orders", response_model=OrderListResponse)
async def list_orders(
    type: Optional[str] = Query("all", pattern="^(all|sale|rental)$"),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None),
    current_user: dict = Depends(require_role(["admin", "staff"])),
    db: Session = Depends(get_db)
):
    """Lấy danh sách đơn hàng"""
    raise HTTPException(status_code=501, detail="Not implemented")


@router.get("/orders/{order_id}", response_model=OrderDetailResponse)
async def get_order(
    order_id: int,
    type: str = Query(..., pattern="^(sale|rental)$"),
    current_user: dict = Depends(require_role(["admin", "staff"])),
    db: Session = Depends(get_db)
):
    """Lấy chi tiết đơn hàng"""
    raise HTTPException(status_code=501, detail="Not implemented")


@router.patch("/orders/{order_id}/status", response_model=SuccessResponse)
async def update_order_status(
    order_id: int,
    type: str = Query(..., pattern="^(sale|rental)$"),
    request: OrderStatusUpdateRequest = ...,
    current_user: dict = Depends(require_role(["admin", "staff"])),
    db: Session = Depends(get_db)
):
    """Cập nhật trạng thái đơn hàng"""
    raise HTTPException(status_code=501, detail="Not implemented")


# Staff (stubs - need implementation)
@router.get("/staffs", response_model=StaffListResponse)
async def list_staffs(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    current_user: dict = Depends(require_role(["admin"])),
    db: Session = Depends(get_db)
):
    """Lấy danh sách nhân viên"""
    raise HTTPException(status_code=501, detail="Not implemented")


@router.post("/staffs", response_model=SuccessResponse)
async def create_staff(
    request: StaffCreateRequest,
    current_user: dict = Depends(require_role(["admin"])),
    db: Session = Depends(get_db)
):
    """Tạo nhân viên"""
    raise HTTPException(status_code=501, detail="Not implemented")


@router.get("/staffs/{staff_id}", response_model=StaffDetailResponse)
async def get_staff(
    staff_id: int,
    current_user: dict = Depends(require_role(["admin"])),
    db: Session = Depends(get_db)
):
    """Lấy chi tiết nhân viên"""
    raise HTTPException(status_code=501, detail="Not implemented")


@router.patch("/staffs/{staff_id}", response_model=SuccessResponse)
async def update_staff(
    staff_id: int,
    request: StaffUpdateRequest,
    current_user: dict = Depends(require_role(["admin"])),
    db: Session = Depends(get_db)
):
    """Cập nhật nhân viên"""
    raise HTTPException(status_code=501, detail="Not implemented")


@router.delete("/staffs/{staff_id}", response_model=SuccessResponse)
async def delete_staff(
    staff_id: int,
    current_user: dict = Depends(require_role(["admin"])),
    db: Session = Depends(get_db)
):
    """Xóa nhân viên"""
    raise HTTPException(status_code=501, detail="Not implemented")


# Settings (stubs - need implementation)
@router.get("/settings/rental", response_model=RentalSettingsResponse)
async def get_rental_settings(
    current_user: dict = Depends(require_role(["admin"])),
    db: Session = Depends(get_db)
):
    """Lấy cài đặt cho thuê"""
    raise HTTPException(status_code=501, detail="Not implemented")


@router.patch("/settings/rental", response_model=SuccessResponse)
async def update_rental_settings(
    request: RentalSettingsUpdateRequest,
    current_user: dict = Depends(require_role(["admin"])),
    db: Session = Depends(get_db)
):
    """Cập nhật cài đặt cho thuê"""
    raise HTTPException(status_code=501, detail="Not implemented")


# FAQs (stubs - need implementation)
@router.get("/faqs", response_model=FAQListResponse)
async def list_faqs(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None),
    status: Optional[str] = Query(None, pattern="^(active|inactive)$"),
    current_user: dict = Depends(require_role(["admin", "staff"])),
    db: Session = Depends(get_db)
):
    """Lấy danh sách FAQ"""
    raise HTTPException(status_code=501, detail="Not implemented")


@router.post("/faqs", response_model=SuccessResponse)
async def create_faq(
    request: FAQCreateRequest,
    current_user: dict = Depends(require_role(["admin", "staff"])),
    db: Session = Depends(get_db)
):
    """Tạo FAQ"""
    raise HTTPException(status_code=501, detail="Not implemented")


@router.get("/faqs/{faq_id}", response_model=FAQDetailResponse)
async def get_faq(
    faq_id: int,
    current_user: dict = Depends(require_role(["admin", "staff"])),
    db: Session = Depends(get_db)
):
    """Lấy chi tiết FAQ"""
    raise HTTPException(status_code=501, detail="Not implemented")


@router.patch("/faqs/{faq_id}", response_model=SuccessResponse)
async def update_faq(
    faq_id: int,
    request: FAQUpdateRequest,
    current_user: dict = Depends(require_role(["admin", "staff"])),
    db: Session = Depends(get_db)
):
    """Cập nhật FAQ"""
    raise HTTPException(status_code=501, detail="Not implemented")


@router.delete("/faqs/{faq_id}", response_model=SuccessResponse)
async def delete_faq(
    faq_id: int,
    current_user: dict = Depends(require_role(["admin", "staff"])),
    db: Session = Depends(get_db)
):
    """Xóa FAQ"""
    raise HTTPException(status_code=501, detail="Not implemented")
