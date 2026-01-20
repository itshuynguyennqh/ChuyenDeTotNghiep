from math import ceil
from typing import Type, TypeVar, List, Any, Optional, Generic, TypeVar
from sqlalchemy.orm import Query as SQLQuery
from pydantic import BaseModel
import hashlib
import uuid
from decimal import Decimal

T = TypeVar('T')

# ==========================================
# 1. CORE & SHARED (Response Wrappers)
# ==========================================

class SortOrder(str):
    ASC = "asc"
    DESC = "desc"

class PaginationMeta(BaseModel):
    total_items: int
    total_pages: int
    current_page: int
    limit: int

class PagedResponse(BaseModel, Generic[T]):
    """Wrapper chuẩn cho danh sách có phân trang"""
    status: str = "success"
    code: int = 200
    data: List[T]
    pagination: PaginationMeta

class APIResponse(BaseModel, Generic[T]):
    """Wrapper chuẩn cho object đơn lẻ hoặc thông báo"""
    status: str = "success"
    code: int = 200
    data: Optional[T] = None
    message: Optional[str] = None

class ImageItem(BaseModel):
    url: str
    is_primary: bool = False
    caption: Optional[str] = None

def paginate(
    query: SQLQuery,
    page: int,
    limit: int,
    schema: Type[T]
) -> PagedResponse[T]:
    """
    Hàm chuẩn hóa phân trang cho SQLAlchemy Query
    """
    total_items = query.count()
    total_pages = ceil(total_items / limit) if limit > 0 else 0
    
    # Get items
    items_db = query.offset((page - 1) * limit).limit(limit).all()
    
    # Validate & Map data using Pydantic (from_attributes=True)
    data = [schema.model_validate(item) for item in items_db]
    
    meta = PaginationMeta(
        total_items=total_items,
        total_pages=total_pages,
        current_page=page,
        limit=limit
    )
    
    return PagedResponse(
        status="success",
        code=200,
        data=data,
        pagination=meta
    )

def manual_paginate(
    items: List[Any],
    total_items: int,
    page: int,
    limit: int
) -> PagedResponse:
    """
    Hàm phân trang cho các query phức tạp (như Union) hoặc List có sẵn
    """
    total_pages = ceil(total_items / limit) if limit > 0 else 0
    
    meta = PaginationMeta(
        total_items=total_items,
        total_pages=total_pages,
        current_page=page,
        limit=limit
    )
    
    return PagedResponse(
        status="success",
        code=200,
        data=items,
        pagination=meta
    )

def success_response(data: Any = None, message: str = None) -> APIResponse:
    """Wrapper cho response đơn lẻ"""
    return APIResponse(
        status="success",
        code=200,
        data=data,
        message=message
    )

def generate_hash(password: str, salt: str = None):
    """Hash password helper"""
    if not salt:
        salt = uuid.uuid4().hex
    hashed = hashlib.sha256((password + salt).encode('utf-8')).hexdigest()
    return hashed, salt
