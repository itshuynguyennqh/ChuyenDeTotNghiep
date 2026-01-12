from pydantic import BaseModel
from typing import Optional, List, Any


class SuccessResponse(BaseModel):
    success: bool = True
    message: Optional[str] = None


class PaginationParams(BaseModel):
    page: int = 1
    limit: int = 10


class PaginationInfo(BaseModel):
    page: int
    limit: int
    total_items: int
    total_pages: int
