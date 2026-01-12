from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from app.database import get_db
from app.config import settings
from app.models.auth import AuthUser
from app.models.customer import Customer
from app.models.employee import Employees
from typing import Optional

security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> dict:
    """
    Dependency to get current authenticated user from JWT token.
    Returns user info with role (customer, admin, staff).
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        token = credentials.credentials
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        user_id_raw = payload.get("sub")
        role: str = payload.get("role")
        
        if user_id_raw is None or role is None:
            raise credentials_exception
        
        # Convert user_id to int (JWT stores it as string)
        user_id = int(user_id_raw) if isinstance(user_id_raw, str) else user_id_raw
            
    except (JWTError, ValueError, TypeError):
        raise credentials_exception
    
    # Get user details based on role
    user_info = {"id": user_id, "role": role}
    
    if role == "customer":
        customer = db.query(Customer).filter(Customer.customerid == user_id).first()
        if not customer:
            raise credentials_exception
        user_info["name"] = f"{customer.firstname or ''} {customer.lastname or ''}".strip()
    elif role in ["admin", "staff"]:
        # Check auth_user table for employees
        user = db.query(AuthUser).filter(AuthUser.id == user_id).first()
        if not user:
            raise credentials_exception
        user_info["name"] = f"{user.first_name} {user.last_name}".strip()
        user_info["is_staff"] = user.is_staff
        user_info["is_superuser"] = user.is_superuser
    
    return user_info


def require_role(allowed_roles: list[str]):
    """
    Dependency factory to require specific roles.
    Usage: Depends(require_role(["admin", "staff"]))
    """
    def role_checker(current_user: dict = Depends(get_current_user)) -> dict:
        if current_user.get("role") not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions"
            )
        return current_user
    return role_checker
