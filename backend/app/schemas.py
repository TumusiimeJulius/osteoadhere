from pydantic import BaseModel, EmailStr, Field


# ============================================================
# REGISTRATION
# ============================================================

class RegisterRequest(BaseModel):

    full_name: str = Field(
        min_length=2,
        max_length=150
    )

    email: EmailStr

    phone_number: str = Field(
        min_length=7,
        max_length=30
    )

    country: str = Field(
        min_length=2,
        max_length=100
    )

    password: str = Field(
        min_length=8,
        max_length=128
    )

    confirm_password: str = Field(
        min_length=8,
        max_length=128
    )


# ============================================================
# EMAIL VERIFICATION
# ============================================================

class VerifyEmailRequest(BaseModel):

    email: EmailStr

    otp: str = Field(
        min_length=6,
        max_length=6
    )


# ============================================================
# RESEND EMAIL OTP
# ============================================================

class ResendVerificationRequest(BaseModel):

    email: EmailStr


# ============================================================
# LOGIN
# ============================================================

class LoginRequest(BaseModel):

    email: EmailStr

    password: str


# ============================================================
# FORGOT PASSWORD
# ============================================================

class ForgotPasswordRequest(BaseModel):

    email: EmailStr


# ============================================================
# VERIFY PASSWORD RESET OTP
# ============================================================

class VerifyResetOTPRequest(BaseModel):

    email: EmailStr

    otp: str = Field(
        min_length=6,
        max_length=6
    )


# ============================================================
# RESET PASSWORD
# ============================================================

class ResetPasswordRequest(BaseModel):

    email: EmailStr

    otp: str = Field(
        min_length=6,
        max_length=6
    )

    new_password: str = Field(
        min_length=8,
        max_length=128
    )

    confirm_password: str = Field(
        min_length=8,
        max_length=128
    )