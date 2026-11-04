
import os

from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.database import get_db

from app.models import (
    User,
    EmailVerification,
    PasswordResetToken
)

from app.schemas import (
    RegisterRequest,
    VerifyEmailRequest,
    ResendVerificationRequest,
    LoginRequest,
    ForgotPasswordRequest,
    VerifyResetOTPRequest,
    ResetPasswordRequest
)

from app.security import (
    generate_otp,
    hash_otp,
    verify_otp,
    hash_password,
    verify_password,
    create_access_token,
    decode_access_token
)

from app.email_service import (
    send_verification_otp,
    send_password_reset_otp
)


# ============================================================
# ROUTER
# ============================================================

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


# ============================================================
# AUTHENTICATION
# ============================================================

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/auth/login"
)


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Invalid or expired authentication token.",
        headers={"WWW-Authenticate": "Bearer"}
    )

    payload = decode_access_token(token)

    if not payload:
        raise credentials_exception

    user_id = payload.get("sub")

    if not user_id or not str(user_id).isdigit():
        raise credentials_exception

    user = (
        db.query(User)
        .filter(User.id == int(user_id))
        .first()
    )

    if not user:
        raise credentials_exception

    if not user.is_active or not user.email_verified:
        raise credentials_exception

    return user


# ============================================================
# OTP EXPIRATION
# ============================================================

OTP_EXPIRATION_MINUTES = int(
    os.getenv(
        "OTP_EXPIRATION_MINUTES",
        "10"
    )
)


# ============================================================
# CURRENT UTC TIME
# ============================================================

def utc_now():
    return datetime.now(timezone.utc).replace(
        tzinfo=None
    )


# ============================================================
# REGISTER
# ============================================================

@router.post("/register")
def register(
    data: RegisterRequest,
    db: Session = Depends(get_db)
):

    if data.password != data.confirm_password:
        raise HTTPException(
            status_code=400,
            detail="Passwords do not match."
        )

    email = data.email.lower().strip()

    existing_email = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    if existing_email:
        raise HTTPException(
            status_code=400,
            detail=(
                "Email already exists. "
                "Please use another email address "
                "or log in."
            )
        )

    phone = data.phone_number.strip()

    existing_phone = (
        db.query(User)
        .filter(User.phone_number == phone)
        .first()
    )

    if existing_phone:
        raise HTTPException(
            status_code=400,
            detail=(
                "Phone number already exists. "
                "Please use another phone number."
            )
        )

    user = User(
        full_name=data.full_name.strip(),
        email=email,
        phone_number=phone,
        country=data.country.strip(),
        password_hash=hash_password(data.password),
        role="user",
        email_verified=False,
        is_active=False
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    otp = generate_otp()
    otp_hash = hash_otp(otp)

    expires_at = (
        utc_now()
        + timedelta(minutes=OTP_EXPIRATION_MINUTES)
    )

    verification = EmailVerification(
        user_id=user.id,
        otp_hash=otp_hash,
        expires_at=expires_at
    )

    db.add(verification)
    db.commit()

    try:
        send_verification_otp(
            email,
            otp
        )

    except Exception as e:

        print(
            "EMAIL ERROR DURING REGISTRATION:",
            repr(e)
        )

        db.delete(user)
        db.commit()

        raise HTTPException(
            status_code=500,
            detail=f"Email sending failed: {str(e)}"
        )

    return {
        "status": "success",
        "message": (
            "Registration successful. "
            "A verification OTP has been sent "
            "to your email address."
        ),
        "email": email
    }


# ============================================================
# VERIFY EMAIL
# ============================================================

@router.post("/verify-email")
def verify_email(
    data: VerifyEmailRequest,
    db: Session = Depends(get_db)
):

    email = data.email.lower().strip()

    user = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="Email does not exist."
        )

    if user.email_verified:
        return {
            "status": "success",
            "message": "Email is already verified."
        }

    verification = (
        db.query(EmailVerification)
        .filter(
            EmailVerification.user_id == user.id,
            EmailVerification.verified_at.is_(None)
        )
        .order_by(
            EmailVerification.created_at.desc()
        )
        .first()
    )

    if not verification:
        raise HTTPException(
            status_code=400,
            detail=(
                "No active verification OTP found. "
                "Please request a new OTP."
            )
        )

    if utc_now() > verification.expires_at:
        raise HTTPException(
            status_code=400,
            detail="OTP has expired. Please request a new OTP."
        )

    if not verify_otp(
        data.otp,
        verification.otp_hash
    ):
        raise HTTPException(
            status_code=400,
            detail="Invalid OTP."
        )

    verification.verified_at = utc_now()

    user.email_verified = True
    user.is_active = True

    db.commit()

    return {
        "status": "success",
        "message": (
            "Email verified successfully. "
            "Your account is now active."
        )
    }


# ============================================================
# RESEND VERIFICATION OTP
# ============================================================

