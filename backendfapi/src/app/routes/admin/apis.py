from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func, or_, and_, desc, union_all, literal
from datetime import datetime, date, timedelta
from decimal import Decimal
from typing import Optional, List

from app.database import get_db
from app.models import *
from .config import * 
from ...helper import *
from app.routes.auth.apis import get_password_hash
import re

admin_router = APIRouter(prefix="/admin", tags=["Admin"])

def parse_staff_id(staff_id: str | int) -> int:
    """Parse staff ID from either integer or 'STF-XXX' format"""
    if isinstance(staff_id, int):
        return staff_id
    if isinstance(staff_id, str):
        # Try to extract number from "STF-XXX" format
        match = re.search(r'STF-(\d+)', staff_id.upper())
        if match:
            return int(match.group(1))
        # If it's just a number string, convert it
        try:
            return int(staff_id)
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid staff ID format: {staff_id}")
    raise HTTPException(status_code=400, detail=f"Invalid staff ID type: {type(staff_id)}")

def parse_faq_id(faq_id: str | int) -> int:
    """Parse FAQ ID from either integer or 'FAQ-XXX' format"""
    if isinstance(faq_id, int):
        return faq_id
    if isinstance(faq_id, str):
        # Try to extract number from "FAQ-XXX" format
        match = re.search(r'FAQ-(\d+)', faq_id.upper())
        if match:
            return int(match.group(1))
        # If it's just a number string, convert it
        try:
            return int(faq_id)
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid FAQ ID format: {faq_id}")
    raise HTTPException(status_code=400, detail=f"Invalid FAQ ID type: {type(faq_id)}")

# ==========================================
# 1. DASHBOARD & REPORTS
# ==========================================

@admin_router.get("/dashboard", response_model=APIResponse[DashboardData])
async def get_dashboard_stats(db: Session = Depends(get_db)):
    today = datetime.now()
    start_of_week = today - timedelta(days=today.weekday())

    # 1. Summary Metrics
    total_sales = db.query(func.sum(SalesOrderHeader.TotalDue)).scalar() or Decimal(0)
    total_rentals = db.query(func.sum(RentalHeader.TotalDue)).scalar() or Decimal(0)
    total_revenue = total_sales + total_rentals

    # Growth Logic (Mockup for Demo)
    prev_revenue = total_revenue * Decimal(0.85)
    growth = float((total_revenue - prev_revenue) / prev_revenue * 100) if prev_revenue else 0

    active_rentals = db.query(func.count(RentalHeader.RentalID)).filter(RentalHeader.Status == 1).scalar() or 0
    total_customers = db.query(func.count(Customer.CustomerID)).scalar() or 0
    overdue_count = db.query(func.count(RentalHeader.RentalID)).filter(
        and_(RentalHeader.DueDate < today, RentalHeader.ReturnDate == None)
    ).scalar() or 0

    # 2. Revenue Chart (7 Days)
    labels = []
    sales_data = []
    rent_data = []
    
    for i in range(7):
        curr_day = start_of_week + timedelta(days=i)
        next_day = curr_day + timedelta(days=1)
        labels.append(curr_day.strftime("%a"))
        
        d_sales = db.query(func.sum(SalesOrderHeader.TotalDue)).filter(
            and_(SalesOrderHeader.OrderDate >= curr_day, SalesOrderHeader.OrderDate < next_day)
        ).scalar() or Decimal(0)
        
        d_rent = db.query(func.sum(RentalHeader.TotalDue)).filter(
            and_(RentalHeader.RentalDate >= curr_day, RentalHeader.RentalDate < next_day)
        ).scalar() or Decimal(0)
        
        sales_data.append(d_sales)
        rent_data.append(d_rent)

    # 3. Inventory Status
    # Location 60: Maintenance, Others: Available
    maintenance_qty = db.query(func.sum(ProductInventory.Quantity)).filter(ProductInventory.LocationID == 60).scalar() or 0
    available_qty = db.query(func.sum(ProductInventory.Quantity)).filter(ProductInventory.LocationID != 60).scalar() or 0
    
    # Renting Qty (Items currently out)
    renting_qty = db.query(func.sum(RentalDetail.OrderQty)).join(RentalHeader).filter(RentalHeader.Status == 1).scalar() or 0
    
    # Adjust available (Physical count in warehouse includes rented items logic depending on DB design, 
    # assuming Inventory table decrements only on sale, but for rental it stays but marked? 
    # Let's assume Inventory table tracks "In House". If Renting, it's out of house.)
    # Code cũ bạn logic: Available = Total - Maint - Renting.
    
    total_inv = available_qty + renting_qty # Maintenance is separate? Let's follow previous logic.
    total_tracked = available_qty + renting_qty + maintenance_qty
    
    def calc_pct(val, total): 
        return float(round((val/total*100), 1)) if total > 0 else 0

    dashboard_data = DashboardData(
        summary=DashboardSummary(
            total_revenue=RevenueItem(value=total_revenue, growth_percentage=growth, growth_direction="up"),
            active_rental=CountItem(value=active_rentals, unit="vehicles"),
            total_customers=CountItem(value=total_customers, unit="people"),
            overdue_return=OverdueItem(value=overdue_count, has_warning=overdue_count > 0, warning_message="Late returns detected" if overdue_count else None)
        ),
        revenue_chart=DashboardChart(
            labels=labels,
            series=[
                ChartSeriesItem(name="Sales", data=sales_data),
                ChartSeriesItem(name="Rentals", data=rent_data)
            ]
        ),
        inventory_status=InventoryStatus(
            total_items=total_tracked,
            breakdown=[
                {"label": "Available", "percentage": calc_pct(available_qty, total_tracked), "value": available_qty, "status": "available"},
                {"label": "Renting", "percentage": calc_pct(renting_qty, total_tracked), "value": renting_qty, "status": "renting"},
                {"label": "Maintenance", "percentage": calc_pct(maintenance_qty, total_tracked), "value": maintenance_qty, "status": "maintenance"}
            ]
        )
    )
    return success_response(dashboard_data)

