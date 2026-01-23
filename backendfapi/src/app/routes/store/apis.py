from fastapi import APIRouter, Depends, Query, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import select, func, desc, and_, or_
from typing import List, Optional
from datetime import datetime

from app.database import get_db
from app.models import *
from .config import * 
from ...helper import *
from app.routes.auth.config import SECRET_KEY, ALGORITHM
from jose import JWTError, jwt

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")
store_router = APIRouter(prefix="/store", tags=["Store"])

# ===================================================================
# 1. HELPER QUERIES (Reused Subqueries)
# ===================================================================
def get_product_aggregates():
    """Tạo các subquery dùng chung cho Rating, Sales, Image"""
    stmt_sales = (
        select(SalesOrderDetail.ProductID, func.sum(SalesOrderDetail.OrderQty).label("total_sold"))
        .group_by(SalesOrderDetail.ProductID).subquery()
    )
    stmt_rating = (
        select(ProductReview.ProductID, func.avg(ProductReview.Rating).label("avg_rating"))
        .group_by(ProductReview.ProductID).subquery()
    )
    stmt_image = (
        select(ProductImage.ProductID, ProductImage.ImageURL)
        .where(ProductImage.IsPrimary == True).subquery()
    )
    return stmt_sales, stmt_rating, stmt_image

def map_row_to_product_card(row):
    """Helper map DB Row -> Pydantic Schema"""
    return ProductCard(
        product_id=row.ProductID,
        name=row.Name,
        price=row.ListPrice,
        thumbnail=row.thumbnail if row.thumbnail else "https://via.placeholder.com/300?text=No+Image",
        average_rating=round(float(row.average_rating), 1) if getattr(row, 'average_rating', None) else 0.0,
        total_sold=int(row.total_sold) if getattr(row, 'total_sold', None) else 0,
        condition=getattr(row, 'Condition', None),
        size=getattr(row, 'Size', None),
        color=getattr(row, 'Color', None),
        rent_price=getattr(row, 'RentPrice', None),
        is_rentable=getattr(row, 'IsRentable', False) if getattr(row, 'IsRentable', None) is not None else False
    )

# ===================================================================
# 2. PRODUCT ENDPOINTS
# ===================================================================

@store_router.get("/products/featured", response_model=APIResponse[List[ProductCard]])
def get_featured_products(db: Session = Depends(get_db)):
    stmt_sales, stmt_rating, stmt_image = get_product_aggregates()

    query = (
        select(
            Product.ProductID, Product.Name, Product.ListPrice,
            Product.RentPrice, Product.IsRentable,
            stmt_image.c.ImageURL.label("thumbnail"),
            func.coalesce(stmt_rating.c.avg_rating, 0).label("average_rating"),
            func.coalesce(stmt_sales.c.total_sold, 0).label("total_sold")
        )
        .outerjoin(stmt_sales, Product.ProductID == stmt_sales.c.ProductID)
        .outerjoin(stmt_rating, Product.ProductID == stmt_rating.c.ProductID)
        .outerjoin(stmt_image, Product.ProductID == stmt_image.c.ProductID)
        .order_by(desc("total_sold"))
        .limit(4)
    )

    results = db.execute(query).all()
    data = [map_row_to_product_card(row) for row in results]
    
    return success_response(data=data)


