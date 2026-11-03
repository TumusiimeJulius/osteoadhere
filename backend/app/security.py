import hashlib
import secrets

import bcrypt


# ============================================================
# PASSWORD HASHING
# ============================================================

def hash_password(password: str) -> str:

    password_bytes = password.encode("utf-8")

    salt = bcrypt.gensalt()

    hashed = bcrypt.hashpw(
        password_bytes,
        salt
    )

    return hashed.decode("utf-8")


def verify_password(
    password: str,
    password_hash: str
) -> bool:

    password_bytes = password.encode("utf-8")
    hash_bytes = password_hash.encode("utf-8")

    return bcrypt.checkpw(
        password_bytes,
        hash_bytes
    )


# ============================================================
# OTP GENERATION
# ============================================================

def generate_otp() -> str:

    return f"{secrets.randbelow(1000000):06d}"


# ============================================================
# OTP HASHING
# ============================================================

def hash_otp(otp: str) -> str:

    return hashlib.sha256(
        otp.encode("utf-8")
    ).hexdigest()


def verify_otp(
    otp: str,
    otp_hash: str
) -> bool:

    return secrets.compare_digest(
        hash_otp(otp),
        otp_hash
    )