@admin_router.get("/reports", response_model=APIResponse[ReportData])
async def get_reports(
    start_date: date = Query(..., description="Ngày bắt đầu (YYYY-MM-DD)"),
    end_date: date = Query(..., description="Ngày kết thúc (YYYY-MM-DD)"),
    page: int = Query(1, ge=1, description="Trang hiện tại cho danh sách top"),
    limit: int = Query(5, ge=1, description="Số lượng top sản phẩm (VD: Top 5)"),
    db: Session = Depends(get_db)
):
    # Chuyển đổi date -> datetime để so sánh chính xác trong DB
    start_dt = datetime.combine(start_date, datetime.min.time())
    end_dt = datetime.combine(end_date, datetime.max.time())
    
    # Tính số ngày (tránh chia cho 0)
    delta_days = (end_date - start_date).days + 1
    if delta_days < 1: delta_days = 1

    # --- 1. TÍNH TỔNG QUAN (REVENUE REPORT) ---
    
    # Tổng Bán hàng (Sales)
    sales_stats = db.query(
        func.sum(SalesOrderHeader.TotalDue).label("revenue"),
        func.count(SalesOrderHeader.SalesOrderID).label("count")
    ).filter(
        and_(SalesOrderHeader.OrderDate >= start_dt, SalesOrderHeader.OrderDate <= end_dt)
    ).first()

    # Tổng Cho thuê (Rentals)
    rental_stats = db.query(
        func.sum(RentalHeader.TotalDue).label("revenue"),
        func.count(RentalHeader.RentalID).label("count")
    ).filter(
        and_(RentalHeader.RentalDate >= start_dt, RentalHeader.RentalDate <= end_dt)
    ).first()

    # Xử lý kết quả (None -> 0)
    total_sales_rev = sales_stats.revenue or Decimal(0)
    total_rent_rev = rental_stats.revenue or Decimal(0)
    
    total_revenue = total_sales_rev + total_rent_rev
    total_orders = (sales_stats.count or 0) + (rental_stats.count or 0)
    avg_daily = total_revenue / Decimal(delta_days)

    # --- 2. TÍNH TOP SELLING (BÁN HÀNG) ---
    # Join: Product -> SalesOrderDetail -> SalesOrderHeader (để lọc ngày) -> SubCategory -> Category
    
    offset = (page - 1) * limit
    
    # Query Aggregate
    selling_query = db.query(
        Product.ProductID,
        Product.ProductNumber,
        Product.Name,
        ProductCategory.Name.label("CategoryName"),
        func.sum(SalesOrderDetail.OrderQty).label("TotalQty"),
        func.sum(SalesOrderDetail.UnitPrice * SalesOrderDetail.OrderQty).label("TotalRevenue")
    ).join(SalesOrderDetail, Product.ProductID == SalesOrderDetail.ProductID)\
     .join(SalesOrderHeader, SalesOrderHeader.SalesOrderID == SalesOrderDetail.SalesOrderID)\
     .join(ProductSubcategory, Product.ProductSubcategoryID == ProductSubcategory.ProductSubcategoryID)\
     .join(ProductCategory, ProductSubcategory.ProductCategoryID == ProductCategory.ProductCategoryID)\
     .filter(
         and_(SalesOrderHeader.OrderDate >= start_dt, SalesOrderHeader.OrderDate <= end_dt)
     )\
     .group_by(Product.ProductID, Product.ProductNumber, Product.Name, ProductCategory.Name)
     
    # MSSQL Fix: Order By trước khi Limit
    selling_results = selling_query.order_by(desc("TotalRevenue"))\
                                   .offset(offset).limit(limit).all()

    top_selling = []
    for idx, row in enumerate(selling_results):
        # Lấy ảnh đại diện (Query riêng để tránh phức tạp hóa group by)
        img_obj = db.query(ProductImage).filter(
            ProductImage.ProductID == row.ProductID, 
            ProductImage.IsPrimary == True
        ).first()
        # Fallback ảnh
        if not img_obj:
            img_obj = db.query(ProductImage).filter(ProductImage.ProductID == row.ProductID).first()

        top_selling.append(TopProductItem(
            rank=offset + idx + 1,
            product_id=row.ProductID,
            product_number=row.ProductNumber,
            product_name=row.Name,
            category_name=row.CategoryName,
            image_url=img_obj.ImageURL if img_obj else None,
            quantity_sold=row.TotalQty,
            revenue=row.TotalRevenue or Decimal(0)
        ))

    # --- 3. TÍNH TOP RENTING (CHO THUÊ) ---
    
    renting_query = db.query(
        Product.ProductID,
        Product.ProductNumber,
        Product.Name,
        ProductCategory.Name.label("CategoryName"),
        func.count(RentalDetail.RentalID).label("TimesRented"), # Đếm số lần được thuê
        func.sum(RentalDetail.UnitPrice * RentalDetail.OrderQty).label("TotalRevenue")
    ).join(RentalDetail, Product.ProductID == RentalDetail.ProductID)\
     .join(RentalHeader, RentalHeader.RentalID == RentalDetail.RentalID)\
     .join(ProductSubcategory, Product.ProductSubcategoryID == ProductSubcategory.ProductSubcategoryID)\
     .join(ProductCategory, ProductSubcategory.ProductCategoryID == ProductCategory.ProductCategoryID)\
     .filter(
         and_(RentalHeader.RentalDate >= start_dt, RentalHeader.RentalDate <= end_dt)
     )\
     .group_by(Product.ProductID, Product.ProductNumber, Product.Name, ProductCategory.Name)
     
    # MSSQL Fix
    renting_results = renting_query.order_by(desc("TotalRevenue"))\
                                   .offset(offset).limit(limit).all()

    top_renting = []
    for idx, row in enumerate(renting_results):
        img_obj = db.query(ProductImage).filter(
            ProductImage.ProductID == row.ProductID, 
            ProductImage.IsPrimary == True
        ).first()
        if not img_obj:
            img_obj = db.query(ProductImage).filter(ProductImage.ProductID == row.ProductID).first()

        top_renting.append(TopProductItem(
            rank=offset + idx + 1,
            product_id=row.ProductID,
            product_number=row.ProductNumber,
            product_name=row.Name,
            category_name=row.CategoryName,
            image_url=img_obj.ImageURL if img_obj else None,
            times_rented=row.TimesRented,
            revenue=row.TotalRevenue or Decimal(0)
        ))

    # --- 4. TRẢ VỀ ---
    
    data = ReportData(
        revenue_report=RevenueReportItem(
            total_revenue=total_revenue,
            total_orders=total_orders,
            avg_daily_revenue=avg_daily
        ),
        top_selling_products=top_selling,
        top_rented_products=top_renting
    )

    return success_response(data)

# ==========================================
# 2. PRODUCTS
# ==========================================

@admin_router.get("/products", response_model=PagedResponse[ProductResponse])
async def get_products(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1),
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Product)
    if search:
        term = f"%{search}%"
        query = query.filter(or_(Product.Name.ilike(term), Product.ProductNumber.ilike(term)))
    
    total_items = query.count()

    # --- FIX: Thêm order_by trước khi offset/limit ---
    # MSSQL bắt buộc phải sort thì mới phân trang được
    products = query.order_by(desc(Product.ProductID))\
                    .offset((page - 1) * limit).limit(limit).all()
    
    results = []
    for p in products:
        # Calculate Stock
        total_phy = db.query(func.sum(ProductInventory.Quantity)).filter(ProductInventory.ProductID == p.ProductID).scalar() or 0
        maint_qty = db.query(func.sum(ProductInventory.Quantity)).filter(ProductInventory.ProductID == p.ProductID, ProductInventory.LocationID == 60).scalar() or 0
        renting_qty = db.query(func.sum(RentalDetail.OrderQty)).join(RentalHeader).filter(RentalDetail.ProductID == p.ProductID, RentalHeader.Status == 1).scalar() or 0
        
        avail_qty = max(0, total_phy - maint_qty - renting_qty)
        
        # Get Image
        img_url = next((img.ImageURL for img in p.images if img.IsPrimary), None) 
        if not img_url and p.images:
            img_url = p.images[0].ImageURL
        
        # Map Category Name
        cat_name = p.subcategory.category.Name if (p.subcategory and p.subcategory.category) else "Unknown"

        results.append(ProductResponse(
            id=p.ProductID,
            name=p.Name,
            product_number=p.ProductNumber,
            category_name=cat_name,
            image_url=img_url,
            prices=ProductPrices(
                list_price=p.ListPrice,
                rent_price=p.RentPrice,
                rent_unit=p.RentalPeriodUnit or 'day'
            ),
            stock=StockDetails(
                total_stock=total_phy,
                maintenance_stock=maint_qty,
                available_stock=avail_qty,
                renting_stock=renting_qty
            ),
            status_label="In Stock" if avail_qty > 0 else "Out of Stock"
        ))
        
    return manual_paginate(results, total_items, page, limit)

@admin_router.post("/products", response_model=APIResponse)
async def create_product(payload: ProductCreateUpdate, db: Session = Depends(get_db)):
    # 1. Create Product
    new_p = Product(
        Name=payload.name,
        ProductNumber=payload.product_number,
        ProductSubcategoryID=payload.subcategory_id,
        ListPrice=payload.list_price,
        StandardCost=payload.standard_cost,
        SafetyStockLevel=payload.safety_stock_level,
        ReorderPoint=payload.reorder_point,
        # Attributes
        Color=payload.attributes.color,
        Size=payload.attributes.size,
        Condition=payload.attributes.condition,
        FrameMaterial=payload.attributes.frame_material,
        WheelSize=payload.attributes.wheel_size,
        # Rental Config
        IsRentable=payload.rental_config.is_rentable,
        SecurityDeposit=payload.rental_config.security_deposit,
        RentPrice=payload.rent_price,
        RentalPeriodUnit='day',
        # Defaults
        SellStartDate=datetime.now(),
        ModifiedDate=datetime.now(),
        FinishedGoodsFlag=True,
        DaysToManufacture=0
    )
    if payload.description: 
        new_p.Description = payload.description # Giả sử có cột này hoặc bảng ProductDescription

    db.add(new_p)
    db.flush()

    # 2. Images
    for url in payload.images:
        db.add(ProductImage(ProductID=new_p.ProductID, ImageURL=url))

    # 3. Inventory (Location 1: Main, 60: Maintenance)
    # Available = Total - Maintenance. Logic: Put (Total - Maint) into Loc 1, Maint into Loc 60
    main_qty = payload.stock_details.total_stock - payload.stock_details.maintenance_stock
    db.add(ProductInventory(ProductID=new_p.ProductID, LocationID=1, Quantity=max(0, main_qty), ModifiedDate=datetime.now()))
    if payload.stock_details.maintenance_stock > 0:
        db.add(ProductInventory(ProductID=new_p.ProductID, LocationID=60, Quantity=payload.stock_details.maintenance_stock, ModifiedDate=datetime.now()))

    db.commit()
    return success_response(message="Product created successfully")

@admin_router.get("/products/{product_id}", response_model=APIResponse[ProductDetailResponse])
async def get_product_detail(product_id: int, db: Session = Depends(get_db)):
    p = db.query(Product).filter(Product.ProductID == product_id).first()
    if not p: raise HTTPException(404, "Product not found")

    # Reuse calculation logic (simplified here)
    total_phy = db.query(func.sum(ProductInventory.Quantity)).filter(ProductInventory.ProductID == p.ProductID).scalar() or 0
    maint_qty = db.query(func.sum(ProductInventory.Quantity)).filter(ProductInventory.ProductID == p.ProductID, ProductInventory.LocationID == 60).scalar() or 0
    renting_qty = db.query(func.sum(RentalDetail.OrderQty)).join(RentalHeader).filter(RentalDetail.ProductID == p.ProductID, RentalHeader.Status == 1).scalar() or 0
    
    # --- FIX: Xử lý None cho các trường có thể Null trong DB ---
    detail = ProductDetailResponse(
        id=p.ProductID,
        name=p.Name,
        product_number=p.ProductNumber,
        category_name=p.subcategory.category.Name if (p.subcategory and p.subcategory.category) else "Unknown",
        description=p.Description,
        prices=ProductPrices(
            list_price=p.ListPrice, 
            rent_price=p.RentPrice # Schema cho phép Optional nên None vẫn OK
        ),
        stock=StockDetails(
            total_stock=total_phy, 
            maintenance_stock=maint_qty, 
            available_stock=max(0, total_phy-maint_qty-renting_qty), 
            renting_stock=renting_qty
        ),
        attributes=ProductAttributes(
            size=p.Size, 
            color=p.Color, 
            condition=p.Condition or "New" # Handle None condition
        ),
        rental_config=RentalConfigInfo(
            # FIX: Thêm "or False" để biến None thành False
            is_rentable=p.IsRentable or False, 
            security_deposit=p.SecurityDeposit or 0
        ),
        images=[ImageItem(url=img.ImageURL, is_primary=img.IsPrimary) for img in p.images],
        status_label="In Stock"
    )
    return success_response(detail)