@store_router.get("/products/search", response_model=PagedResponse[ProductCard])
def search_products(
    category_id: Optional[int] = Query(None),
    condition: Optional[str] = Query(None),
    price_range: Optional[str] = Query(None),
    sizes: Optional[List[str]] = Query(None, alias="size"),
    colors: Optional[List[str]] = Query(None, alias="color"),
    min_rating: Optional[float] = Query(None, ge=0, le=5),
    search: Optional[str] = Query(None),
    is_rentable: Optional[bool] = Query(None, description="Filter by rentable products"),
    page: int = Query(1, ge=1),
    limit: int = Query(12, ge=1),
    db: Session = Depends(get_db)
):
    stmt_sales, stmt_rating, stmt_image = get_product_aggregates()

    # Base Query
    query = (
        select(
            Product.ProductID, Product.Name, Product.ListPrice, 
            Product.Condition, Product.Size, Product.Color,
            Product.RentPrice, Product.IsRentable,
            stmt_image.c.ImageURL.label("thumbnail"),
            func.coalesce(stmt_rating.c.avg_rating, 0).label("average_rating"),
            func.coalesce(stmt_sales.c.total_sold, 0).label("total_sold")
        )
        .outerjoin(stmt_rating, Product.ProductID == stmt_rating.c.ProductID)
        .outerjoin(stmt_sales, Product.ProductID == stmt_sales.c.ProductID)
        .outerjoin(stmt_image, Product.ProductID == stmt_image.c.ProductID)
    )

    # --- Filters ---
    filters = []
    if category_id: filters.append(Product.ProductSubcategoryID == category_id)
    if condition: filters.append(Product.Condition == condition)
    if sizes: filters.append(Product.Size.in_(sizes))
    if colors:
        # Case-insensitive color filter for SQL Server
        # Create case variations to handle different case formats in database
        color_conditions = []
        for color in colors:
            # Create case variations: "Blue", "blue", "BLUE", "Blue"
            color_variations = [color, color.lower(), color.upper(), color.capitalize()]
            for color_var in color_variations:
                color_conditions.append(Product.Color == color_var)
        if color_conditions:
            filters.append(or_(*color_conditions))
    if search: filters.append(Product.Name.ilike(f"%{search}%"))
    if is_rentable is not None:
        if is_rentable:
            # Rentable Only: IsRentable == True
            filters.append(Product.IsRentable == True)
        else:
            # Buy Only: IsRentable == False OR IsRentable IS NULL (default is False)
            filters.append(or_(Product.IsRentable == False, Product.IsRentable.is_(None)))
    
    if price_range:
        if price_range == "under 1000": filters.append(Product.ListPrice < 1000)
        elif price_range == "1000-2000": filters.append(and_(Product.ListPrice >= 1000, Product.ListPrice <= 2000))
        elif price_range == "2000-3000": filters.append(and_(Product.ListPrice >= 2000, Product.ListPrice <= 3000))
        elif price_range == "above 3000": filters.append(Product.ListPrice > 3000)

    if min_rating:
        filters.append(func.coalesce(stmt_rating.c.avg_rating, 0) >= min_rating)

    if filters:
        query = query.where(and_(*filters))

    # --- Pagination Logic (Manual for Complex Query) ---
    # 1. Count Total
    count_query = select(func.count()).select_from(query.subquery())
    total_items = db.execute(count_query).scalar()

    # 2. Get Data
    query = query.order_by(desc("total_sold"))
    query = query.offset((page - 1) * limit).limit(limit)
    results = db.execute(query).all()

    # 3. Map Data
    items = [map_row_to_product_card(row) for row in results]

    return manual_paginate(items, total_items, page, limit)


@store_router.get("/products/{product_id}/detail", response_model=APIResponse[ProductDetail])
def get_product_detail(product_id: int, db: Session = Depends(get_db)):
    # 1. Query Product
    product = db.query(Product).options(
        joinedload(Product.images)
    ).filter(Product.ProductID == product_id).first()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # 2. Logic lấy Variants (Giữ nguyên)
    variants_data = []
    
    def map_variant(p):
        return VariantItem(
            product_id=p.ProductID,
            color=p.Color,
            size=p.Size,
            condition=p.Condition,
            price=p.ListPrice,
            is_rentable=p.IsRentable if p.IsRentable is not None else False,
            rent_price=p.RentPrice
        )

    if product.ProductModelID:
        siblings = db.query(Product).filter(Product.ProductModelID == product.ProductModelID).all()
        variants_data = [map_variant(p) for p in siblings]
    else:
        variants_data.append(map_variant(product))

    # 3. Map Images (Giữ nguyên - Dùng cách thủ công để tránh lỗi Validate)
    images_dto = []
    for img in product.images:
        images_dto.append(ProductImageItem(
            image_id=img.ImageID,
            url=img.ImageURL,
            is_primary=img.IsPrimary if img.IsPrimary is not None else False,
            caption=img.Caption
        ))

    # 4. Map Rental Info (Giữ nguyên)
    rental_info_dto = RentalInfo(
        is_rentable=product.IsRentable if product.IsRentable is not None else False,
        rent_price=product.RentPrice,
        rent_unit=product.RentalPeriodUnit if product.RentalPeriodUnit else "day",
        security_deposit=product.SecurityDeposit if product.SecurityDeposit else 0
    )

    # 5. [NEW] Map Specification Info
    # Lấy dữ liệu trực tiếp từ các cột có sẵn trong bảng Product
    specs_dto = ProductSpecs(
        model=product.ProductNumber, # Dùng ProductNumber làm Model code
        color=product.Color,
        frame_material=product.FrameMaterial,
        frame_size=product.FrameSize,
        wheel_size=product.WheelSize,
        suspension=product.Suspension
    )

    # 6. Construct Final Response
    detail = ProductDetail(
        product_id=product.ProductID,
        name=product.Name,
        price=product.ListPrice,
        description=product.Description,
        thumbnail=images_dto[0].url if images_dto else None,
        images=images_dto,
        variants=variants_data,
        rental_info=rental_info_dto,
        specs=specs_dto # <--- Gán vào đây
    )
    
    return success_response(data=detail)


