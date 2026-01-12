from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.auth import (
    LoginRequest, LoginResponse,
    RegisterRequest, RegisterResponse,
    VerifyRegistrationRequest, VerifyRegistrationResponse,
    ForgotPasswordRequest, ForgotPasswordResponse,
    ResetPasswordRequest, ResetPasswordResponse
)
from app.services.auth_service import (
    authenticate_user,
    register_customer,
    verify_registration_otp,
    send_password_reset_otp,
    reset_password
)
from app.utils.security import create_access_token

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=LoginResponse)
async def login(
    request: LoginRequest,
    db: Session = Depends(get_db)
):
    """
    Đăng nhập cho cả Customer và Employee.
    Returns JWT token với role information.
    """
    user_info, role = authenticate_user(db, request.identifier, request.password)
    
    # Create JWT token
    access_token = create_access_token(
        data={"sub": str(user_info["id"]), "role": role}
    )
    
    return LoginResponse(
        access_token=access_token,
        token_type="bearer",
        role=role,
        name=user_info["name"],
        id=user_info["id"]
    )


@router.post("/register", response_model=RegisterResponse)
async def register(
    request: RegisterRequest,
    db: Session = Depends(get_db)
):
    """
    Đăng ký tài khoản khách hàng mới.
    Gửi OTP qua email để xác thực.
    """
    register_customer(
        db,
        request.first_name,
        request.last_name,
        request.email,
        request.phone,
        request.password
    )
    
    return RegisterResponse(
        message="Registration successful. Please check your email for OTP."
    )


@router.post("/verify-registration", response_model=VerifyRegistrationResponse)
async def verify_registration(
    request: VerifyRegistrationRequest,
    db: Session = Depends(get_db)
):
    """
    Xác thực OTP đăng ký và kích hoạt tài khoản.
    """
    customer_id = verify_registration_otp(db, request.email, request.otp)
    
    return VerifyRegistrationResponse(
        message="Account verified successfully",
        customer_id=customer_id
    )


@router.post("/forgot-password", response_model=ForgotPasswordResponse)
async def forgot_password(
    request: ForgotPasswordRequest,
    db: Session = Depends(get_db)
):
    """
    Gửi OTP quên mật khẩu qua email.
    """
    send_password_reset_otp(db, request.email)
    
    return ForgotPasswordResponse(
        message="OTP sent to your email"
    )


@router.post("/reset-password", response_model=ResetPasswordResponse)
async def reset_password_endpoint(
    request: ResetPasswordRequest,
    db: Session = Depends(get_db)
):
    """
    Đặt lại mật khẩu mới sau khi xác thực OTP.
    """
    reset_password(db, request.email, request.otp, request.new_password)
    
    return ResetPasswordResponse(
        message="Password reset successfully"
    )
