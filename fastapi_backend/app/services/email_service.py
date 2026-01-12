import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.config import settings
from typing import Optional


async def send_email(
    to_email: str,
    subject: str,
    body: str,
    html_body: Optional[str] = None
) -> bool:
    """
    Send an email using SMTP.
    
    Args:
        to_email: Recipient email address
        subject: Email subject
        body: Plain text email body
        html_body: Optional HTML email body
    
    Returns:
        True if email was sent successfully, False otherwise
    """
    if not settings.smtp_user or not settings.smtp_password:
        # If SMTP is not configured, log and return False
        print(f"SMTP not configured. Would send email to {to_email} with subject: {subject}")
        return False
    
    try:
        message = MIMEMultipart("alternative")
        message["Subject"] = subject
        message["From"] = settings.smtp_from_email or settings.smtp_user
        message["To"] = to_email
        
        # Add plain text part
        text_part = MIMEText(body, "plain")
        message.attach(text_part)
        
        # Add HTML part if provided
        if html_body:
            html_part = MIMEText(html_body, "html")
            message.attach(html_part)
        
        # Send email
        await aiosmtplib.send(
            message,
            hostname=settings.smtp_host,
            port=settings.smtp_port,
            username=settings.smtp_user,
            password=settings.smtp_password,
            use_tls=settings.smtp_use_tls,
        )
        return True
    except Exception as e:
        print(f"Error sending email: {e}")
        return False


async def send_otp_email(to_email: str, otp: str, purpose: str = "registration") -> bool:
    """
    Send OTP email for registration or password reset.
    
    Args:
        to_email: Recipient email address
        otp: OTP code to send
        purpose: Purpose of OTP ('registration' or 'password_reset')
    
    Returns:
        True if email was sent successfully, False otherwise
    """
    if purpose == "registration":
        subject = "Verify Your Registration - OTP Code"
        body = f"""
Hello,

Thank you for registering! Please use the following OTP code to verify your account:

OTP Code: {otp}

This code will expire in {settings.otp_expiry_minutes} minutes.

If you did not register, please ignore this email.

Best regards,
BikeGo Team
"""
        html_body = f"""
<html>
<body>
<h2>Verify Your Registration</h2>
<p>Thank you for registering! Please use the following OTP code to verify your account:</p>
<p style="font-size: 24px; font-weight: bold; color: #ff6600;">{otp}</p>
<p>This code will expire in {settings.otp_expiry_minutes} minutes.</p>
<p>If you did not register, please ignore this email.</p>
<p>Best regards,<br>BikeGo Team</p>
</body>
</html>
"""
    else:  # password_reset
        subject = "Password Reset - OTP Code"
        body = f"""
Hello,

You requested to reset your password. Please use the following OTP code:

OTP Code: {otp}

This code will expire in {settings.otp_expiry_minutes} minutes.

If you did not request a password reset, please ignore this email.

Best regards,
BikeGo Team
"""
        html_body = f"""
<html>
<body>
<h2>Password Reset Request</h2>
<p>You requested to reset your password. Please use the following OTP code:</p>
<p style="font-size: 24px; font-weight: bold; color: #ff6600;">{otp}</p>
<p>This code will expire in {settings.otp_expiry_minutes} minutes.</p>
<p>If you did not request a password reset, please ignore this email.</p>
<p>Best regards,<br>BikeGo Team</p>
</body>
</html>
"""
    
    return await send_email(to_email, subject, body, html_body)