@store_router.get("/products/{product_id}/reviews", response_model=ProductReviewsResponse)
def get_product_reviews(
    product_id: int,
    page: int = Query(1, ge=1, description="Trang hiện tại"),
    limit: int = Query(5, ge=1, description="Số lượng review mỗi trang"),
    db: Session = Depends(get_db)
):
    # 1. QUERY THỐNG KÊ (Tổng số dòng & Điểm trung bình)
    # Tối ưu: Chỉ 1 query để lấy cả 2 số liệu
    stats = db.query(
        func.count(ProductReview.ProductReviewID).label("total"),
        func.avg(ProductReview.Rating).label("avg")
    ).filter(ProductReview.ProductID == product_id).first()

    total_items = stats.total if stats else 0
    avg_rating = round(float(stats.avg), 1) if stats and stats.avg else 0.0

    # 2. QUERY DANH SÁCH (Có phân trang)
    reviews_query = db.query(ProductReview).filter(
        ProductReview.ProductID == product_id
    ).order_by(
        desc(ProductReview.ReviewDate)
    )

    # Apply Offset/Limit
    offset = (page - 1) * limit
    reviews_db = reviews_query.offset(offset).limit(limit).all()

    # 3. MAP DB MODEL -> PYDANTIC ITEM
    # (Làm thủ công ở đây để xử lý logic tên 'Anonymous' và null check)
    review_items = [
        ReviewItem(
            username=r.ReviewerName or "Anonymous",
            rate=r.Rating,
            date=r.ReviewDate,
            comment=r.Comments,
            review_image=r.ReviewImage,
            is_helpful=r.HelpfulCount or 0
        ) for r in reviews_db
    ]

    # 4. SỬ DỤNG HELPER manual_paginate
    # Hàm này trả về PagedResponse(data=..., pagination=...)
    paged_result = manual_paginate(
        items=review_items,
        total_items=total_items,
        page=page,
        limit=limit
    )

    # 5. TRẢ VỀ KẾT QUẢ GỘP (Kết hợp phân trang + thống kê)
    # Chúng ta giải nén paged_result để đưa vào ProductReviewsResponse
    return ProductReviewsResponse(
        status=paged_result.status,
        code=paged_result.code,
        data=paged_result.data,           # List[ReviewItem]
        pagination=paged_result.pagination, # Object PaginationMeta
        
        # Các trường mở rộng thêm
        product_id=product_id,
        average_rating=avg_rating
    )

@store_router.get("/products/{product_id}/similar", response_model=APIResponse[List[ProductCard]])
def get_similar_products(product_id: int, db: Session = Depends(get_db)):
    current_product = db.query(Product.ProductSubcategoryID).filter(Product.ProductID == product_id).first()
    if not current_product or not current_product.ProductSubcategoryID:
        return success_response(data=[])

    stmt_image = select(ProductImage.ProductID, ProductImage.ImageURL).where(ProductImage.IsPrimary == True).subquery()

    query = (
        select(
            Product.ProductID, Product.Name, Product.ListPrice, 
            Product.RentPrice, Product.IsRentable,
            stmt_image.c.ImageURL.label("thumbnail")
        )
        .outerjoin(stmt_image, Product.ProductID == stmt_image.c.ProductID)
        .where(
            Product.ProductSubcategoryID == current_product.ProductSubcategoryID,
            Product.ProductID != product_id
        )
        .limit(10)
    )

    results = db.execute(query).all()
    # Map bằng helper (chỉ cần các trường cơ bản)
    data = [
        ProductCard(
            product_id=row.ProductID, name=row.Name, price=row.ListPrice,
            thumbnail=row.thumbnail or "https://via.placeholder.com/150",
            average_rating=0, total_sold=0, # Similar không cần tính nặng
            rent_price=getattr(row, 'RentPrice', None),
            is_rentable=getattr(row, 'IsRentable', False) if getattr(row, 'IsRentable', None) is not None else False
        ) for row in results
    ]
    return success_response(data=data)


