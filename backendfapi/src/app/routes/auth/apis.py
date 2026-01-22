from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from fastapi.security import OAuth2PasswordRequestForm
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from sqlalchemy.orm import Session
from sqlalchemy import or_
from passlib.context import CryptContext
from passlib.exc import UnknownHashError
from jose import jwt
from datetime import datetime, timedelta
from dotenv import load_dotenv
import random

from app.database import get_db
from app import models
from .config import (
    LoginRequest, RegisterRequest, TokenResponse, VerifyOTPRequest, ForgotPasswordRequest, ResetPasswordRequest,
    ACCESS_TOKEN_EXPIRE_MINUTES, SECRET_KEY, ALGORITHM, conf
)
load_dotenv()

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")
auth_router = APIRouter(tags=["Authentication"])

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def generate_otp():
    return str(random.randint(100000, 999999))

async def send_otp_email(email: str, otp: str, type):
    if type == "register":
        subject = "đăng ký tài khoản"  
    elif type == "forgot_password":
        subject = "thay đổi mật khẩu"

    html = f"""
    <h3>Mã xác thực {subject} Bike Go</h3>
    <p>Mã OTP của bạn là: <strong>{otp}</strong></p>
    <p>Mã này sẽ hết hạn trong 5 phút.</p>
    """
    message = MessageSchema(
        subject="Xác thực đăng ký tài khoản",
        recipients=[email],
        body=html,
        subtype=MessageType.html
    )
    fm = FastMail(conf)
    try:
        await fm.send_message(message)
    except Exception as e:
        print(f"Lỗi gửi mail: {e}")

def verify_otp(pending_user: models.PendingRegistration, verify_data: VerifyOTPRequest, db: Session = Depends(get_db)):
    if not pending_user:
        raise HTTPException(status_code=400, detail="Yêu cầu đăng ký không tồn tại hoặc đã hết hạn")

    if pending_user.OTP != verify_data.otp:
        raise HTTPException(status_code=400, detail="Mã xác thực không chính xác")

    time_diff = datetime.utcnow() - pending_user.CreatedAt
    if time_diff.total_seconds() > 300:
        db.delete(pending_user)
        db.commit()
        raise HTTPException(status_code=400, detail="Mã xác thực đã hết hạn, vui lòng đăng ký lại")

    return True

def _authenticate_user(identifier: str, password: str, db: Session):
    """Helper function to authenticate user and return token response"""
    employee = db.query(models.Employee).filter(
        or_(
            models.Employee.EmailAddress == identifier,
            models.Employee.PhoneNumber == identifier
        )
    ).first()

    if employee:
        # Check if password hash exists and is valid
        if not employee.PasswordSalt:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Thông tin đăng nhập hoặc mật khẩu không chính xác",
            )
        
        try:
            if verify_password(password, employee.PasswordSalt):
                # Map GroupName to role for frontend
                # GroupName: "Product Staff" -> role: "product_staff"
                # GroupName: "Order Staff" -> role: "order_staff"
                # Otherwise (Admin) -> role: "admin" or keep DepartmentName
                if employee.GroupName == "Product Staff":
                    role_value = "product_staff"
                elif employee.GroupName == "Order Staff":
                    role_value = "order_staff"
                else:
                    # For admin or other roles, use "admin" or DepartmentName
                    role_value = "admin"
                
                token = create_access_token(data={
                    "sub": employee.EmailAddress or employee.PhoneNumber,
                    "role": role_value,
                    "type": "employee",
                    "id": employee.BusinessEntityID
                })
                return {
                    "access_token": token,
                    "token_type": "bearer",
                    "role": role_value,
                    "name": employee.FullName,
                    "id": employee.BusinessEntityID
                }
        except UnknownHashError:
            # Handle cases where password hash format is invalid (e.g., old SHA256 format)
            # This can happen if staff was created with the old generate_hash function
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Định dạng mật khẩu không hợp lệ. Vui lòng liên hệ quản trị viên để đặt lại mật khẩu.",
            )

    customer_id = None
    
    cust_email_record = db.query(models.CustomerEmailAddress).filter(
        models.CustomerEmailAddress.EmailAddress == identifier
    ).first()

    if cust_email_record:
        customer_id = cust_email_record.CustomerID
    else:
        cust_phone_record = db.query(models.CustomerPhone).filter(
            models.CustomerPhone.PhoneNumber == identifier
        ).first()
        if cust_phone_record:
            customer_id = cust_phone_record.CustomerID

    if customer_id:
        cust_pass_record = db.query(models.CustomerPassWord).filter(
            models.CustomerPassWord.CustomerID == customer_id
        ).first()

        customer_info = db.query(models.Customer).filter(
            models.Customer.CustomerID == customer_id
        ).first()

        if cust_pass_record and customer_info:
            if verify_password(password, cust_pass_record.PasswordSalt):
                primary_email_record = db.query(models.CustomerEmailAddress).filter(
                    models.CustomerEmailAddress.CustomerID == customer_id
                ).first()
                sub_value = primary_email_record.EmailAddress if primary_email_record else identifier

                token = create_access_token(data={
                    "sub": sub_value,
                    "role": "customer",
                    "type": "customer",
                    "id": customer_info.CustomerID
                })
                
                full_name = f"{customer_info.LastName or ''} {customer_info.FirstName or ''}".strip()
                
                return {
                    "access_token": token,
                    "token_type": "bearer",
                    "role": "customer",
                    "name": full_name,
                    "id": customer_info.CustomerID
                }

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Thông tin đăng nhập hoặc mật khẩu không chính xác",
    )