@admin_router.patch("/products/{product_id}", response_model=APIResponse)
async def update_product(
    product_id: int, 
    payload: ProductCreateUpdate, 
    db: Session = Depends(get_db)
):
    # 1. Tìm sản phẩm
    product = db.query(Product).filter(Product.ProductID == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # 2. Cập nhật thông tin cơ bản
    product.Name = payload.name
    product.ProductNumber = payload.product_number
    product.ProductSubcategoryID = payload.subcategory_id
    
    # Pricing
    product.ListPrice = payload.list_price
    product.StandardCost = payload.standard_cost
    
    # Specs
    product.Color = payload.attributes.color
    product.Size = payload.attributes.size
    product.Condition = payload.attributes.condition
    product.FrameMaterial = payload.attributes.frame_material
    product.WheelSize = payload.attributes.wheel_size
    
    # Rental Config
    product.IsRentable = payload.rental_config.is_rentable
    product.RentPrice = payload.rent_price
    product.SecurityDeposit = payload.rental_config.security_deposit
    
    # Inventory Config
    product.SafetyStockLevel = payload.safety_stock_level
    product.ReorderPoint = payload.reorder_point
    
    if payload.description:
        product.Description = payload.description
    
    product.ModifiedDate = datetime.now()

    # 3. Cập nhật Inventory (Upsert)
    # Tính toán số lượng cho Kho chính và Kho bảo trì
    main_qty = max(0, payload.stock_details.total_stock - payload.stock_details.maintenance_stock)
    maint_qty = payload.stock_details.maintenance_stock

    # Helper function update kho
    def upsert_inventory(loc_id, qty, shelf, bin_code):
        inv = db.query(ProductInventory).filter(
            ProductInventory.ProductID == product_id,
            ProductInventory.LocationID == loc_id
        ).first()
        
        if inv:
            inv.Quantity = qty
            inv.ModifiedDate = datetime.now()
        else:
            db.add(ProductInventory(
                ProductID=product_id, LocationID=loc_id, Quantity=qty,
                Shelf=shelf, Bin=bin_code, ModifiedDate=datetime.now()
            ))

    # Update Location 1 (Warehouse) & 60 (Maintenance)
    upsert_inventory(1, main_qty, 'A', '1')
    upsert_inventory(60, maint_qty, 'M', '1')

    # 4. Cập nhật Images
    # Chiến lược: Xóa hết ảnh cũ -> Thêm ảnh mới (Đơn giản nhất để đồng bộ list URL)
    # Lưu ý: Trong thực tế nếu cần giữ ID ảnh cũ thì logic sẽ phức tạp hơn.
    db.query(ProductImage).filter(ProductImage.ProductID == product_id).delete()
    
    # Thêm ảnh mới
    for idx, url in enumerate(payload.images):
        is_primary = (idx == 0) # Ảnh đầu tiên là ảnh chính
        
        # --- FIX: Bỏ ModifiedDate, model tự động dùng CreatedDate default ---
        db.add(ProductImage(
            ProductID=product_id, 
            ImageURL=url, 
            IsPrimary=is_primary
            # CreatedDate sẽ tự động lấy datetime.utcnow theo model definition
        ))

    db.commit()
    return success_response(message="Product updated successfully")

# 5. DELETE - DELETE PRODUCT
@admin_router.delete("/products/{product_id}", response_model=APIResponse)
async def delete_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.ProductID == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Kiểm tra ràng buộc dữ liệu (Đã từng bán hoặc cho thuê chưa)
    has_sales = db.query(SalesOrderDetail).filter(SalesOrderDetail.ProductID == product_id).first()
    has_rentals = db.query(RentalDetail).filter(RentalDetail.ProductID == product_id).first()

    if has_sales or has_rentals:
        # --- SOFT DELETE (Nếu đã có lịch sử giao dịch) ---
        # Đánh dấu ngừng kinh doanh
        product.SellEndDate = datetime.now()
        product.FinishedGoodsFlag = False # Ngưng sản xuất/kinh doanh
        product.ModifiedDate = datetime.now()
        
        db.commit()
        return success_response(
            message="Product has transaction history. It has been deactivated (Soft Deleted) instead of removed."
        )
    else:
        # --- HARD DELETE (Nếu dữ liệu sạch) ---
        # 1. Xóa Inventory
        db.query(ProductInventory).filter(ProductInventory.ProductID == product_id).delete()
        # 2. Xóa Images
        db.query(ProductImage).filter(ProductImage.ProductID == product_id).delete()
        # 3. Xóa Product Review (nếu có review rác)
        db.query(ProductReview).filter(ProductReview.ProductID == product_id).delete()
        
        # 4. Xóa Product
        db.delete(product)
        
        db.commit()
        return success_response(message="Product permanently deleted")

# 6. GET PRODUCT REVIEWS
@admin_router.get("/reviews/{product_id}", response_model=APIResponse[ReviewsResponseData])
async def get_product_reviews(
    product_id: int,
    page: int = Query(1, ge=1),
    limit: int = Query(5, ge=1),
    filter_type: str = Query("all", enum=["all", "highest", "lowest", "unanswered"]),
    db: Session = Depends(get_db)
):
    # 1. Check Product Exist
    p = db.query(Product).filter(Product.ProductID == product_id).first()
    if not p: raise HTTPException(404, "Product not found")

    # 2. Calculate Summary (AVG & Distribution)
    # Lấy tất cả review để tính toán thống kê chính xác
    all_reviews = db.query(ProductReview.Rating).filter(ProductReview.ProductID == product_id).all()
    
    total_reviews = len(all_reviews)
    avg_rating = 0.0
    dist = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
    
    if total_reviews > 0:
        total_score = 0
        for r in all_reviews:
            r_val = r.Rating or 0
            if 1 <= r_val <= 5:
                dist[r_val] += 1
            total_score += r_val
        avg_rating = round(total_score / total_reviews, 1)

    # 3. Query Reviews for List (Apply Filter & Pagination)
    query = db.query(ProductReview).filter(ProductReview.ProductID == product_id)
    
    if filter_type == "highest":
        query = query.order_by(desc(ProductReview.Rating))
    elif filter_type == "lowest":
        query = query.order_by(ProductReview.Rating.asc())
    elif filter_type == "unanswered":
        query = query.filter(ProductReview.ReplyContent == None)
    else: # all -> Newest first
        query = query.order_by(desc(ProductReview.ReviewDate))
        
    reviews_db = query.offset((page - 1) * limit).limit(limit).all()

    # 4. Map to Schema
    review_items = []
    for r in reviews_db:
        # User Info
        u_name = r.ReviewerName or "Guest"
        u_id = "GUEST"
        u_avatar = None
        if r.customer:
            u_name = f"{r.customer.FirstName} {r.customer.LastName}"
            u_id = f"CUS-{r.CustomerID}"
            u_avatar = r.customer.AvatarURL
            
        # Admin Reply
        reply_data = None
        if r.ReplyContent:
            reply_data = AdminReplyData(
                replied_at=r.ReplyDate or datetime.now(),
                content=r.ReplyContent
            )
            
        # Images (Giả sử DB lưu chuỗi split by comma)
        imgs = []
        if r.ReviewImage:
            imgs = [i.strip() for i in r.ReviewImage.split(",")]

        review_items.append(ReviewItem(
            id=f"REV-{r.ProductReviewID}",
            user=ReviewUser(id=u_id, username=u_name, avatar_url=u_avatar),
            rating=r.Rating or 0,
            created_at=r.ReviewDate or datetime.now(),
            content=r.Comments,
            images=imgs,
            admin_reply=reply_data,
            permissions=ReplyPermissions(can_reply=r.ReplyContent is None)
        ))

    # 5. Return
    data = ReviewsResponseData(
        summary=ReviewSummary(
            product_id=p.ProductID,
            product_name=p.Name,
            average_rating=avg_rating,
            total_reviews=total_reviews,
            rating_distribution=RatingDistribution(
                **{f"star_{k}": v for k, v in dist.items()} # Map dict keys to pydantic alias
            )
        ),
        reviews=review_items
    )
    
    return success_response(data)


# ==========================================
# 3. PROMOTIONS
# ==========================================

@admin_router.get("/promotions", response_model=PagedResponse[PromotionResponse])
async def get_promotions(
    page: int = Query(1, ge=1), 
    limit: int = Query(10, ge=1), 
    db: Session = Depends(get_db)
):
    # 1. Query DB
    query = db.query(Voucher).order_by(Voucher.VoucherID.desc())
    
    total_items = query.count()
    items_db = query.offset((page - 1) * limit).limit(limit).all()

    # 2. Map dữ liệu
    results = []
    for v in items_db:
        # Xử lý Discount Config
        if v.DiscountPercent is not None:
            d_config = DiscountConfig(type="percentage", value=v.DiscountPercent)
        else:
            d_config = DiscountConfig(type="amount", value=v.DiscountAmount or 0)

        # Xử lý Target Ranks
        t_ranks = [t.strip() for t in v.TargetRank.split(",")] if v.TargetRank else []

        results.append(PromotionResponse(
            id=v.VoucherID,
            name=v.Name or v.Code,
            code=v.Code,
            scope=v.Scope or "all",
            start_date=v.StartDate,
            end_date=v.EndDate,
            
            # --- CÁC SỬA ĐỔI QUAN TRỌNG Ở ĐÂY ---
            
            # 1. Map đúng tên field 'quantity' (thay vì usage_limit)
            quantity=v.Quantity or 0, 
            
            # 2. Map đúng tên field 'target_ranks' (thay vì target_tiers)
            target_ranks=t_ranks,
            
            # 3. Truyền đúng kiểu Boolean (thay vì string "active")
            status=bool(v.Status), 
            
            # -------------------------------------
            
            discount_config=d_config,
            min_order_amount=v.MinOrderAmount or 0,
            used_count=0 # Tạm thời chưa tính usage
        ))

    # 3. Trả về
    return manual_paginate(results, total_items, page, limit)

@admin_router.post("/promotions", response_model=APIResponse)
async def create_promotion(payload: PromotionCreate, db: Session = Depends(get_db)):
    v = Voucher(
        Name=payload.name, Code=payload.code, Scope=payload.scope,
        StartDate=payload.start_date, EndDate=payload.end_date,
        Quantity=payload.quantity,
        TargetRank=",".join(payload.target_ranks),
        Status=payload.status
    )
    if payload.discount_config.type == 'percentage':
        # DiscountPercent is Integer, convert Decimal to int
        v.DiscountPercent = int(float(payload.discount_config.value))
    else:
        # DiscountAmount is Numeric(10, 2), keep as Decimal
        v.DiscountAmount = payload.discount_config.value
        
    db.add(v)
    db.commit()
    return success_response(message="Promotion Created")

@admin_router.get("/promotions/{promotion_id}", response_model=APIResponse[PromotionResponse])
async def get_promotion_detail(promotion_id: int, db: Session = Depends(get_db)):
    # Query trực tiếp theo ID int
    v = db.query(Voucher).filter(Voucher.VoucherID == promotion_id).first()
    if not v: raise HTTPException(404, "Promotion not found")

    # Tính số lượt đã dùng
    used_count = db.query(func.count(VoucherUsage.VoucherID)).filter(VoucherUsage.VoucherID == v.VoucherID).scalar() or 0

    # Mapping dữ liệu (như đã fix ở các bước trước)
    if v.DiscountPercent is not None:
        d_config = DiscountConfig(type="percentage", value=v.DiscountPercent)
    else:
        d_config = DiscountConfig(type="amount", value=v.DiscountAmount or 0)

    t_ranks = [t.strip() for t in v.TargetRank.split(",")] if v.TargetRank else []

    data = PromotionResponse(
        id=v.VoucherID,
        name=v.Name or v.Code,
        code=v.Code,
        scope=v.Scope or "all",
        start_date=v.StartDate,
        end_date=v.EndDate,
        quantity=v.Quantity or 0,
        target_ranks=t_ranks,
        status=bool(v.Status),
        discount_config=d_config,
        min_order_amount=v.MinOrderAmount or 0,
        used_count=used_count
    )

    return success_response(data)

# 4. PATCH - UPDATE PROMOTION
@admin_router.patch("/promotions/{promotion_id}", response_model=APIResponse)
async def update_promotion(
    promotion_id: int, 
    payload: PromotionUpdate, 
    db: Session = Depends(get_db)
):
    v = db.query(Voucher).filter(Voucher.VoucherID == promotion_id).first()
    if not v: raise HTTPException(404, "Promotion not found")

    # Update Basic Fields
    if payload.name is not None: v.Name = payload.name
    if payload.code is not None: v.Code = payload.code
    if payload.scope is not None: v.Scope = payload.scope
    if payload.start_date is not None: v.StartDate = payload.start_date
    if payload.end_date is not None: v.EndDate = payload.end_date
    if payload.quantity is not None: v.Quantity = payload.quantity
    if payload.status is not None: v.Status = payload.status
    if payload.min_order_amount is not None: v.MinOrderAmount = payload.min_order_amount

    # Update Target Ranks (List -> String)
    if payload.target_ranks is not None:
        v.TargetRank = ",".join(payload.target_ranks)

    # Update Discount Config (Switch logic)
    if payload.discount_config is not None:
        if payload.discount_config.type == 'percentage':
            # DiscountPercent is Integer, convert Decimal to int
            v.DiscountPercent = int(float(payload.discount_config.value))
            v.DiscountAmount = None # Reset amount
        else:
            # DiscountAmount is Numeric(10, 2), keep as Decimal
            v.DiscountAmount = payload.discount_config.value
            v.DiscountPercent = None # Reset percent

    db.commit()
    return success_response(message="Promotion updated successfully")

# 5. DELETE PROMOTION
@admin_router.delete("/promotions/{promotion_id}", response_model=APIResponse)
async def delete_promotion(promotion_id: int, db: Session = Depends(get_db)):
    v = db.query(Voucher).filter(Voucher.VoucherID == promotion_id).first()
    if not v: raise HTTPException(404, "Promotion not found")

    # Kiểm tra xem Voucher đã được sử dụng chưa
    has_usage = db.query(VoucherUsage).filter(VoucherUsage.VoucherID == promotion_id).first()

    if has_usage:
        # --- SOFT DELETE ---
        # Nếu đã dùng, không xóa vật lý mà chỉ vô hiệu hóa
        v.Status = False
        v.EndDate = datetime.now() - timedelta(days=1)
        
        db.commit()
        return success_response(
            message="Promotion has usage history. It has been deactivated/expired instead of deleted."
        )
    else:
        # --- HARD DELETE ---
        db.delete(v)
        db.commit()
        return success_response(message="Promotion permanently deleted")


# ==========================================
# 4. CATEGORIES
# ==========================================

# 1. GET LIST CATEGORIES
@admin_router.get("/categories", response_model=PagedResponse[CategoryResponse])
async def get_categories(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1),
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    # 1. Base Query
    query = db.query(ProductSubcategory)
    
    if search:
        query = query.filter(ProductSubcategory.Name.ilike(f"%{search}%"))

    # 2. Pagination (Fix MSSQL order by)
    total_items = query.count()
    items_db = query.order_by(ProductSubcategory.ProductSubcategoryID.desc())\
                    .offset((page - 1) * limit).limit(limit).all()

    # 3. Map Data & Count Products
    results = []
    for cat in items_db:
        # Đếm số lượng sản phẩm thuộc danh mục này
        p_count = db.query(func.count(Product.ProductID))\
            .filter(Product.ProductSubcategoryID == cat.ProductSubcategoryID).scalar() or 0

        results.append(CategoryResponse(
            id=cat.ProductSubcategoryID,
            name=cat.Name,
            product_count=p_count
        ))

    return manual_paginate(results, total_items, page, limit)

# 2. GET CATEGORY DETAIL
@admin_router.get("/categories/{category_id}", response_model=APIResponse[CategoryResponse])
async def get_category_detail(category_id: int, db: Session = Depends(get_db)):
    cat = db.query(ProductSubcategory).filter(ProductSubcategory.ProductSubcategoryID == category_id).first()
    if not cat: 
        raise HTTPException(404, "Category not found")

    p_count = db.query(func.count(Product.ProductID))\
        .filter(Product.ProductSubcategoryID == cat.ProductSubcategoryID).scalar() or 0

    data = CategoryResponse(
        id=cat.ProductSubcategoryID,
        name=cat.Name,
        product_count=p_count
    )
    return success_response(data)

# 3. CREATE CATEGORY
@admin_router.post("/categories", response_model=APIResponse)
async def create_category(payload: CategoryCreate, db: Session = Depends(get_db)):
    # Check trùng tên
    if db.query(ProductSubcategory).filter(ProductSubcategory.Name == payload.name).first():
        raise HTTPException(400, "Category name already exists")

    # Lấy Parent Category mặc định (Bắt buộc phải có Parent mới tạo được Sub)
    # Logic: Lấy cái đầu tiên. Nếu DB trống ProductCategory thì sẽ lỗi.
    default_parent = db.query(ProductCategory).first()
    if not default_parent:
        # Nếu chưa có Parent nào, tạo tạm một cái (Optional logic)
        default_parent = ProductCategory(Name="General", ModifiedDate=datetime.now())
        db.add(default_parent)
        db.flush()

    new_cat = ProductSubcategory(
        Name=payload.name,
        ProductCategoryID=default_parent.ProductCategoryID, # Auto assign
        ModifiedDate=datetime.now()
    )
    
    db.add(new_cat)
    db.commit()

    return success_response(
        data={"id": new_cat.ProductSubcategoryID},
        message="Category created successfully"
    )

# 4. UPDATE CATEGORY
@admin_router.patch("/categories/{category_id}", response_model=APIResponse)
async def update_category(
    category_id: int, 
    payload: CategoryUpdate, 
    db: Session = Depends(get_db)
):
    cat = db.query(ProductSubcategory).filter(ProductSubcategory.ProductSubcategoryID == category_id).first()
    if not cat: 
        raise HTTPException(404, "Category not found")

    # Check trùng tên nếu đổi tên
    if payload.name != cat.Name:
        exist = db.query(ProductSubcategory).filter(ProductSubcategory.Name == payload.name).first()
        if exist:
            raise HTTPException(400, "Category name already exists")
        cat.Name = payload.name
        cat.ModifiedDate = datetime.now()

    db.commit()
    return success_response(message="Category updated successfully")

# 5. DELETE CATEGORY
@admin_router.delete("/categories/{category_id}", response_model=APIResponse)
async def delete_category(category_id: int, db: Session = Depends(get_db)):
    cat = db.query(ProductSubcategory).filter(ProductSubcategory.ProductSubcategoryID == category_id).first()
    if not cat: 
        raise HTTPException(404, "Category not found")

    # Kiểm tra ràng buộc: Nếu đang có sản phẩm thì KHÔNG cho xóa
    p_count = db.query(func.count(Product.ProductID))\
        .filter(Product.ProductSubcategoryID == category_id).scalar()
    
    if p_count > 0:
        raise HTTPException(
            status_code=400, 
            detail=f"Cannot delete category '{cat.Name}' because it contains {p_count} products. Please move or delete products first."
        )

    db.delete(cat)
    db.commit()

    return success_response(message="Category deleted successfully")


# ==========================================
# 5. CUSTOMERS
# ==========================================

@admin_router.get("/customers", response_model=PagedResponse[CustomerItem])
async def get_customers(
    page: int = Query(1, ge=1), limit: int = Query(10, ge=1),
    search: Optional[str] = None, db: Session = Depends(get_db)
):
    q = db.query(Customer)
    if search:
        q = q.filter(or_(Customer.FirstName.ilike(f"%{search}%"), Customer.LastName.ilike(f"%{search}%")))
    
    total = q.count()
    
    # --- FIX: Thêm order_by trước khi offset/limit ---
    items = q.order_by(Customer.CustomerID.desc())\
             .offset((page-1)*limit).limit(limit).all()
    
    res = []
    for c in items:
        res.append(CustomerItem(
            id=c.CustomerID,
            full_name=f"{c.FirstName} {c.LastName}",
            # Kiểm tra kỹ để tránh lỗi index nếu list rỗng
            email=c.emails[0].EmailAddress if c.emails else None,
            phone=c.phones[0].PhoneNumber if c.phones else None,
            status=c.Status,
            avatar_url=c.AvatarURL,
            stats=None 
        ))
        
    return manual_paginate(res, total, page, limit)

@admin_router.get("/customers/{customer_id}", response_model=APIResponse[CustomerDetail])
async def get_customer_detail(customer_id: int, db: Session = Depends(get_db)):
    c = db.query(Customer).filter(Customer.CustomerID == customer_id).first()
    if not c: raise HTTPException(404, "Customer not found")
    
    # Stats
    spent_buy = db.query(func.sum(SalesOrderHeader.TotalDue)).filter(SalesOrderHeader.CustomerID==c.CustomerID).scalar() or 0
    spent_rent = db.query(func.sum(RentalHeader.TotalDue)).filter(RentalHeader.CustomerID==c.CustomerID).scalar() or 0
    count_buy = db.query(func.count(SalesOrderHeader.SalesOrderID)).filter(SalesOrderHeader.CustomerID==c.CustomerID).scalar() or 0
    count_rent = db.query(func.count(RentalHeader.RentalID)).filter(RentalHeader.CustomerID==c.CustomerID).scalar() or 0
    
    rank_name = c.rank.rank_cus if c.rank else "Standard"
    score = c.rank.Final_score if c.rank else 0

    return success_response(CustomerDetail(
        id=c.CustomerID,
        full_name=f"{c.FirstName} {c.LastName}",
        email=c.emails[0].EmailAddress if c.emails else None,
        phone=c.phones[0].PhoneNumber if c.phones else None,
        status=c.Status,
        avatar_url=c.AvatarURL,
        stats=CustomerStats(total_orders=count_buy+count_rent, total_spent=spent_buy+spent_rent, rank_name=rank_name, current_score=score),
        address_list=[a.AddressLine1 for a in c.addresses],
        recent_activity=[] # Placeholder
    ))

@admin_router.get("/customers/{customer_id}/orders", response_model=PagedResponse[OrderListItem])
async def get_customer_orders(
    customer_id: int,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1),
    type: Literal['all', 'sale', 'rental'] = 'all',
    db: Session = Depends(get_db)
):
    # Check Customer exist
    cus = db.query(Customer).filter(Customer.CustomerID == customer_id).first()
    if not cus: raise HTTPException(404, "Customer not found")

    orders_list = []

    # 1. Query Sales Orders
    if type in ['all', 'sale']:
        sales = db.query(SalesOrderHeader).filter(SalesOrderHeader.CustomerID == customer_id).all()
        for s in sales:
            orders_list.append({
                "obj": s,
                "date": s.OrderDate,
                "type": "sale"
            })

    # 2. Query Rental Orders
    if type in ['all', 'rental']:
        rentals = db.query(RentalHeader).filter(RentalHeader.CustomerID == customer_id).all()
        for r in rentals:
            orders_list.append({
                "obj": r,
                "date": r.RentalDate,
                "type": "rental"
            })

    # 3. Sort & Paginate in Python
    # Vì hợp nhất 2 nguồn dữ liệu khác nhau nên sort python sẽ dễ xử lý hơn query Union phức tạp
    # Với lịch sử đơn hàng của 1 khách (thường < 1000 đơn), hiệu năng Python sort vẫn rất nhanh.
    
    # Sắp xếp mới nhất trước
    orders_list.sort(key=lambda x: x["date"], reverse=True)
    
    total_items = len(orders_list)
    
    # Slice cho phân trang
    start = (page - 1) * limit
    end = start + limit
    paged_items = orders_list[start:end]

    # 4. Map to Schema
    results = []
    for item in paged_items:
        obj = item["obj"]
        o_type = item["type"]
        
        if o_type == "sale":
            # Sales Mapping
            stt_label = str(obj.OrderStatus) # VD: Shipped, Cancelled
            total = obj.TotalDue
            o_id_str = f"ORD-{obj.SalesOrderID}"
            db_id = obj.SalesOrderID
        else:
            # Rental Mapping
            # Map status int -> label
            stt_map = {1: "Active", 2: "Completed", 3: "Overdue", 4: "Cancelled"}
            stt_label = stt_map.get(obj.Status, "Unknown")
            total = obj.TotalDue
            o_id_str = f"RENT-{obj.RentalID}"
            db_id = obj.RentalID

        results.append(OrderListItem(
            id=o_id_str,
            db_id=db_id,
            type=o_type,
            customer_name=f"{cus.FirstName} {cus.LastName}",
            created_at=item["date"],
            status=stt_label, # Raw status or Label
            status_label=stt_label,
            total_amount=total
        ))

    return manual_paginate(results, total_items, page, limit)