# --- Helper ---
def get_or_create_cart(db: Session, customer_id: int) -> Cart:
    cart = db.query(Cart).filter(Cart.CustomerID == customer_id, Cart.Status == "Active").first()
    if not cart:
        cart = Cart(
            CustomerID=customer_id, CreatedDate=datetime.utcnow(), 
            ModifiedDate=datetime.utcnow(), Status="Active", IsCheckedOut=False
        )
        db.add(cart)
        db.commit()
        db.refresh(cart)
    return cart

def get_current_user_id(token: str = Depends(oauth2_scheme)) -> int:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # Giải mã Token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("id") # Lấy field 'id' trong payload
        
        if user_id is None:
            raise credentials_exception
        
        return user_id
    except JWTError:
        raise credentials_exception

# ===================================================================
# 1. GET: Lấy giỏ hàng
# ===================================================================

@store_router.get("/cart", response_model=APIResponse[CartSummaryResponse])
def get_my_cart(
    buy_voucher_code: Optional[str] = Query(None, description="Voucher code for buy items"),
    rent_voucher_code: Optional[str] = Query(None, description="Voucher code for rent items"),
    db: Session = Depends(get_db), 
    user_id: int = Depends(get_current_user_id)
):
    cart = get_or_create_cart(db, user_id)

    # Subquery lấy ảnh thumbnail
    stmt_image = select(ProductImage.ProductID, ProductImage.ImageURL)\
                 .where(ProductImage.IsPrimary == True).subquery()

    # Query join các bảng
    query = (
        select(
            CartItem,
            Product.Name,
            Product.ProductNumber,
            Product.Color,
            Product.Size,
            Product.Condition,
            stmt_image.c.ImageURL.label("thumbnail")
        )
        .join(Product, CartItem.ProductID == Product.ProductID)
        .outerjoin(stmt_image, Product.ProductID == stmt_image.c.ProductID)
        .where(CartItem.CartID == cart.CartID)
    )
    results = db.execute(query).all()

    items_res = []
    total_buy = Decimal(0)
    total_rent = Decimal(0)

    for row in results:
        item = row.CartItem
        
        # Cộng dồn tổng tiền
        if item.TransactionType == 'rent':
            total_rent += item.Subtotal
        else:
            total_buy += item.Subtotal

        items_res.append(CartItemResponse(
            cart_item_id=item.CartItemID,
            product_id=item.ProductID,
            product_name=row.Name,
            thumbnail=row.thumbnail or "https://via.placeholder.com/150",
            transaction_type=item.TransactionType,
            rental_days=item.RentalDays,
            quantity=item.Quantity,
            unit_price=item.UnitPrice,
            subtotal=item.Subtotal,
            variant=CartVariantInfo(
                color=row.Color, size=row.Size, 
                condition=row.Condition, model_number=row.ProductNumber
            )
        ))

    # Tính discounted amounts dựa trên voucher codes
    discounted_buy = total_buy
    discounted_rent = total_rent
    
    now = datetime.now()
    
    # Xử lý voucher cho buy items
    if buy_voucher_code and total_buy > 0:
        buy_voucher = db.query(Voucher).filter(
            Voucher.Code == buy_voucher_code,
            Voucher.Status == True,
            Voucher.StartDate <= now,
            Voucher.EndDate >= now,
            Voucher.Quantity > 0,
            or_(Voucher.Scope == 'buy', Voucher.Scope == 'all')
        ).first()
        
        if buy_voucher and total_buy >= (buy_voucher.MinOrderAmount or 0):
            # DiscountPercent là số phần trăm (ví dụ: 10 = 10%), cần chia 100 khi tính toán
            if buy_voucher.DiscountPercent:
                discount_amt = total_buy * (Decimal(buy_voucher.DiscountPercent) / 100)
            else:
                # DiscountAmount là số tiền cố định
                discount_amt = buy_voucher.DiscountAmount or Decimal(0)
            discounted_buy = max(total_buy - min(discount_amt, total_buy), Decimal(0))
    
    # Xử lý voucher cho rent items
    if rent_voucher_code and total_rent > 0:
        rent_voucher = db.query(Voucher).filter(
            Voucher.Code == rent_voucher_code,
            Voucher.Status == True,
            Voucher.StartDate <= now,
            Voucher.EndDate >= now,
            Voucher.Quantity > 0,
            or_(Voucher.Scope == 'rent', Voucher.Scope == 'all')
        ).first()
        
        if rent_voucher and total_rent >= (rent_voucher.MinOrderAmount or 0):
            # DiscountPercent là số phần trăm (ví dụ: 10 = 10%), cần chia 100 khi tính toán
            if rent_voucher.DiscountPercent:
                discount_amt = total_rent * (Decimal(rent_voucher.DiscountPercent) / 100)
            else:
                # DiscountAmount là số tiền cố định
                discount_amt = rent_voucher.DiscountAmount or Decimal(0)
            discounted_rent = max(total_rent - min(discount_amt, total_rent), Decimal(0))

    return success_response(data=CartSummaryResponse(
        cart_id=cart.CartID,
        total_items=sum(i.quantity for i in items_res),
        total_buy_amount=total_buy,
        total_rent_amount=total_rent,
        discounted_buy_amount=discounted_buy,
        discounted_rent_amount=discounted_rent,
        grand_total=total_buy + total_rent,
        items=items_res
    ))