@router.post("/resend-verification")
def resend_verification(
    data: ResendVerificationRequest,
    db: Session = Depends(get_db)
):

    email = data.email.lower().strip()

    user = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="Email does not exist."
        )

    if user.email_verified:
        raise HTTPException(
            status_code=400,
            detail="Email is already verified."
        )

    otp = generate_otp()
    otp_hash = hash_otp(otp)

    expires_at = (
        utc_now()
        + timedelta(minutes=OTP_EXPIRATION_MINUTES)
    )

    verification = EmailVerification(
        user_id=user.id,
        otp_hash=otp_hash,
        expires_at=expires_at
    )

    db.add(verification)
    db.commit()

    try:
        send_verification_otp(
            email,
            otp
        )

    except Exception as e:

        print(
            "EMAIL ERROR DURING RESEND:",
            repr(e)
        )

        raise HTTPException(
            status_code=500,
            detail=f"Email sending failed: {str(e)}"
        )

    return {
        "status": "success",
        "message": (
            "A new verification OTP has been "
            "sent to your email."
        )
    }


# ============================================================
# LOGIN
# ============================================================

@router.post("/login")
def login(
    data: LoginRequest,
    db: Session = Depends(get_db)
):

    email = data.email.lower().strip()

    user = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password."
        )

    if not verify_password(
        data.password,
        user.password_hash
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password."
        )

    if not user.email_verified:
        raise HTTPException(
            status_code=403,
            detail=(
                "Please verify your email "
                "before logging in."
            )
        )

    if not user.is_active:
        raise HTTPException(
            status_code=403,
            detail="Your account is inactive."
        )

    access_token = create_access_token({
        "sub": str(user.id)
    })

    return {
        "status": "success",
        "message": "Login successful.",
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "phone_number": user.phone_number,
            "country": user.country,
            "role": user.role,
            "trial_predictions_used": user.trial_predictions_used,
            "subscription_plan": user.subscription_plan,
            "subscription_status": user.subscription_status,
            "subscription_expires_at": (
                user.subscription_expires_at.isoformat()
                if user.subscription_expires_at
                else None
            )
        }
    }


# ============================================================
# FORGOT PASSWORD
# ============================================================

@router.post("/forgot-password")
def forgot_password(
    data: ForgotPasswordRequest,
    db: Session = Depends(get_db)
):

    email = data.email.lower().strip()

    user = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="Email does not exist."
        )

    if not user.email_verified:
        raise HTTPException(
            status_code=403,
            detail=(
                "This email has not been verified. "
                "Please verify your email first."
            )
        )

    otp = generate_otp()
    otp_hash = hash_otp(otp)

    expires_at = (
        utc_now()
        + timedelta(minutes=OTP_EXPIRATION_MINUTES)
    )

    reset_token = PasswordResetToken(
        user_id=user.id,
        otp_hash=otp_hash,
        expires_at=expires_at
    )

    db.add(reset_token)
    db.commit()

    try:
        send_password_reset_otp(
            user.email,
            otp
        )

    except Exception as e:

        print(
            "EMAIL ERROR DURING PASSWORD RESET:",
            repr(e)
        )

        raise HTTPException(
            status_code=500,
            detail=f"Password reset email failed: {str(e)}"
        )

    return {
        "status": "success",
        "message": (
            "A password reset OTP has been sent "
            "to your registered email address."
        )
    }


# ============================================================
# VERIFY RESET OTP
# ============================================================

@router.post("/verify-reset-otp")
def verify_reset_otp(
    data: VerifyResetOTPRequest,
    db: Session = Depends(get_db)
):

    email = data.email.lower().strip()

    user = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="Email does not exist."
        )

    reset_token = (
        db.query(PasswordResetToken)
        .filter(
            PasswordResetToken.user_id == user.id,
            PasswordResetToken.used_at.is_(None)
        )
        .order_by(
            PasswordResetToken.created_at.desc()
        )
        .first()
    )

    if not reset_token:
        raise HTTPException(
            status_code=400,
            detail="No active password reset OTP found."
        )

    if utc_now() > reset_token.expires_at:
        raise HTTPException(
            status_code=400,
            detail=(
                "OTP has expired. "
                "Please request a new OTP."
            )
        )

    if not verify_otp(
        data.otp,
        reset_token.otp_hash
    ):
        raise HTTPException(
            status_code=400,
            detail="Invalid OTP."
        )

    return {
        "status": "success",
        "message": (
            "OTP verified successfully. "
            "You may now reset your password."
        )
    }


# ============================================================
# RESET PASSWORD
# ============================================================

@router.post("/reset-password")
def reset_password(
    data: ResetPasswordRequest,
    db: Session = Depends(get_db)
):

    if data.new_password != data.confirm_password:
        raise HTTPException(
            status_code=400,
            detail="Passwords do not match."
        )

    email = data.email.lower().strip()

    user = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="Email does not exist."
        )

    reset_token = (
        db.query(PasswordResetToken)
        .filter(
            PasswordResetToken.user_id == user.id,
            PasswordResetToken.used_at.is_(None)
        )
        .order_by(
            PasswordResetToken.created_at.desc()
        )
        .first()
    )

    if not reset_token:
        raise HTTPException(
            status_code=400,
            detail="No active password reset OTP found."
        )

    if utc_now() > reset_token.expires_at:
        raise HTTPException(
            status_code=400,
            detail="OTP has expired."
        )

    if not verify_otp(
        data.otp,
        reset_token.otp_hash
    ):
        raise HTTPException(
            status_code=400,
            detail="Invalid OTP."
        )

    user.password_hash = hash_password(
        data.new_password
    )

    reset_token.used_at = utc_now()

    db.commit()

    return {
        "status": "success",
        "message": (
            "Password reset successfully. "
            "You can now log in with your new password."
        )
    }