# 4. PATCH - UPDATE CUSTOMER STATUS
@admin_router.patch("/customers/{customer_id}", response_model=APIResponse)
async def update_customer(
    customer_id: int, 
    payload: CustomerUpdate, 
    db: Session = Depends(get_db)
):
    cus = db.query(Customer).filter(Customer.CustomerID == customer_id).first()
    if not cus: raise HTTPException(404, "Customer not found")

    # --- FIX: Map status (hỗ trợ cả String và Int) ---
    # Nếu là "active" hoặc 1 -> new_status = 1
    # Ngược lại ("banned" hoặc 0) -> new_status = 0
    new_status = 1 if payload.status in ["active", 1] else 0
    
    # Chỉ update nếu có thay đổi
    if cus.Status != new_status:
        cus.Status = new_status
        db.commit()

    # Tạo message phản hồi linh động
    msg_status = "active" if new_status == 1 else "banned"
    
    return success_response(message=f"Customer has been {msg_status}")


# ==========================================
# 6. ORDERS (Unified Sales & Rental)
# ==========================================

@admin_router.get("/orders", response_model=PagedResponse[OrderListItem])
async def get_orders(
    type: str = Query("all", enum=["all", "sale", "rental"]),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1),
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    # Strategy: Build 2 subqueries then Union
    # Select cols: id_str, db_id, type, customer, date, status, total
    
    q_sales = db.query(
        literal("sale").label("type"),
        SalesOrderHeader.SalesOrderID.label("db_id"),
        func.concat("ORD-", SalesOrderHeader.SalesOrderID).label("id_str"),
        func.concat(Customer.FirstName, " ", Customer.LastName).label("customer_name"),
        SalesOrderHeader.OrderDate.label("created_at"),
        SalesOrderHeader.OrderStatus.label("status"),
        SalesOrderHeader.TotalDue.label("total_amount")
    ).join(Customer, Customer.CustomerID == SalesOrderHeader.CustomerID)

    q_rent = db.query(
        literal("rental").label("type"),
        RentalHeader.RentalID.label("db_id"),
        func.concat("RENT-", RentalHeader.RentalID).label("id_str"),
        func.concat(Customer.FirstName, " ", Customer.LastName).label("customer_name"),
        RentalHeader.RentalDate.label("created_at"),
        func.cast(RentalHeader.Status, String).label("status"), # Cast int status to string for union compat
        RentalHeader.TotalDue.label("total_amount")
    ).join(Customer, Customer.CustomerID == RentalHeader.CustomerID)

    # Filter Type
    final_query = None
    if type == "sale":
        final_query = q_sales
    elif type == "rental":
        final_query = q_rent
    else:
        final_query = union_all(q_sales, q_rent).alias("orders_union")
        # Need to select from alias to apply limit/offset on result
        final_query = db.query(final_query)

    # Note: Search on Union is tricky, applied best on subqueries or wrapped query.
    # For brevity, implementing basic pagination on the union result.
    
    total = final_query.count()
    # Sort by created_at desc
    if type == "all":
        final_query = final_query.order_by(desc("created_at"))
    else:
        final_query = final_query.order_by(desc("created_at" if type=="sale" else "created_at")) # Name clash in simple queries resolved by ORM usually
        
    items = final_query.offset((page-1)*limit).limit(limit).all()
    
    # Map to Schema
    res_data = []
    for row in items:
        # Map Status Label
        stt = row.status
        if row.type == "rental":
            # DB stores int: 1=Active, 2=Completed
            stt = "Active" if str(row.status) == "1" else "Completed"
        
        res_data.append(OrderListItem(
            id=row.id_str,
            db_id=row.db_id,
            type=row.type,
            customer_name=row.customer_name,
            created_at=row.created_at,
            status=str(row.status),
            status_label=stt,
            total_amount=row.total_amount
        ))

    return manual_paginate(res_data, total, page, limit)

