from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Patient


router = APIRouter(
    prefix="/patients",
    tags=["Patients"],
)


# ============================================================
# SCHEMAS
# ============================================================

class PatientCreate(BaseModel):
    patient_code: str
    age_years: int
    sex: str
    osteoporosis_treatment: str
    treatment_duration_months: int
    previous_fracture: str
    functional_status: Optional[str] = None
    followup_attendance: str
    side_effects: Optional[str] = None
    medication_cost_burden: str
    distance_to_clinic_km: Optional[float] = None
    caregiver_support: Optional[str] = None
    missed_doses_last_30_days: int
    health_education: Optional[str] = None
    created_by_user_id: Optional[int] = None


# ============================================================
# GET ALL PATIENTS
# ============================================================

@router.get("")
def get_patients(db: Session = Depends(get_db)):

    patients = (
        db.query(Patient)
        .order_by(Patient.created_at.desc())
        .all()
    )

    return [
        {
            "id": patient.id,
            "patient_code": patient.patient_code,
            "age_years": patient.age_years,
            "sex": patient.sex,
            "osteoporosis_treatment": patient.osteoporosis_treatment,
            "treatment_duration_months": patient.treatment_duration_months,
            "previous_fracture": patient.previous_fracture,
            "functional_status": patient.functional_status,
            "followup_attendance": patient.followup_attendance,
            "side_effects": patient.side_effects,
            "medication_cost_burden": patient.medication_cost_burden,
            "distance_to_clinic_km": patient.distance_to_clinic_km,
            "caregiver_support": patient.caregiver_support,
            "missed_doses_last_30_days": patient.missed_doses_last_30_days,
            "health_education": patient.health_education,
            "created_by_user_id": patient.created_by_user_id,
            "created_at": patient.created_at,
        }
        for patient in patients
    ]


# ============================================================
# GET SINGLE PATIENT
# ============================================================

@router.get("/{patient_id}")
def get_patient(
    patient_id: int,
    db: Session = Depends(get_db),
):

    patient = (
        db.query(Patient)
        .filter(Patient.id == patient_id)
        .first()
    )

    if patient is None:
        raise HTTPException(
            status_code=404,
            detail="Patient not found.",
        )

    return {
        "id": patient.id,
        "patient_code": patient.patient_code,
        "age_years": patient.age_years,
        "sex": patient.sex,
        "osteoporosis_treatment": patient.osteoporosis_treatment,
        "treatment_duration_months": patient.treatment_duration_months,
        "previous_fracture": patient.previous_fracture,
        "functional_status": patient.functional_status,
        "followup_attendance": patient.followup_attendance,
        "side_effects": patient.side_effects,
        "medication_cost_burden": patient.medication_cost_burden,
        "distance_to_clinic_km": patient.distance_to_clinic_km,
        "caregiver_support": patient.caregiver_support,
        "missed_doses_last_30_days": patient.missed_doses_last_30_days,
        "health_education": patient.health_education,
        "created_by_user_id": patient.created_by_user_id,
        "created_at": patient.created_at,
    }


# ============================================================
# CREATE PATIENT
# ============================================================

@router.post("")
def create_patient(
    patient_data: PatientCreate,
    db: Session = Depends(get_db),
):

    existing_patient = (
        db.query(Patient)
        .filter(
            Patient.patient_code == patient_data.patient_code
        )
        .first()
    )

    if existing_patient:
        raise HTTPException(
            status_code=400,
            detail="A patient with this patient code already exists.",
        )

    patient = Patient(
        patient_code=patient_data.patient_code,
        age_years=patient_data.age_years,
        sex=patient_data.sex,
        osteoporosis_treatment=patient_data.osteoporosis_treatment,
        treatment_duration_months=patient_data.treatment_duration_months,
        previous_fracture=patient_data.previous_fracture,
        functional_status=patient_data.functional_status,
        followup_attendance=patient_data.followup_attendance,
        side_effects=patient_data.side_effects,
        medication_cost_burden=patient_data.medication_cost_burden,
        distance_to_clinic_km=patient_data.distance_to_clinic_km,
        caregiver_support=patient_data.caregiver_support,
        missed_doses_last_30_days=patient_data.missed_doses_last_30_days,
        health_education=patient_data.health_education,
        created_by_user_id=patient_data.created_by_user_id,
    )

    db.add(patient)
    db.commit()
    db.refresh(patient)

    return {
        "status": "success",
        "message": "Patient created successfully.",
        "patient": {
            "id": patient.id,
            "patient_code": patient.patient_code,
            "age_years": patient.age_years,
            "sex": patient.sex,
            "osteoporosis_treatment": patient.osteoporosis_treatment,
            "treatment_duration_months": patient.treatment_duration_months,
            "previous_fracture": patient.previous_fracture,
            "functional_status": patient.functional_status,
            "followup_attendance": patient.followup_attendance,
            "side_effects": patient.side_effects,
            "medication_cost_burden": patient.medication_cost_burden,
            "distance_to_clinic_km": patient.distance_to_clinic_km,
            "caregiver_support": patient.caregiver_support,
            "missed_doses_last_30_days": patient.missed_doses_last_30_days,
            "health_education": patient.health_education,
            "created_by_user_id": patient.created_by_user_id,
            "created_at": patient.created_at,
        },
    }