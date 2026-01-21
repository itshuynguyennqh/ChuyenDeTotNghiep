from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional
from datetime import datetime
from decimal import Decimal

# --- PROFILE ---
class UserProfileResponse(BaseModel):
    first_name: str
    last_name: str
    email: Optional[EmailStr]
    phone: Optional[str]
    avatar_url: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class ProfileUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = None

# --- ADDRESS ---
class AddressBase(BaseModel):
    address_line1: str = Field(..., min_length=5, description="Địa chỉ cụ thể (Số nhà, đường...)")
    city: str
    postal_code: Optional[str] = None
    phone_number: str = Field(..., pattern=r'^\d{9,15}$', description="Số điện thoại liên hệ cho địa chỉ này")
    is_default: bool = False

class AddressCreate(AddressBase):
    pass

class AddressUpdate(BaseModel):
    address_line1: Optional[str] = None
    city: Optional[str] = None
    postal_code: Optional[str] = None
    phone_number: Optional[str] = None
    is_default: Optional[bool] = None

class AddressResponse(AddressBase):
    id: int = Field(..., alias="address_id")

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)