@admin_router.get("/orders/{order_id}", response_model=APIResponse[OrderDetailData])
async def get_order_detail(
    order_id: int, 
    type: str = Query(..., enum=["sale", "rental"], description="Loại đơn hàng: 'sale' hoặc 'rental'"),
    db: Session = Depends(get_db)
):
    if type == "sale":
        # 1. Xử lý Đơn Bán Hàng
        order = db.query(SalesOrderHeader).filter(SalesOrderHeader.SalesOrderID == order_id).first()
        if not order: 
            raise HTTPException(404, "Sales Order not found")
        
        items = []
        for d in order.details:
            # Lấy ảnh sản phẩm (chọn ảnh đầu tiên hoặc None)
            # Lưu ý: d.product.images là list, cần check tồn tại
            img_url = None
            if d.product.images:
                # Ưu tiên ảnh chính, nếu không có lấy ảnh đầu
                img_obj = next((img for img in d.product.images if img.IsPrimary), d.product.images[0])
                img_url = img_obj.ImageURL

            items.append(OrderItemDetail(
                product_id=d.ProductID,
                product_name=d.product.Name,
                quantity=d.OrderQty,
                unit_price=d.UnitPrice,
                total_line=d.UnitPrice * d.OrderQty,
                product_image=img_url
            ))
            
        data = OrderDetailData(
            id=f"ORD-{order.SalesOrderID}", # Response vẫn giữ prefix để frontend dễ quản lý key
            type="sale", 
            status=order.OrderStatus, 
            created_at=order.OrderDate,
            customer=OrderCustomerInfo(
                id=order.CustomerID, 
                name=f"{order.customer.FirstName} {order.customer.LastName}", 
                phone=order.customer.phones[0].PhoneNumber if order.customer.phones else None, 
                email=order.customer.emails[0].EmailAddress if order.customer.emails else None, 
                avatar=order.customer.AvatarURL
            ),
            items=items,
            subtotal=order.TotalDue - order.Freight, # Tính tạm
            freight=order.Freight,
            total_due=order.TotalDue,
            actions=OrderActionCapabilities(
                can_cancel=True, can_confirm=False, can_ship=True, can_complete=True
            )
        )

    else: 
        # 2. Xử lý Đơn Thuê
        rent = db.query(RentalHeader).filter(RentalHeader.RentalID == order_id).first()
        if not rent: 
            raise HTTPException(404, "Rental Order not found")
        
        items = []
        for d in rent.details:
            # Lấy ảnh
            img_url = None
            if d.product.images:
                img_obj = next((img for img in d.product.images if img.IsPrimary), d.product.images[0])
                img_url = img_obj.ImageURL

            items.append(OrderItemDetail(
                product_id=d.ProductID,
                product_name=d.product.Name,
                quantity=d.OrderQty,
                unit_price=d.UnitPrice,
                total_line=d.UnitPrice * d.OrderQty,
                assigned_asset_id=d.AssignedAssetID,
                condition_desc=d.ConditionDescription,
                product_image=img_url
            ))
            
        data = OrderDetailData(
            id=f"RENT-{rent.RentalID}", 
            type="rental", 
            status=str(rent.Status), # Convert int status DB sang string
            created_at=rent.RentalDate,
            customer=OrderCustomerInfo(
                id=rent.CustomerID, 
                name=f"{rent.customer.FirstName} {rent.customer.LastName}", 
                phone=rent.customer.phones[0].PhoneNumber if rent.customer.phones else None, 
                email=rent.customer.emails[0].EmailAddress if rent.customer.emails else None, 
                avatar=rent.customer.AvatarURL
            ),
            items=items,
            subtotal=rent.SubTotal or 0, 
            tax_amt=rent.TaxAmt or 0, 
            total_due=rent.TotalDue,
            rental_start=rent.RentalDate, 
            rental_end=rent.DueDate,
            actions=OrderActionCapabilities(
                can_cancel=rent.Status==1, can_confirm=False, can_ship=False, can_complete=rent.Status==1
            )
        )

    return success_response(data)

