from pydantic import BaseModel, EmailStr, validator
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from dotenv import load_dotenv
import re
import os

# Load biến môi trường từ file .env (nếu có) trước khi đọc SECRET_KEY
load_dotenv()

class LoginRequest(BaseModel):
    identifier: str 
    password: str   

class RegisterRequest(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone: str
    password: str

    # Validator kiểm tra định dạng số điện thoại (Ví dụ VN: 10 số, bắt đầu bằng 0)
    @validator('phone')
    def validate_phone(cls, v):
        regex = r"(84|0[3|5|7|8|9])+([0-9]{8})\b"
        if not re.match(regex, v):
            raise ValueError('Số điện thoại không đúng định dạng Việt Nam')
        return v

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    role: str       # "customer" hoặc tên phòng ban của nhân viên
    name: str
    id: int

class VerifyOTPRequest(BaseModel):
    email: EmailStr
    otp: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    email: EmailStr
    otp: str
    new_password: str

SECRET_KEY = os.getenv("SECRET_KEY") or "CHANGE_ME_DEV_SECRET_KEY"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 30 # 30 ngày

conf = ConnectionConfig(
    MAIL_USERNAME = "nhieutien124@gmail.com",    # <--- Email SMTP để đăng nhập (có thể đổi sang email khác)
    MAIL_PASSWORD = "ygou ukit zafz vtjt",       # <--- App Password của email SMTP (Ko phải pass đăng nhập)
    MAIL_FROM = "noreply@bikego.com",            # <--- Email hiển thị là người gửi (chuyên nghiệp)
    MAIL_FROM_NAME = "BikeGo",                   # <--- Tên hiển thị khi nhận email
    MAIL_PORT = 587,
    MAIL_SERVER = "smtp.gmail.com",
    MAIL_STARTTLS = True,
    MAIL_SSL_TLS = False,
    USE_CREDENTIALS = True,
    VALIDATE_CERTS = True
)

