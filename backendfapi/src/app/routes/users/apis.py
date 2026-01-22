from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from sqlalchemy import desc, select
from jose import JWTError, jwt
from datetime import datetime
from typing import List

from app.routes.auth.config import SECRET_KEY, ALGORITHM
from app.database import get_db
from app.models import *
from .config import * 
from ...helper import *

users_router = APIRouter(prefix="/user", tags=["User"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")

# ==========================================
# 0. AUTH DEPENDENCY
# ==========================================
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> Customer:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("id")
        role: str = payload.get("role")
        if user_id is None or role != "customer":
             raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(Customer).filter(Customer.CustomerID == user_id).first()
    if user is None:
        raise credentials_exception
    return user

# ==========================================
# 1. PROFILE PROFILE
# ==========================================
@users_router.get("/profile", response_model=APIResponse[UserProfileResponse])
def get_profile(current_user: Customer = Depends(get_current_user), db: Session = Depends(get_db)):
    # Lấy thông tin email và phone (Do tách bảng)
    email_record = db.query(CustomerEmailAddress).filter(CustomerEmailAddress.CustomerID == current_user.CustomerID).first()
    phone_record = db.query(CustomerPhone).filter(CustomerPhone.CustomerID == current_user.CustomerID).first()
    
    data = UserProfileResponse(
        first_name=current_user.FirstName,
        last_name=current_user.LastName,
        email=email_record.EmailAddress if email_record else None,
        phone=phone_record.PhoneNumber if phone_record else None,
        avatar_url=current_user.AvatarURL
    )
    return success_response(data=data)

@users_router.patch("/profile", response_model=APIResponse)
def update_profile(
    profile_data: ProfileUpdate, 
    current_user: Customer = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    if profile_data.first_name: current_user.FirstName = profile_data.first_name
    if profile_data.last_name: current_user.LastName = profile_data.last_name
    if profile_data.avatar_url: current_user.AvatarURL = profile_data.avatar_url
    
    if profile_data.phone:
        phone_record = db.query(CustomerPhone).filter(CustomerPhone.CustomerID == current_user.CustomerID).first()
        if phone_record:
            phone_record.PhoneNumber = profile_data.phone
            phone_record.ModifiedDate = datetime.utcnow()
        else:
            # Tạo mới nếu chưa có
            new_phone = CustomerPhone(
                CustomerID=current_user.CustomerID,
                PhoneNumber=profile_data.phone,
                PhoneNumberTypeID=1, # Giả định 1 là Mobile
                ModifiedDate=datetime.utcnow()
            )
            db.add(new_phone)

    db.commit()
    return success_response(message="Profile updated successfully")

# ==========================================
# 2. ADDRESS MANAGEMENT (CRUD)
# ==========================================

# --- HELPER: Reset Default Address ---
def _reset_default_address(db: Session, customer_id: int):
    """Set tất cả địa chỉ của user về IsDefault = False"""
    db.query(CustomerAdress).filter(
        CustomerAdress.CustomerID == customer_id
    ).update({"IsDefault": False})
    # Không commit ở đây để dùng chung transaction với hàm gọi nó

@users_router.get("/addresses", response_model=APIResponse[List[AddressResponse]])
def get_addresses(
    current_user: Customer = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Lấy danh sách địa chỉ, sắp xếp Default lên đầu"""
    addresses = db.query(CustomerAdress).filter(
        CustomerAdress.CustomerID == current_user.CustomerID
    ).order_by(desc(CustomerAdress.IsDefault), desc(CustomerAdress.ModifiedDate)).all()

    # Mapping thủ công hoặc dùng from_attributes của Pydantic
    data = [
        AddressResponse(
            address_id=addr.AddressID,
            address_line1=addr.AddressLine1,
            city=addr.City,
            postal_code=addr.PostalCode,
            phone_number=addr.PhoneNumber or current_user.phones[0].PhoneNumber if current_user.phones else "", # Fallback sđt chính
            is_default=addr.IsDefault
        ) for addr in addresses
    ]
    return success_response(data=data)

@users_router.post("/addresses", response_model=APIResponse[AddressResponse])
def create_address(
    payload: AddressCreate,
    current_user: Customer = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # 1. Nếu user set địa chỉ này là default, bỏ default các cái cũ
    if payload.is_default:
        _reset_default_address(db, current_user.CustomerID)
    else:
        # Nếu đây là địa chỉ đầu tiên, bắt buộc set default
        count = db.query(CustomerAdress).filter(CustomerAdress.CustomerID == current_user.CustomerID).count()
        if count == 0:
            payload.is_default = True

    # 2. Tạo mới
    new_addr = CustomerAdress(
        CustomerID=current_user.CustomerID,
        AddressLine1=payload.address_line1,
        City=payload.city,
        PostalCode=payload.postal_code,
        PhoneNumber=payload.phone_number,
        IsDefault=payload.is_default,
        ModifiedDate=datetime.utcnow()
    )
    db.add(new_addr)
    db.commit()
    db.refresh(new_addr)

    # 3. Map response
    response_data = AddressResponse(
        address_id=new_addr.AddressID,
        address_line1=new_addr.AddressLine1,
        city=new_addr.City,
        postal_code=new_addr.PostalCode,
        phone_number=new_addr.PhoneNumber,
        is_default=new_addr.IsDefault
    )
    return success_response(message="Address created successfully", data=response_data)

@users_router.patch("/addresses/{address_id}", response_model=APIResponse)
def update_address(
    address_id: int,
    payload: AddressUpdate,
    current_user: Customer = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # 1. Tìm địa chỉ & Check quyền sở hữu
    address = db.query(CustomerAdress).filter(
        CustomerAdress.AddressID == address_id,
        CustomerAdress.CustomerID == current_user.CustomerID
    ).first()

    if not address:
        raise HTTPException(status_code=404, detail="Address not found")

    # 2. Xử lý Logic Default
    if payload.is_default is True:
        _reset_default_address(db, current_user.CustomerID)
        address.IsDefault = True
    
    # 3. Update các trường khác
    if payload.address_line1: address.AddressLine1 = payload.address_line1
    if payload.city: address.City = payload.city
    if payload.postal_code: address.PostalCode = payload.postal_code
    if payload.phone_number: address.PhoneNumber = payload.phone_number
    if payload.is_default is not None: address.IsDefault = payload.is_default

    address.ModifiedDate = datetime.utcnow()
    db.commit()

    return success_response(message="Address updated successfully")

@users_router.delete("/addresses/{address_id}", response_model=APIResponse)
def delete_address(
    address_id: int,
    current_user: Customer = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    address = db.query(CustomerAdress).filter(
        CustomerAdress.AddressID == address_id,
        CustomerAdress.CustomerID == current_user.CustomerID
    ).first()

    if not address:
        raise HTTPException(status_code=404, detail="Address not found")
    
    # Không cho xóa nếu là địa chỉ mặc định (Logic nghiệp vụ thông thường)
    if address.IsDefault:
        raise HTTPException(status_code=400, detail="Cannot delete default address. Please set another address as default first.")

    db.delete(address)
    db.commit()
    return success_response(message="Address deleted successfully")