@admin_router.patch("/orders/{order_id}/status", response_model=APIResponse)
async def update_order_status(
    order_id: int, 
    payload: OrderStatusUpdate,
    type: str = Query(..., enum=["sale", "rental"]),
    db: Session = Depends(get_db)
):
    # Danh sách chuẩn từ DB (để validate)
    ALLOWED_STATUSES = [
        "Pending", "Confirmed", "Preparing", "Shipped", 
        "Delivered", "Cancelled", "Cancel Requested", 
        "Returned", "Return Requested"
    ]

    # Hàm helper chuyển input (ví dụ: "pending") -> chuẩn DB ("Pending")
    def normalize_status(inp: str):
        for s in ALLOWED_STATUSES:
            if s.lower() == inp.lower():
                return s
        return None

    new_status = normalize_status(payload.status)
    if not new_status:
        raise HTTPException(400, f"Invalid status. Allowed: {', '.join(ALLOWED_STATUSES)}")

    if type == "sale":
        order = db.query(SalesOrderHeader).filter(SalesOrderHeader.SalesOrderID == order_id).first()
        if not order: raise HTTPException(404, "Order not found")
        order.OrderStatus = new_status
        order.ModifiedDate = datetime.now()
    else:
        rent = db.query(RentalHeader).filter(RentalHeader.RentalID == order_id).first()
        if not rent: raise HTTPException(404, "Rental not found")
        rent.Status = new_status
        rent.ModifiedDate = datetime.now()
        
        # Logic phụ: Nếu là Returned thì cập nhật ngày trả
        if new_status == "Returned" and not rent.ReturnDate:
            rent.ReturnDate = datetime.now()

    db.commit()
    return success_response(message=f"Order status updated to {new_status}")

# 4. POST - REVIEW CANCELLATION (Sales Only)
@admin_router.post("/orders/{order_id}/request-review", response_model=APIResponse)
async def review_order_request(
    order_id: int, 
    payload: CancellationReview, 
    type: str = Query(..., enum=["sale", "rental"]),
    db: Session = Depends(get_db)
):
    """
    Duyệt yêu cầu từ người dùng (Hủy đơn hoặc Trả xe).
    Decision: 'accept' hoặc 'decline'.
    """
    
    # === 1. XỬ LÝ ĐƠN BÁN (SALES) ===
    if type == "sale":
        order = db.query(SalesOrderHeader).filter(SalesOrderHeader.SalesOrderID == order_id).first()
        if not order: raise HTTPException(404, "Order not found")

        # Kiểm tra xem có yêu cầu nào không
        # Logic: Có ngày yêu cầu hủy HOẶC status đang là 'Cancel Requested'
        is_requesting = order.CancellationRequestDate is not None or order.OrderStatus == "Cancel Requested"
        
        if not is_requesting:
            raise HTTPException(400, "This order has no pending request")

        if payload.decision == "accept":
            # Chấp thuận -> Hủy đơn
            order.OrderStatus = "Cancelled"
            # TODO: Trigger logic hoàn tiền ở đây
        else:
            # Từ chối -> Quay về trạng thái 'Pending' hoặc 'Confirmed'
            # Ở đây ta set về 'Confirmed' (Approved) để an toàn
            order.OrderStatus = "Confirmed"
            
            # Xóa thông tin yêu cầu
            order.CancellationRequestDate = None
            order.CancellationReason = None

        order.ModifiedDate = datetime.now()
        db.commit()
        return success_response(message=f"Sales order request {payload.decision}ed")

    # === 2. XỬ LÝ ĐƠN THUÊ (RENTAL) ===
    else:
        rent = db.query(RentalHeader).filter(RentalHeader.RentalID == order_id).first()
        if not rent: raise HTTPException(404, "Rental not found")
        
        current_status = rent.Status # String: 'Cancel Requested', 'Return Requested'...

        # -- TRƯỜNG HỢP A: YÊU CẦU HỦY (Cancel Requested) --
        if current_status == "Cancel Requested":
            if payload.decision == "accept":
                rent.Status = "Cancelled"
                # TODO: Trigger logic hoàn cọc/phí phạt
            else:
                # Từ chối hủy -> Quay về Confirmed (để tiếp tục quy trình)
                rent.Status = "Confirmed"
        
        # -- TRƯỜNG HỢP B: YÊU CẦU TRẢ XE (Return Requested) --
        elif current_status == "Return Requested":
            if payload.decision == "accept":
                rent.Status = "Returned"
                rent.ReturnDate = datetime.now() # Ghi nhận thời điểm trả
                # TODO: Trigger tính toán phí quá hạn hoặc hư hại
            else:
                # Từ chối trả (VD: Xe hỏng nặng cần đền bù chưa xong) -> Quay về Confirmed (Vẫn đang thuê)
                rent.Status = "Confirmed" 
        
        else:
            raise HTTPException(400, f"No pending request found for this rental (Current status: {current_status})")

        rent.ModifiedDate = datetime.now()
        db.commit()
        
        return success_response(message=f"Rental request {payload.decision}ed")