@auth_router.post("/auth/token", response_model=TokenResponse)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    OAuth2 compatible token endpoint for Swagger UI.
    Uses form data with 'username' and 'password' fields.
    """
    return _authenticate_user(form_data.username, form_data.password, db)

@auth_router.post("/auth/login", response_model=TokenResponse)
async def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    """
    JSON-based login endpoint for API clients.
    Uses JSON body with 'identifier' and 'password' fields.
    """
    return _authenticate_user(login_data.identifier, login_data.password, db)

@auth_router.post("/auth/register")
async def register(
    reg_data: RegisterRequest, 
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    existing_email = db.query(models.CustomerEmailAddress).filter(
        models.CustomerEmailAddress.EmailAddress == reg_data.email
    ).first()
    if existing_email:
        raise HTTPException(status_code=400, detail="Email này đã được sử dụng")

    existing_phone = db.query(models.CustomerPhone).filter(
        models.CustomerPhone.PhoneNumber == reg_data.phone
    ).first()
    if existing_phone:
        raise HTTPException(status_code=400, detail="Số điện thoại này đã được sử dụng")

    pending_user = db.query(models.PendingRegistration).filter(
        models.PendingRegistration.Email == reg_data.email
    ).first()

    otp_code = generate_otp()
    hashed_pwd = get_password_hash(reg_data.password)

    if pending_user:
        pending_user.Phone = reg_data.phone
        pending_user.FirstName = reg_data.first_name
        pending_user.LastName = reg_data.last_name
        pending_user.PasswordHash = hashed_pwd
        pending_user.OTP = otp_code
        pending_user.CreatedAt = datetime.utcnow()
    else:
        new_pending = models.PendingRegistration(
            Email=reg_data.email,
            Phone=reg_data.phone,
            FirstName=reg_data.first_name,
            LastName=reg_data.last_name,
            PasswordHash=hashed_pwd,
            OTP=otp_code
        )
        db.add(new_pending)

    db.commit()

    background_tasks.add_task(send_otp_email, reg_data.email, otp_code, type="register")

    return {
        "message": "Mã xác thực đã được gửi đến email. Vui lòng kiểm tra và nhập mã để hoàn tất.", 
        "email": reg_data.email
    }

@auth_router.post("/auth/verify_registration")
async def verify_registration(verify_data: VerifyOTPRequest, db: Session = Depends(get_db)):
    pending_user = db.query(models.PendingRegistration).filter(
        models.PendingRegistration.Email == verify_data.email
    ).first()

    is_verified_otp = verify_otp(pending_user, verify_data, db)

    try:
        new_customer = models.Customer(
            FirstName=pending_user.FirstName,
            LastName=pending_user.LastName,
        )
        db.add(new_customer)
        db.flush()

        new_email = models.CustomerEmailAddress(
            CustomerID=new_customer.CustomerID,
            EmailAddress=pending_user.Email,
            ModifiedDate=datetime.now()
        )
        db.add(new_email)

        new_pass = models.CustomerPassWord(
            CustomerID=new_customer.CustomerID,
            PasswordSalt=pending_user.PasswordHash,
            ModifiedDate=datetime.now()
        )
        db.add(new_pass)

        new_phone = models.CustomerPhone(
            CustomerID=new_customer.CustomerID,
            PhoneNumber=pending_user.Phone,
            PhoneNumberTypeID=1,
            ModifiedDate=datetime.now()
        )
        db.add(new_phone)

        db.delete(pending_user)

        db.commit()

        return {"message": "Xác thực thành công! Tài khoản đã được tạo.", "customer_id": new_customer.CustomerID}

    except Exception as e:
        db.rollback()
        print(f"Error Verification: {e}")
        raise HTTPException(status_code=500, detail="Lỗi hệ thống khi tạo tài khoản")

@auth_router.post("/auth/forgot_password")
async def forgot_password(
    request: ForgotPasswordRequest, 
    background_tasks: BackgroundTasks, 
    db: Session = Depends(get_db)
):

    customer_email = db.query(models.CustomerEmailAddress).filter(
        models.CustomerEmailAddress.EmailAddress == request.email
    ).first()

    if not customer_email:
        raise HTTPException(status_code=404, detail="Email này chưa được đăng ký tài khoản")

    otp_code = generate_otp()

    existing_token = db.query(models.PasswordResetToken).filter(
        models.PasswordResetToken.Email == request.email,
        models.PasswordResetToken.IsUsed == False
    ).first()

    if existing_token:
        existing_token.OTP = otp_code
        existing_token.CreatedAt = datetime.utcnow()
    else:
        new_token = models.PasswordResetToken(
            Email=request.email,
            OTP=otp_code,
            CreatedAt=datetime.utcnow(),
            IsUsed=False
        )
        db.add(new_token)
    
    db.commit()

    background_tasks.add_task(send_otp_email, request.email, otp_code, type="forgot_password")

    return {"message": "Mã xác thực đã được gửi đến email của bạn."}

@auth_router.post("/auth/reset_password")
async def reset_password(
    request: ResetPasswordRequest, 
    db: Session = Depends(get_db)
):

    reset_token = db.query(models.PasswordResetToken).filter(
        models.PasswordResetToken.Email == request.email,
        models.PasswordResetToken.OTP == request.otp,
        models.PasswordResetToken.IsUsed == False
    ).first()

    if not reset_token:
        raise HTTPException(status_code=400, detail="Mã xác thực không chính xác hoặc đã được sử dụng")

    time_diff = datetime.utcnow() - reset_token.CreatedAt
    if time_diff.total_seconds() > 300:
        raise HTTPException(status_code=400, detail="Mã xác thực đã hết hạn, vui lòng yêu cầu lại")

    cust_email_record = db.query(models.CustomerEmailAddress).filter(
        models.CustomerEmailAddress.EmailAddress == request.email
    ).first()
    
    if not cust_email_record:
        raise HTTPException(status_code=404, detail="Không tìm thấy tài khoản người dùng")

    cust_pass_record = db.query(models.CustomerPassWord).filter(
        models.CustomerPassWord.CustomerID == cust_email_record.CustomerID
    ).first()

    new_hash = get_password_hash(request.new_password)

    if cust_pass_record:
        cust_pass_record.PasswordSalt = new_hash
        cust_pass_record.ModifiedDate = datetime.now()
    else:
        new_pass_entry = models.CustomerPassWord(
            CustomerID=cust_email_record.CustomerID,
            PasswordSalt=new_hash,
            ModifiedDate=datetime.now()
        )
        db.add(new_pass_entry)

    reset_token.IsUsed = True
    
    db.commit()

    return {"message": "Đổi mật khẩu thành công. Bạn có thể đăng nhập ngay bây giờ."}