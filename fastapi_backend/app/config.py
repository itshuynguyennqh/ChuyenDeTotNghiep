from typing import List
import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    # Database Configuration
    database_server: str = os.getenv("DATABASE_SERVER", "localhost\\SQLEXPRESS")
    database_name: str = os.getenv("DATABASE_NAME", "final_project_getout")
    database_user: str = os.getenv("DATABASE_USER", "sa1")
    database_password: str = os.getenv("DATABASE_PASSWORD", "2611")
    database_port: str = os.getenv("DATABASE_PORT", "1433")
    database_driver: str = os.getenv("DATABASE_DRIVER", "ODBC Driver 17 for SQL Server")
    
    # JWT Configuration
    secret_key: str = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
    algorithm: str = os.getenv("ALGORITHM", "HS256")
    access_token_expire_minutes: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
    
    # SMTP Configuration
    smtp_host: str = os.getenv("SMTP_HOST", "smtp.gmail.com")
    smtp_port: int = int(os.getenv("SMTP_PORT", "587"))
    smtp_user: str = os.getenv("SMTP_USER", "")
    smtp_password: str = os.getenv("SMTP_PASSWORD", "")
    smtp_from_email: str = os.getenv("SMTP_FROM_EMAIL", "")
    smtp_use_tls: bool = os.getenv("SMTP_USE_TLS", "true").lower() == "true"
    
    # Application Configuration
    base_url: str = os.getenv("BASE_URL", "http://localhost:8000")
    cors_origins: List[str] = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:5173").split(",")
    
    # OTP Configuration
    otp_expiry_minutes: int = int(os.getenv("OTP_EXPIRY_MINUTES", "10"))
    
    @property
    def database_url(self) -> str:
        """Generate SQL Server connection string"""
        return (
            f"mssql+pyodbc://{self.database_user}:{self.database_password}"
            f"@{self.database_server}:{self.database_port}/{self.database_name}"
            f"?driver={self.database_driver.replace(' ', '+')}"
        )


settings = Settings()
