
from datetime import datetime

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String
)

from sqlalchemy.orm import relationship

from app.database import Base


# ============================================================
# USERS
# ============================================================

class User(Base):

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    full_name = Column(String(150), nullable=False)

    email = Column(
        String(255),
        nullable=False,
        unique=True,
        index=True
    )

    phone_number = Column(
        String(30),
        nullable=False,
        unique=True,
        index=True
    )

    country = Column(String(100), nullable=False)

    password_hash = Column(String(255), nullable=False)

    role = Column(
        String(50),
        nullable=False,
        default="user"
    )

    email_verified = Column(
        Boolean,
        nullable=False,
        default=False
    )

    is_active = Column(
        Boolean,
        nullable=False,
        default=False
    )

    # SUBSCRIPTION AND FREE TRIAL

    trial_predictions_used = Column(
        Integer,
        nullable=False,
        default=0
    )

    subscription_plan = Column(
        String(30),
        nullable=False,
        default="free"
    )

    subscription_status = Column(
        String(30),
        nullable=False,
        default="trial"
    )

    subscription_expires_at = Column(
        DateTime,
        nullable=True
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False
    )

    email_verifications = relationship(
        "EmailVerification",
        back_populates="user",
        cascade="all, delete-orphan"
    )

    password_reset_tokens = relationship(
        "PasswordResetToken",
        back_populates="user",
        cascade="all, delete-orphan"
    )

    patients = relationship(
        "Patient",
        back_populates="created_by"
    )


# ============================================================
# EMAIL VERIFICATION OTP
# ============================================================

class EmailVerification(Base):

    __tablename__ = "email_verifications"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    otp_hash = Column(String(255), nullable=False)

    expires_at = Column(DateTime, nullable=False)

    verified_at = Column(DateTime, nullable=True)

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    user = relationship(
        "User",
        back_populates="email_verifications"
    )


# ============================================================
# PASSWORD RESET OTP
# ============================================================

class PasswordResetToken(Base):

    __tablename__ = "password_reset_tokens"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    otp_hash = Column(String(255), nullable=False)

    expires_at = Column(DateTime, nullable=False)

    used_at = Column(DateTime, nullable=True)

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    user = relationship(
        "User",
        back_populates="password_reset_tokens"
    )


# ============================================================
# PATIENTS
# ============================================================

class Patient(Base):

    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)

    patient_code = Column(
        String(100),
        nullable=False,
        unique=True,
        index=True
    )

    age_years = Column(Integer, nullable=False)

    sex = Column(String(30), nullable=False)

    osteoporosis_treatment = Column(String(100), nullable=False)

    treatment_duration_months = Column(Integer, nullable=False)

    previous_fracture = Column(String(20), nullable=False)

    functional_status = Column(String(100), nullable=True)

    followup_attendance = Column(String(100), nullable=False)

    side_effects = Column(String(100), nullable=True)

    medication_cost_burden = Column(String(100), nullable=False)

    distance_to_clinic_km = Column(Float, nullable=True)

    caregiver_support = Column(String(100), nullable=True)

    missed_doses_last_30_days = Column(Integer, nullable=False)

    health_education = Column(String(100), nullable=True)

    created_by_user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=True
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    created_by = relationship(
        "User",
        back_populates="patients"
    )

    predictions = relationship(
        "Prediction",
        back_populates="patient",
        cascade="all, delete-orphan"
    )


# ============================================================
# PREDICTIONS
# ============================================================

class Prediction(Base):

    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)

    patient_id = Column(
        Integer,
        ForeignKey("patients.id"),
        nullable=False
    )

    logistic_prediction = Column(String(50), nullable=False)

    logistic_probability_adherent = Column(Float, nullable=False)

    logistic_probability_non_adherent = Column(Float, nullable=False)

    svm_prediction = Column(String(50), nullable=False)

    svm_probability_adherent = Column(Float, nullable=False)

    svm_probability_non_adherent = Column(Float, nullable=False)

    gradient_prediction = Column(String(50), nullable=False)

    gradient_probability_adherent = Column(Float, nullable=False)

    gradient_probability_non_adherent = Column(Float, nullable=False)

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    patient = relationship(
        "Patient",
        back_populates="predictions"
    )
