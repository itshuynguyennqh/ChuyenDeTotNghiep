from sqlalchemy.orm import Session
from sqlalchemy import or_
from fastapi import HTTPException, status
from datetime import datetime
from app.models.customer import Customer, CustomerEmailAddress, CustomerPhone, CustomerPassword
from app.models.employee import Employees
from app.models.auth import AuthUser
from app.utils.security import verify_password, get_password_hash, create_access_token
from app.services.otp_service import generate_otp, store_otp, verify_otp, remove_otp, get_otp_data
from app.services.email_service import send_otp_email
from typing import Optional, Tuple
import asyncio


def authenticate_user(db: Session, identifier: str, password: str) -> Tuple[dict, str]:
    """
    Authenticate a user (customer or employee) by email/phone and password.
    
    Args:
        db: Database session
        identifier: Email or phone number
        password: Plain text password
    
    Returns:
        Tuple of (user_info dict, role string)
    
    Raises:
        HTTPException: If credentials are invalid
    """
    # Try to find customer by email or phone
    customer_email = db.query(CustomerEmailAddress).filter(
        CustomerEmailAddress.emailaddress == identifier.lower()
    ).first()
    
    customer_phone = db.query(CustomerPhone).filter(
        CustomerPhone.phonenumber == identifier
    ).first()
    
    if customer_email or customer_phone:
        # Customer authentication
        customer_id = customer_email.customerid if customer_email else customer_phone.customerid
        customer = db.query(Customer).filter(Customer.customerid == customer_id).first()
        
        if not customer:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )
        
        # Check password
        customer_pwd = db.query(CustomerPassword).filter(
            CustomerPassword.customerid == customer_id
        ).first()
        
        if not customer_pwd:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )
        
        # Verify password (assuming password is stored in passwordsalt field for now)
        # In production, this should use proper password hashing
        if not verify_password(password, customer_pwd.passwordsalt):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )
        
        full_name = f"{customer.firstname or ''} {customer.lastname or ''}".strip()
        return {
            "id": customer.customerid,
            "name": full_name,
            "role": "customer"
        }, "customer"
    
    # Try to find employee/admin by email
    auth_user = db.query(AuthUser).filter(
        or_(
            AuthUser.email == identifier.lower(),
            AuthUser.username == identifier.lower()
        )
    ).first()
    
    if auth_user:
        # Verify password
        if not verify_password(password, auth_user.password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )
        
        if not auth_user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Account is inactive"
            )
        
        # Determine role
        if auth_user.is_superuser:
            role = "admin"
        elif auth_user.is_staff:
            role = "staff"
        else:
            role = "customer"
        
        full_name = f"{auth_user.first_name} {auth_user.last_name}".strip()
        return {
            "id": auth_user.id,
            "name": full_name,
            "role": role
        }, role
    
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid credentials"
    )


def register_customer(db: Session, first_name: str, last_name: str, email: str, phone: str, password: str) -> None:
    """
    Register a new customer (without activating account - requires OTP verification).
    
    Args:
        db: Database session
        first_name: First name
        last_name: Last name
        email: Email address
        phone: Phone number
        password: Plain text password
    
    Raises:
        HTTPException: If email already exists
    """
    # Check if email already exists
    existing_email = db.query(CustomerEmailAddress).filter(
        CustomerEmailAddress.emailaddress == email.lower()
    ).first()
    
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Generate and store OTP with registration data
    otp = generate_otp()
    registration_data = {
        "first_name": first_name,
        "last_name": last_name,
        "email": email.lower(),
        "phone": phone,
        "password": get_password_hash(password)
    }
    store_otp(email.lower(), otp, purpose="registration", data=registration_data)
    
    # Send OTP email (async)
    asyncio.run(send_otp_email(email, otp, purpose="registration"))


def verify_registration_otp(db: Session, email: str, otp: str) -> int:
    """
    Verify registration OTP and create customer account.
    
    Args:
        db: Database session
        email: Email address
        otp: OTP code
    
    Returns:
        Customer ID
    
    Raises:
        HTTPException: If OTP is invalid
    """
    if not verify_otp(email.lower(), otp, purpose="registration"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OTP"
        )
    
    # Get registration data from cache
    reg_data = get_otp_data(email.lower())
    if not reg_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OTP"
        )
    
    # Create customer
    customer = Customer(
        firstname=reg_data["first_name"],
        lastname=reg_data["last_name"]
    )
    db.add(customer)
    db.flush()  # Get customer ID
    
    # Create email address
    customer_email = CustomerEmailAddress(
        customerid=customer.customerid,
        emailaddress=reg_data["email"],
        modifieddate=datetime.utcnow()
    )
    db.add(customer_email)
    
    # Create phone
    customer_phone = CustomerPhone(
        customerid=customer.customerid,
        phonenumber=reg_data["phone"],
        phonenumbertypeid=1,  # Default phone type
        modifieddate=datetime.utcnow()
    )
    db.add(customer_phone)
    
    # Create password
    customer_pwd = CustomerPassword(
        customerid=customer.customerid,
        passwordsalt=reg_data["password"],  # Already hashed
        modifieddate=datetime.utcnow()
    )
    db.add(customer_pwd)
    
    db.commit()
    remove_otp(email.lower())
    
    return customer.customerid


def send_password_reset_otp(db: Session, email: str) -> None:
    """
    Send OTP for password reset.
    
    Args:
        db: Database session
        email: Email address
    
    Raises:
        HTTPException: If email not found
    """
    # Check if email exists (customer or employee)
    customer_email = db.query(CustomerEmailAddress).filter(
        CustomerEmailAddress.emailaddress == email.lower()
    ).first()
    
    auth_user = db.query(AuthUser).filter(
        AuthUser.email == email.lower()
    ).first()
    
    if not customer_email and not auth_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Email not found"
        )
    
    # Generate and store OTP
    otp = generate_otp()
    store_otp(email.lower(), otp, purpose="password_reset")
    
    # Send OTP email (async)
    asyncio.run(send_otp_email(email, otp, purpose="password_reset"))


def reset_password(db: Session, email: str, otp: str, new_password: str) -> None:
    """
    Reset password after OTP verification.
    
    Args:
        db: Database session
        email: Email address
        otp: OTP code
        new_password: New plain text password
    
    Raises:
        HTTPException: If OTP is invalid or email not found
    """
    if not verify_otp(email.lower(), otp, purpose="password_reset"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OTP"
        )
    
    # Hash new password
    hashed_password = get_password_hash(new_password)
    
    # Update customer password
    customer_email = db.query(CustomerEmailAddress).filter(
        CustomerEmailAddress.emailaddress == email.lower()
    ).first()
    
    if customer_email:
        customer_pwd = db.query(CustomerPassword).filter(
            CustomerPassword.customerid == customer_email.customerid
        ).first()
        
        if customer_pwd:
            customer_pwd.passwordsalt = hashed_password
            customer_pwd.modifieddate = datetime.utcnow()
        else:
            # Create new password record
            customer_pwd = CustomerPassword(
                customerid=customer_email.customerid,
                passwordsalt=hashed_password,
                modifieddate=datetime.utcnow()
            )
            db.add(customer_pwd)
        
        db.commit()
        remove_otp(email.lower())
        return
    
    # Update employee/admin password
    auth_user = db.query(AuthUser).filter(
        AuthUser.email == email.lower()
    ).first()
    
    if auth_user:
        auth_user.password = hashed_password
        db.commit()
        remove_otp(email.lower())
        return
    
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Email not found"
    )
