from pydantic import BaseModel, EmailStr, Field
from typing import Optional


# Login Request/Response
class LoginRequest(BaseModel):
    identifier: str = Field(..., description="Email hoặc số điện thoại")
    password: str = Field(..., description="Mật khẩu")


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str = Field(..., description="Vai trò: customer, admin, staff")
    name: str
    id: int


# Register Request/Response
class RegisterRequest(BaseModel):
    first_name: str = Field(..., description="Tên")
    last_name: str = Field(..., description="Họ")
    email: EmailStr = Field(..., description="Email")
    phone: str = Field(..., description="Số điện thoại")
    password: str = Field(..., min_length=6, description="Mật khẩu (tối thiểu 6 ký tự)")


class RegisterResponse(BaseModel):
    message: str


# Verify Registration Request/Response
class VerifyRegistrationRequest(BaseModel):
    email: EmailStr = Field(..., description="Email đăng ký")
    otp: str = Field(..., description="Mã OTP")


class VerifyRegistrationResponse(BaseModel):
    message: str
    customer_id: int


# Forgot Password Request/Response
class ForgotPasswordRequest(BaseModel):
    email: EmailStr = Field(..., description="Email tài khoản")


class ForgotPasswordResponse(BaseModel):
    message: str


# Reset Password Request/Response
class ResetPasswordRequest(BaseModel):
    email: EmailStr = Field(..., description="Email tài khoản")
    otp: str = Field(..., description="Mã OTP")
    new_password: str = Field(..., min_length=6, description="Mật khẩu mới (tối thiểu 6 ký tự)")


class ResetPasswordResponse(BaseModel):
    message: str
