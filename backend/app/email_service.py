import os
import json
import urllib.request
import urllib.error

from dotenv import load_dotenv

load_dotenv()

BREVO_API_KEY = os.getenv("BREVO_API_KEY")
BREVO_SENDER_EMAIL = os.getenv("BREVO_SENDER_EMAIL")
BREVO_SENDER_NAME = os.getenv(
    "BREVO_SENDER_NAME",
    "OsteoAdhere"
)


def send_email(
    recipient_email: str,
    subject: str,
    body: str
):

    if not BREVO_API_KEY:
        raise RuntimeError(
            "BREVO_API_KEY is not configured."
        )

    if not BREVO_SENDER_EMAIL:
        raise RuntimeError(
            "BREVO_SENDER_EMAIL is not configured."
        )

    payload = {
        "sender": {
            "name": BREVO_SENDER_NAME,
            "email": BREVO_SENDER_EMAIL
        },
        "to": [
            {
                "email": recipient_email
            }
        ],
        "subject": subject,
        "textContent": body
    }

    request = urllib.request.Request(
        "https://api.brevo.com/v3/smtp/email",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "accept": "application/json",
            "api-key": BREVO_API_KEY,
            "content-type": "application/json"
        },
        method="POST"
    )

    try:
        with urllib.request.urlopen(
            request,
            timeout=30
        ) as response:
            return json.loads(
                response.read().decode("utf-8")
            )

    except urllib.error.HTTPError as error:
        details = error.read().decode("utf-8")
        raise RuntimeError(
            f"Brevo email API error: {details}"
        ) from error

    except urllib.error.URLError as error:
        raise RuntimeError(
            f"Could not connect to Brevo: {error.reason}"
        ) from error


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