# 5. POST - RENTAL PREPARATION (Rental Only)
@admin_router.post("/orders/{order_id}/rental-preparation", response_model=APIResponse)
async def prepare_rental_item(
    order_id: int, 
    payload: RentalPreparation, 
    db: Session = Depends(get_db)
):
    # 1. Validate Order & Status Check
    rent = db.query(RentalHeader).filter(RentalHeader.RentalID == order_id).first()
    if not rent: raise HTTPException(404, "Rental order not found")
    
    # --- UPDATE 1: Chặn sửa nếu đơn đã kết thúc hoặc chưa xác nhận ---
    # Chỉ cho phép chuẩn bị khi đơn là 'Confirmed' hoặc đang 'Preparing'
    allowed_statuses = ["Confirmed", "Preparing"]
    if rent.Status not in allowed_statuses:
        raise HTTPException(
            status_code=400, 
            detail=f"Cannot update preparation details when order is '{rent.Status}'. Request must be Confirmed or Preparing."
        )

    # 2. Validate Item Detail
    detail = db.query(RentalDetail).filter(
        RentalDetail.RentalDetailID == payload.order_item_id,
        RentalDetail.RentalID == order_id
    ).first()
    
    if not detail: raise HTTPException(404, "Rental item not found in this order")

    # 3. Cập nhật thông tin giao xe
    detail.AssignedAssetID = payload.inventory_asset_id
    
    if payload.description:
        detail.ConditionDescription = payload.description
        
    if payload.evidence_photos:
        detail.EvidencePhotos = ",".join(payload.evidence_photos)

    # --- UPDATE 2: Tự động chuyển trạng thái đơn sang 'Preparing' ---
    # Nếu đơn đang chỉ mới 'Confirmed', chuyển sang 'Preparing' để đánh dấu tiến độ
    if rent.Status == "Confirmed":
        rent.Status = "Preparing"
        rent.ModifiedDate = datetime.now()

    db.commit()
    
    return success_response(message="Rental item prepared and assigned successfully")


# ==========================================
# 7. STAFF
# ==========================================

@admin_router.get("/staffs", response_model=PagedResponse[StaffResponse])
async def get_staffs(
    page: int = Query(1, ge=1), 
    limit: int = Query(10, ge=1), 
    db: Session = Depends(get_db)
):
    # 1. Query DB (Có sort để fix lỗi MSSQL)
    query = db.query(Employee).order_by(Employee.BusinessEntityID.desc())
    
    total_items = query.count()
    items_db = query.offset((page - 1) * limit).limit(limit).all()

    # 2. Map dữ liệu
    results = []
    for emp in items_db:
        # Map Role
        if emp.GroupName == "Product Staff":
            role_key = "product_staff"
            role_lbl = "Product Staff"
        else:
            role_key = "order_staff"
            role_lbl = "Order Staff"

        # Map Status
        is_active = emp.EndDate is None
        stt_key = "active" if is_active else "inactive"
        stt_lbl = "Active" if is_active else "Inactive"

        results.append(StaffResponse(
            id=f"STF-{emp.BusinessEntityID:03d}",
            full_name=emp.FullName,
            email=emp.EmailAddress,
            phone_number=emp.PhoneNumber,
            
            # --- QUAN TRỌNG: Phải truyền 2 dòng này ---
            group_name=emp.GroupName,      
            department=emp.DepartmentName, 
            # ------------------------------------------

            role=role_key,
            role_label=role_lbl,
            status=stt_key,
            status_label=stt_lbl,
            avatar_url=None
        ))

    return manual_paginate(results, total_items, page, limit)

@admin_router.post("/staffs", response_model=APIResponse)
async def create_staff(payload: StaffCreateRequest, db: Session = Depends(get_db)):
    # 1. Check Email trùng
    if db.query(Employee).filter(Employee.EmailAddress == payload.email).first():
        raise HTTPException(status_code=400, detail="Email already exists")

    # 2. Hash Password (using Argon2 to match login verification)
    pwd_hash = get_password_hash(payload.password)

    # 3. Map Input -> DB Fields
    
    # Map Role -> GroupName
    group_name = "Product Staff" if payload.role == "product_staff" else "Order Staff"
    
    # --- FIX: Map Status -> EndDate ---
    # Nếu active -> EndDate là None
    # Nếu inactive -> EndDate là ngày hiện tại
    end_date_val = None
    if payload.status == "inactive":
        end_date_val = date.today()

    # 4. Generate ID (Max + 1)
    max_id = db.query(func.max(Employee.BusinessEntityID)).scalar() or 0
    new_id = max_id + 1

    # 5. Tạo Employee
    new_emp = Employee(
        BusinessEntityID=new_id,
        FullName=payload.full_name,
        PhoneNumber=payload.phone_number,
        EmailAddress=payload.email,
        
        GroupName=group_name,
        DepartmentName="Operations", # Giá trị mặc định hoặc từ payload
        
        # --- FIX: Dùng EndDate thay vì IsActive ---
        EndDate=end_date_val, 
        # -----------------------------------------
        
        PasswordSalt=pwd_hash,
        
        # Các trường ngày tháng mặc định (hoặc lấy từ payload nếu có)
        BirthDate=date(2000, 1, 1), 
        StartDate=date.today()
    )

    db.add(new_emp)
    db.commit()

    return success_response(
        data={"id": new_id}, 
        message="Staff created successfully"
    )