# ===================================================================
# 2. POST: Thêm vào giỏ
# ===================================================================
@store_router.post("/cart/items", response_model=APIResponse)
def add_to_cart(
    payload: CartAddRequest,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    cart = get_or_create_cart(db, user_id)
    product = db.query(Product).filter(Product.ProductID == payload.product_id).first()
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # --- Logic tính giá ---
    unit_price = Decimal(0)
    subtotal = Decimal(0)

    if payload.transaction_type == 'rent':
        # Logic Thuê
        if not product.IsRentable:
            raise HTTPException(status_code=400, detail="Product not available for rent")
        if not product.RentPrice:
            raise HTTPException(status_code=400, detail="Rental price not set")
            
        unit_price = product.RentPrice
        # Công thức: (Giá thuê/ngày) * (Số ngày) * (Số lượng)
        subtotal = unit_price * payload.rental_days * payload.quantity
    else:
        # Logic Mua
        unit_price = product.ListPrice
        subtotal = unit_price * payload.quantity

    # --- Logic Gộp giỏ hàng (Upsert) ---
    # Điều kiện trùng: Cùng ProductID + Cùng Loại GD + (Nếu thuê thì phải cùng số ngày)
    query_filter = [
        CartItem.CartID == cart.CartID,
        CartItem.ProductID == payload.product_id,
        CartItem.TransactionType == payload.transaction_type
    ]
    
    if payload.transaction_type == 'rent':
        query_filter.append(CartItem.RentalDays == payload.rental_days)
    
    existing_item = db.query(CartItem).filter(*query_filter).first()

    if existing_item:
        existing_item.Quantity += payload.quantity
        # Subtotal is computed by the database, no need to set it manually
        existing_item.DateUpdated = datetime.utcnow()
    else:
        new_item = CartItem(
            CartID=cart.CartID,
            ProductID=payload.product_id,
            Quantity=payload.quantity,
            UnitPrice=unit_price,
            # Subtotal is computed by the database, no need to set it manually
            DateAdded=datetime.utcnow(),
            TransactionType=payload.transaction_type,
            RentalDays=payload.rental_days
        )
        db.add(new_item)

    cart.ModifiedDate = datetime.utcnow()
    db.commit()

    return success_response(message="Added to cart successfully")

# ===================================================================
# 3. PATCH: Sửa giỏ (Số lượng / Số ngày thuê)
# ===================================================================
@store_router.patch("/cart/items/{cart_item_id}", response_model=APIResponse)
def update_cart_item(
    cart_item_id: int,
    payload: CartUpdateRequest,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    item = db.query(CartItem).join(Cart).filter(
        CartItem.CartItemID == cart_item_id,
        Cart.CustomerID == user_id
    ).first()

    if not item:
        raise HTTPException(status_code=404, detail="Cart item not found")

    # Lấy giá trị hiện tại làm mặc định nếu payload không gửi lên
    new_qty = payload.quantity if payload.quantity is not None else item.Quantity
    
    # Chỉ cho phép update rental_days nếu là item thuê
    new_days = item.RentalDays
    if payload.rental_days is not None:
        if item.TransactionType == 'buy':
            raise HTTPException(status_code=400, detail="Cannot set rental days for buy items")
        new_days = payload.rental_days

    # Subtotal is computed by the database, no need to set it manually
    if item.TransactionType == 'rent':
        item.RentalDays = new_days

    item.Quantity = new_qty
    item.DateUpdated = datetime.utcnow()
    
    # Update Cart timestamp
    db.query(Cart).filter(Cart.CartID == item.CartID).update({"ModifiedDate": datetime.utcnow()})
    
    db.commit()
    return success_response(message="Cart item updated")

# ===================================================================
# 4. DELETE: Xóa khỏi giỏ
# ===================================================================
@store_router.delete("/cart/items/{cart_item_id}", response_model=APIResponse)
def remove_cart_item(
    cart_item_id: int,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    item = db.query(CartItem).join(Cart).filter(
        CartItem.CartItemID == cart_item_id,
        Cart.CustomerID == user_id
    ).first()

    if not item:
        raise HTTPException(status_code=404, detail="Cart item not found")

    db.delete(item)
    db.query(Cart).filter(Cart.CartID == item.CartID).update({"ModifiedDate": datetime.utcnow()})
    
    db.commit()
    return success_response(message="Item removed from cart")

@store_router.get("/vouchers", response_model=APIResponse[list[VoucherItem]])
def get_available_vouchers(
    scope: str = Query(None, description="Filter by scope: buy, rent, or all"),
    db: Session = Depends(get_db)
):
    """
    Lấy danh sách Voucher khả dụng (Active, Còn hạn, Còn số lượng)
    """
    now = datetime.now()

    # 1. Điều kiện cơ bản: Active + Thời gian + Số lượng
    filters = [
        Voucher.Status == True,
        Voucher.StartDate <= now,
        Voucher.EndDate >= now,
        Voucher.Quantity > 0
    ]

    # 2. Filter theo Scope (Nếu user đang xem giỏ hàng Mua hoặc Thuê)
    # Logic: Nếu user tìm 'buy', ta lấy voucher 'buy' HOẶC 'all'
    if scope:
        if scope.lower() == 'buy':
            filters.append(or_(Voucher.Scope == 'buy', Voucher.Scope == 'all'))
        elif scope.lower() == 'rent':
            filters.append(or_(Voucher.Scope == 'rent', Voucher.Scope == 'all'))

    # 3. Query DB
    vouchers_db = db.query(Voucher).filter(and_(*filters)).all()

    # 4. Map dữ liệu sang Schema
    # Xử lý logic DiscountPercent vs DiscountAmount
    # Lưu ý: discount_value khi discount_type='percentage' là số phần trăm (ví dụ: 10 = 10%)
    data = []
    for v in vouchers_db:
        # Xác định loại giảm giá
        d_type = 'percentage'
        d_value = 0
        
        if v.DiscountPercent is not None and v.DiscountPercent > 0:
            d_type = 'percentage'
            # discount_value là số phần trăm (ví dụ: 10 = 10%, cần chia 100 khi tính toán)
            d_value = v.DiscountPercent
        else:
            d_type = 'amount'
            # discount_value là số tiền cố định (ví dụ: 50.00 = $50)
            d_value = v.DiscountAmount or 0

        data.append(VoucherItem(
            voucher_id=v.VoucherID,
            code=v.Code,
            name=v.Name,
            scope=v.Scope,
            discount_type=d_type,
            discount_value=d_value,
            min_order_amount=v.MinOrderAmount or 0,
            start_date=v.StartDate,
            end_date=v.EndDate,
            target_rank=v.TargetRank
        ))

    return success_response(data=data)


def generate_order_number(prefix: str):
    # Tạo mã đơn hàng dạng SO-20231010-XXXX
    return f"{prefix}-{datetime.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:4].upper()}"

@store_router.post("/order/checkout", response_model=APIResponse[CheckoutResponse])
def create_order(
    payload: CheckoutRequest,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    # 1. Lấy Giỏ hàng
    cart = db.query(Cart).filter(Cart.CustomerID == user_id, Cart.Status == "Active").first()
    if not cart or not cart.items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    # 2. Validate Địa chỉ
    address = db.query(CustomerAdress).filter(
        CustomerAdress.AddressID == payload.address_id,
        CustomerAdress.CustomerID == user_id
    ).first()
    if not address:
        raise HTTPException(status_code=400, detail="Invalid address")

    # 3. Phân loại Item (Mua vs Thuê)
    buy_items = []
    rent_items = []
    
    # Tính tạm tính (Subtotal)
    subtotal_buy = Decimal(0)
    subtotal_rent = Decimal(0)

    for item in cart.items:
        # Giả sử đã có cột TransactionType trong Model CartItem (như bài trước)
        t_type = getattr(item, 'TransactionType', 'buy') 
        
        if t_type == 'buy':
            buy_items.append(item)
            subtotal_buy += item.Subtotal
        else:
            rent_items.append(item)
            subtotal_rent += item.Subtotal

    # 4. Xử lý Voucher (Nếu có)
    discount_buy = Decimal(0)
    discount_rent = Decimal(0)
    voucher = None

    if payload.voucher_code:
        now = datetime.now()
        voucher = db.query(Voucher).filter(
            Voucher.Code == payload.voucher_code,
            Voucher.Status == True,
            Voucher.StartDate <= now,
            Voucher.EndDate >= now,
            Voucher.Quantity > 0
        ).first()

        if not voucher:
            raise HTTPException(status_code=400, detail="Invalid or expired voucher")

        # Kiểm tra điều kiện Min Order (So với tổng cả giỏ)
        total_cart_value = subtotal_buy + subtotal_rent
        if total_cart_value < (voucher.MinOrderAmount or 0):
            raise HTTPException(status_code=400, detail=f"Order needs minimum {voucher.MinOrderAmount}")

        # Tính toán giảm giá
        # Logic: Tính tổng giảm, sau đó chia bổ cho Buy và Rent theo tỷ lệ (hoặc ưu tiên)
        # Đơn giản hóa: Nếu Scope=All -> Giảm trên tổng. Scope=Buy -> Giảm trên Buy.
        
        scope = voucher.Scope.lower() if voucher.Scope else 'all'
        applicable_amount = Decimal(0)
        
        if scope == 'buy':
            applicable_amount = subtotal_buy
        elif scope == 'rent':
            applicable_amount = subtotal_rent
        else: # all
            applicable_amount = subtotal_buy + subtotal_rent
        
        if applicable_amount > 0:
            # Tính tiền giảm
            discount_amt = Decimal(0)
            if voucher.DiscountPercent:
                discount_amt = applicable_amount * (Decimal(voucher.DiscountPercent) / 100)
            else:
                discount_amt = voucher.DiscountAmount or 0
            
            # Phân bổ discount lại cho 2 đơn (nếu tách đơn)
            # Ở đây làm đơn giản: Trừ ưu tiên vào đơn Mua trước, còn dư trừ đơn Thuê
            if scope == 'buy':
                discount_buy = min(discount_amt, subtotal_buy)
            elif scope == 'rent':
                discount_rent = min(discount_amt, subtotal_rent)
            else:
                # Nếu ALL, trừ hết vào Buy, nếu Buy ko đủ thì trừ tiếp Rent
                if subtotal_buy >= discount_amt:
                    discount_buy = discount_amt
                else:
                    discount_buy = subtotal_buy
                    discount_rent = discount_amt - subtotal_buy

    # 5. TẠO ĐƠN HÀNG (Transaction)
    created_buy_header = None
    created_rent_header = None

    try:
        # --- A. Xử lý Đơn Mua (SalesOrder) ---
        if buy_items:
            final_buy_total = max(subtotal_buy - discount_buy, Decimal(0))
            
            buy_header = SalesOrderHeader(
                CustomerID=user_id,
                OrderDate=datetime.now(),
                DueDate=datetime.now(), # Logic hạn thanh toán
                SalesOrderNumber=generate_order_number("SO"),
                TotalDue=final_buy_total,
                Freight=0, # Phí ship (có thể tính thêm logic)
                OrderStatus="Pending", # 1: InProcess
                ModifiedDate=datetime.now(),
                # Các cột mới thêm
                PaymentMethod=payload.payment_method,
                ShipAddressID=payload.address_id,
                CancellationReason=payload.note # Lưu tạm note vào đây
            )
            db.add(buy_header)
            db.flush() # Để lấy SalesOrderID
            created_buy_header = buy_header

            for item in buy_items:
                detail = SalesOrderDetail(
                    SalesOrderID=buy_header.SalesOrderID,
                    OrderQty=item.Quantity,
                    ProductID=item.ProductID,
                    UnitPrice=item.UnitPrice,
                    ModifiedDate=datetime.now()
                )
                db.add(detail)

        # --- B. Xử lý Đơn Thuê (RentalOrder) ---
        if rent_items:
            final_rent_total = max(subtotal_rent - discount_rent, Decimal(0))
            
            rent_header = RentalHeader(
                CustomerID=user_id,
                RentalDate=datetime.now(),
                # DueDate tạm tính bằng ngày hiện tại + max rental days của các item
                # Thực tế cần logic phức tạp hơn, ở đây lấy tạm +3 ngày
                DueDate=datetime.now(), 
                RentalNumber=generate_order_number("RN"),
                TotalDue=final_rent_total,
                Status=1, # 1: Pending/Active
                ModifiedDate=datetime.now(),
                # Các cột mới thêm
                PaymentMethod=payload.payment_method,
                DeliveryAddressID=payload.address_id
            )
            db.add(rent_header)
            db.flush()
            created_rent_header = rent_header

            for item in rent_items:
                # Lấy AssetID từ đâu? Lúc đặt hàng CHƯA có AssetID.
                # Admin sẽ gán AssetID khi giao xe.
                # Cần thêm logic lấy Deposit
                prod = db.query(Product).filter(Product.ProductID == item.ProductID).first()
                
                # Lưu ý: Cần lấy RentalDays từ CartItem
                r_days = getattr(item, 'RentalDays', 1)

                detail = RentalDetail(
                    RentalID=rent_header.RentalID,
                    ProductID=item.ProductID,
                    OrderQty=item.Quantity,
                    UnitPrice=item.UnitPrice, # Giá thuê 1 ngày
                    # AssignedAssetID=NULL, (Chờ Admin gán)
                    ConditionDescription="Initial Order",
                    # Lưu số ngày thuê vào đâu? 
                    # Bảng RentalDetail hiện tại chưa có cột RentalDays?
                    # Tạm thời ta chỉ lưu giá, logic ngày cần update bảng Detail sau.
                )
                db.add(detail)

        # --- C. Cập nhật Voucher & Cart ---
        if voucher:
            voucher.Quantity -= 1
            usage = VoucherUsage(
                VoucherID=voucher.VoucherID,
                CustomerID=user_id,
                # Lưu ID đơn hàng nào? Nếu tách 2 đơn thì lưu cả 2?
                # DB VoucherUsage chỉ có 1 cột OrderID. 
                # Ta ưu tiên lưu ID đơn Buy, nếu ko có thì lưu ID đơn Rent.
                OrderID=created_buy_header.SalesOrderID if created_buy_header else created_rent_header.RentalID,
                UsedDate=datetime.now()
            )
            db.add(usage)

        # Clear giỏ hàng (Chuyển trạng thái hoặc xóa)
        cart.IsCheckedOut = True
        cart.Status = "Converted"
        # Xóa items để lần sau tạo giỏ mới sạch sẽ (Hoặc giữ lại để history)
        # Ở đây ta set flag IsCheckedOut là đủ.

        db.commit()

        # --- D. Return Response ---
        return success_response(data=CheckoutResponse(
            message="Order placed successfully",
            buy_order_id=created_buy_header.SalesOrderID if created_buy_header else None,
            buy_order_number=created_buy_header.SalesOrderNumber if created_buy_header else None,
            rent_order_id=created_rent_header.RentalID if created_rent_header else None,
            rent_order_number=created_rent_header.RentalNumber if created_rent_header else None,
            total_amount=(created_buy_header.TotalDue if created_buy_header else 0) + 
                         (created_rent_header.TotalDue if created_rent_header else 0)
        ))

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
