import random
import string
from datetime import datetime, timedelta
from cachetools import TTLCache
from app.config import settings
from typing import Optional, Dict, Any

# In-memory cache for OTPs (expires after OTP_EXPIRY_MINUTES)
# Format: {email: {"otp": str, "expires_at": datetime, "purpose": str, "data": dict}}
otp_cache: TTLCache = TTLCache(maxsize=1000, ttl=settings.otp_expiry_minutes * 60)


def generate_otp(length: int = 6) -> str:
    """
    Generate a random numeric OTP.
    
    Args:
        length: Length of OTP (default: 6)
    
    Returns:
        OTP string
    """
    return ''.join(random.choices(string.digits, k=length))


def store_otp(email: str, otp: str, purpose: str = "registration", data: Optional[Dict[str, Any]] = None) -> None:
    """
    Store OTP in cache with expiration.
    
    Args:
        email: Email address (key)
        otp: OTP code to store
        purpose: Purpose of OTP ('registration' or 'password_reset')
        data: Optional additional data to store (e.g., registration info)
    """
    expires_at = datetime.utcnow() + timedelta(minutes=settings.otp_expiry_minutes)
    otp_cache[email] = {
        "otp": otp,
        "expires_at": expires_at,
        "purpose": purpose,
        "data": data or {}
    }


def verify_otp(email: str, otp: str, purpose: Optional[str] = None) -> bool:
    """
    Verify OTP for an email.
    
    Args:
        email: Email address
        otp: OTP code to verify
        purpose: Optional purpose to check ('registration' or 'password_reset')
    
    Returns:
        True if OTP is valid, False otherwise
    """
    stored_data = otp_cache.get(email)
    if not stored_data:
        return False
    
    if purpose and stored_data.get("purpose") != purpose:
        return False
    
    if stored_data["otp"] != otp:
        return False
    
    if datetime.utcnow() > stored_data["expires_at"]:
        # Remove expired OTP
        otp_cache.pop(email, None)
        return False
    
    return True


def remove_otp(email: str) -> None:
    """Remove OTP from cache (after successful verification)."""
    otp_cache.pop(email, None)


def get_otp_data(email: str) -> Optional[Dict[str, Any]]:
    """
    Get stored data associated with an OTP.
    
    Args:
        email: Email address
    
    Returns:
        Stored data dictionary or None if not found
    """
    stored_data = otp_cache.get(email)
    if stored_data:
        return stored_data.get("data")
    return None