@admin_router.get("/staffs/{staff_id}", response_model=APIResponse[StaffResponse])
async def get_staff_detail(staff_id: str, db: Session = Depends(get_db)):
    # Parse staff_id from either integer or 'STF-XXX' format
    parsed_id = parse_staff_id(staff_id)
    emp = db.query(Employee).filter(Employee.BusinessEntityID == parsed_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Staff not found")

    # Map Role
    if emp.GroupName == "Product Staff":
        role_key = "product_staff"
        role_lbl = "Product Staff"
    else:
        role_key = "order_staff"
        role_lbl = "Order Staff"

    # Map Status (Dựa trên EndDate)
    is_active = emp.EndDate is None
    stt_key = "active" if is_active else "inactive"
    stt_lbl = "Active" if is_active else "Inactive"

    data = StaffResponse(
        # Output vẫn format đẹp để hiển thị, nhưng input URL là số
        id=f"STF-{emp.BusinessEntityID:03d}",
        full_name=emp.FullName,
        email=emp.EmailAddress,
        phone_number=emp.PhoneNumber,
        group_name=emp.GroupName,
        department=emp.DepartmentName,
        role=role_key,
        role_label=role_lbl,
        status=stt_key,
        status_label=stt_lbl,
        avatar_url=None
    )

    return success_response(data)

# 4. PATCH - UPDATE STAFF
@admin_router.patch("/staffs/{staff_id}", response_model=APIResponse)
async def update_staff(
    staff_id: str, 
    payload: StaffUpdateRequest, 
    db: Session = Depends(get_db)
):
    # Parse staff_id from either integer or 'STF-XXX' format
    parsed_id = parse_staff_id(staff_id)
    emp = db.query(Employee).filter(Employee.BusinessEntityID == parsed_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Staff not found")

    # 1. Update Basic Info
    if payload.full_name is not None: emp.FullName = payload.full_name
    if payload.phone_number is not None: emp.PhoneNumber = payload.phone_number
    if payload.email is not None:
        # Check trùng email nếu đổi email
        if payload.email != emp.EmailAddress:
            exist = db.query(Employee).filter(Employee.EmailAddress == payload.email).first()
            if exist: raise HTTPException(400, "Email already exists")
            emp.EmailAddress = payload.email

    # 2. Update Role (GroupName)
    if payload.role is not None:
        emp.GroupName = "Product Staff" if payload.role == "product_staff" else "Order Staff"
    
    # 3. Update Status (EndDate)
    if payload.status is not None:
        if payload.status == "active":
            emp.EndDate = None # Active lại
        else:
            emp.EndDate = date.today() # Inactive (Nghỉ việc)

    # 4. Update Password (Optional) - using Argon2 to match login verification
    if payload.password and payload.password.strip():
        emp.PasswordSalt = get_password_hash(payload.password)

    db.commit()
    return success_response(message="Staff updated successfully")

# 5. DELETE STAFF
@admin_router.delete("/staffs/{staff_id}", response_model=APIResponse)
async def delete_staff(staff_id: str, db: Session = Depends(get_db)):
    # Parse staff_id from either integer or 'STF-XXX' format
    parsed_id = parse_staff_id(staff_id)
    emp = db.query(Employee).filter(Employee.BusinessEntityID == parsed_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Staff not found")

    # Xóa cứng (Hard Delete)
    try:
        db.delete(emp)
        db.commit()
    except Exception as e:
        db.rollback()
        # Nếu lỗi ràng buộc khóa ngoại, gợi ý Soft Delete
        raise HTTPException(
            status_code=400, 
            detail="Cannot delete staff. This staff might be linked to other records. Try deactivating (set status to inactive) instead."
        )

    return success_response(message="Staff deleted successfully")


# ==========================================
# 8. RENTAL SETTINGS
# ==========================================

# 1. GET SETTINGS
@admin_router.get("/settings/rental", response_model=APIResponse[RentalSettingsData])
async def get_rental_settings(db: Session = Depends(get_db)):
    # Luôn lấy config ID = 1
    config = db.query(RentalConfiguration).filter(RentalConfiguration.ConfigID == 1).first()
    
    # Giá trị mặc định nếu DB chưa có
    data = RentalSettingsData(
        duration_limits=DurationLimits(min_days=1, max_days=30),
        deposit=DepositConfig(default_rate=80.0),
        penalty=PenaltyConfig(overdue_fee_rate=150.0, cancellation_policy="flexible"),
        rent_to_own=RentToOwnConfig(enabled=True, rent_deduction=100.0)
    )

    # Nếu DB có dữ liệu -> Override
    if config:
        data.duration_limits.min_days = config.MinRentalDays
        data.duration_limits.max_days = config.MaxRentalDays
        data.deposit.default_rate = float(config.DefaultDepositRate)
        data.penalty.overdue_fee_rate = float(config.OverdueFeeRate)
        data.penalty.cancellation_policy = config.CancellationPolicy
        data.rent_to_own.enabled = config.IsRentToOwnEnabled
        data.rent_to_own.rent_deduction = float(config.RentDeductionRate)

    return success_response(data)


# 2. UPDATE SETTINGS
@admin_router.patch("/settings/rental", response_model=APIResponse)
async def update_rental_settings(
    payload: RentalSettingsUpdate, 
    db: Session = Depends(get_db)
):
    config = db.query(RentalConfiguration).filter(RentalConfiguration.ConfigID == 1).first()
    
    if not config:
        # Nếu chưa có -> Tạo mới
        config = RentalConfiguration(ConfigID=1, ModifiedDate=datetime.now())
        db.add(config)

    # Update từng phần nếu có trong payload
    if payload.duration_limits:
        config.MinRentalDays = payload.duration_limits.min_days
        config.MaxRentalDays = payload.duration_limits.max_days
    
    if payload.deposit:
        config.DefaultDepositRate = payload.deposit.default_rate
        
    if payload.penalty:
        config.OverdueFeeRate = payload.penalty.overdue_fee_rate
        config.CancellationPolicy = payload.penalty.cancellation_policy
        
    if payload.rent_to_own:
        config.IsRentToOwnEnabled = payload.rent_to_own.enabled
        config.RentDeductionRate = payload.rent_to_own.rent_deduction

    config.ModifiedDate = datetime.now()
    db.commit()

    return success_response(message="Rental configuration updated successfully")


# ==========================================
# 9. FAQS
# ==========================================

# 1. GET LIST FAQS
@admin_router.get("/faqs", response_model=PagedResponse[FAQResponse])
async def get_faqs(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1),
    search: Optional[str] = None,
    status: Optional[str] = Query(None, enum=["active", "inactive"]),
    db: Session = Depends(get_db)
):
    query = db.query(FAQ)

    # Filter Search
    if search:
        search_term = f"%{search}%"
        query = query.filter(or_(
            FAQ.Question.ilike(search_term),
            FAQ.Answer.ilike(search_term),
            FAQ.Keywords.ilike(search_term)
        ))

    # Filter Status
    if status:
        is_active = True if status == "active" else False
        query = query.filter(FAQ.IsActive == is_active)

    # Pagination (Sort by ID desc)
    total_items = query.count()
    items_db = query.order_by(FAQ.FAQID.desc())\
                    .offset((page - 1) * limit).limit(limit).all()

    # Map Data
    results = []
    for f in items_db:
        # Parse keywords (str -> list)
        kw_list = [k.strip() for k in f.Keywords.split(",")] if f.Keywords else []
        
        # Status
        stt_key = "active" if f.IsActive else "inactive"
        stt_lbl = "Active" if f.IsActive else "Inactive"
        
        # Preview (cắt 50 ký tự)
        preview = f.Answer[:50] + "..." if len(f.Answer) > 50 else f.Answer

        results.append(FAQResponse(
            id=f"FAQ-{f.FAQID:03d}",
            question=f.Question,
            answer=f.Answer,
            answer_preview=preview,
            keywords=kw_list,
            status=stt_key,
            status_label=stt_lbl
        ))

    return manual_paginate(results, total_items, page, limit)

# 2. CREATE FAQ
@admin_router.post("/faqs", response_model=APIResponse)
async def create_faq(payload: FAQCreate, db: Session = Depends(get_db)):
    # FastAPI đã decode JSON đúng UTF-8, chỉ cần đảm bảo là string
    question = payload.question if isinstance(payload.question, str) else str(payload.question)
    answer = payload.answer if isinstance(payload.answer, str) else str(payload.answer)
    
    # Convert List -> String (key1,key2)
    keywords_list = [k if isinstance(k, str) else str(k) for k in payload.keywords] if payload.keywords else []
    kw_str = ",".join(keywords_list)
    
    is_active = True if payload.status == "active" else False

    new_faq = FAQ(
        Question=question,
        Answer=answer,
        Keywords=kw_str,
        IsActive=is_active,
        ModifiedDate=datetime.now()
    )
    
    db.add(new_faq)
    db.commit()

    return success_response(message="FAQ created successfully")

# 3. GET FAQ DETAIL
@admin_router.get("/faqs/{faq_id}", response_model=APIResponse[FAQResponse])
async def get_faq_detail(faq_id: str, db: Session = Depends(get_db)):
    # Parse faq_id from either integer or 'FAQ-XXX' format
    parsed_id = parse_faq_id(faq_id)
    f = db.query(FAQ).filter(FAQ.FAQID == parsed_id).first()
    if not f: raise HTTPException(404, "FAQ not found")

    kw_list = [k.strip() for k in f.Keywords.split(",")] if f.Keywords else []
    stt_key = "active" if f.IsActive else "inactive"
    stt_lbl = "Active" if f.IsActive else "Inactive"

    data = FAQResponse(
        id=f"FAQ-{f.FAQID:03d}",
        question=f.Question,
        answer=f.Answer,
        answer_preview=f.Answer, # Detail lấy full
        keywords=kw_list,
        status=stt_key,
        status_label=stt_lbl
    )
    return success_response(data)

# 4. UPDATE FAQ
@admin_router.patch("/faqs/{faq_id}", response_model=APIResponse)
async def update_faq(
    faq_id: str, 
    payload: FAQUpdate, 
    db: Session = Depends(get_db)
):
    # Đảm bảo tất cả string được encode đúng UTF-8
    from ...helper import ensure_utf8_string
    
    # Parse faq_id from either integer or 'FAQ-XXX' format
    parsed_id = parse_faq_id(faq_id)
    f = db.query(FAQ).filter(FAQ.FAQID == parsed_id).first()
    if not f: raise HTTPException(404, "FAQ not found")

    # Normalize strings trước khi lưu
    if payload.question is not None: 
        f.Question = ensure_utf8_string(payload.question)
    if payload.answer is not None: 
        f.Answer = ensure_utf8_string(payload.answer)
    
    # Update Keywords
    if payload.keywords is not None:
        keywords_list = [ensure_utf8_string(k) for k in payload.keywords]
        f.Keywords = ",".join(keywords_list)
        
    # Update Status
    if payload.status is not None:
        f.IsActive = True if payload.status == "active" else False

    f.ModifiedDate = datetime.now()
    db.commit()

    return success_response(message="FAQ updated successfully")

# 5. DELETE FAQ
@admin_router.delete("/faqs/{faq_id}", response_model=APIResponse)
async def delete_faq(faq_id: str, db: Session = Depends(get_db)):
    # Parse faq_id from either integer or 'FAQ-XXX' format
    parsed_id = parse_faq_id(faq_id)
    f = db.query(FAQ).filter(FAQ.FAQID == parsed_id).first()
    if not f: raise HTTPException(404, "FAQ not found")

    db.delete(f)
    db.commit()

    return success_response(message="FAQ deleted successfully")