import os
import smtplib

from email.message import EmailMessage
from dotenv import load_dotenv


# ============================================================
# LOAD ENVIRONMENT VARIABLES
# ============================================================

load_dotenv()


SMTP_HOST = os.getenv(
    "SMTP_HOST",
    "smtp.gmail.com"
)

SMTP_PORT = int(
    os.getenv(
        "SMTP_PORT",
        "587"
    )
)

SMTP_USERNAME = os.getenv(
    "SMTP_USERNAME"
)

SMTP_PASSWORD = os.getenv(
    "SMTP_PASSWORD"
)

SMTP_FROM_NAME = os.getenv(
    "SMTP_FROM_NAME",
    "Osteoporosis Adherence System"
)


# ============================================================
# SEND EMAIL
# ============================================================

def send_email(
    recipient_email: str,
    subject: str,
    body: str
):

    if not SMTP_USERNAME:
        raise RuntimeError(
            "SMTP_USERNAME is not configured."
        )

    if not SMTP_PASSWORD:
        raise RuntimeError(
            "SMTP_PASSWORD is not configured."
        )

    message = EmailMessage()

    message["From"] = (
        f"{SMTP_FROM_NAME} <{SMTP_USERNAME}>"
    )

    message["To"] = recipient_email

    message["Subject"] = subject

    message.set_content(body)

    with smtplib.SMTP(
        SMTP_HOST,
        SMTP_PORT
    ) as server:

        server.starttls()

        server.login(
            SMTP_USERNAME,
            SMTP_PASSWORD
        )

        server.send_message(message)


# ============================================================
# EMAIL VERIFICATION OTP
# ============================================================

def send_verification_otp(
    recipient_email: str,
    otp: str
):

    subject = (
        "Email Verification - "
        "Osteoporosis Adherence System"
    )

    body = f"""
Hello,

Thank you for registering with the Osteoporosis Treatment
Adherence Prediction System.

Your email verification OTP is:

{otp}

This OTP will expire in 10 minutes.

If you did not create this account, please ignore this email.

Regards,
Osteoporosis Adherence System
"""

    send_email(
        recipient_email,
        subject,
        body
    )


# ============================================================
# PASSWORD RESET OTP
# ============================================================

def send_password_reset_otp(
    recipient_email: str,
    otp: str
):

    subject = (
        "Password Reset OTP - "
        "Osteoporosis Adherence System"
    )

    body = f"""
Hello,

A password reset request was made for your
Osteoporosis Treatment Adherence Prediction System account.

Your password reset OTP is:

{otp}

This OTP will expire in 10 minutes.

If you did not request a password reset, please ignore
this email and do not share the OTP with anyone.

Regards,
Osteoporosis Adherence System
"""

    send_email(
        recipient_email,
        subject,
        body
    )