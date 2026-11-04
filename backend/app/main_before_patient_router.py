import csv
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import engine, get_db
from app.models import Base, Patient
from app.predictor import predict_with_model, predict_all_models
from app.auth import router as auth_router


# ============================================================
# DATABASE
# ============================================================

Base.metadata.create_all(bind=engine)


# ============================================================
# DATASET PATH
# ============================================================

DATASET_PATH = (
    Path(__file__).resolve().parents[1]
    / "data"
    / "synthetic_osteoporosis_treatment_adherence_2000.csv"
)


# ============================================================
# FASTAPI APPLICATION
# ============================================================

app = FastAPI(
    title="Osteoporosis Treatment Adherence Prediction System",
    description=(
        "Interpretable machine learning system for predicting "
        "osteoporosis treatment adherence among adults in healthcare."
    ),
    version="1.0.0",
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# AUTHENTICATION
# ============================================================

app.include_router(auth_router)


# ============================================================
# AVAILABLE MODELS
# ============================================================

VALID_MODELS = {
    "logistic_regression": "Logistic Regression",
    "support_vector_machine": "Support Vector Machine",
    "gradient_boosting": "Gradient Boosting",
}


# ============================================================
# PREDICTION INPUT - ALL 31 FEATURES
# ============================================================

class PredictionInput(BaseModel):
    age_years: int
    sex: str
    education_level: str
    marital_status: str
    previous_fracture: str
    family_history_osteoporosis: str
    comorbidities_count: int
    osteoporosis_severity: str
    osteoporosis_treatment: str
    treatment_duration_months: int
    dosage_frequency: str
    previous_osteoporosis_treatment: str
    functional_status: str
    follow_up_attendance: str
    side_effects: Optional[str] = None
    medication_cost_burden: str
    distance_to_clinic_km: float
    transport_availability: str
    insurance_coverage: str
    caregiver_support: str
    family_support: str
    missed_doses_last_30_days: int
    health_education: str
    medication_knowledge: str
    medication_taking_routine: str
    perceived_treatment_effectiveness: str
    treatment_satisfaction: str
    mobility_level: str
    osteoporosis_knowledge: str
    clinic_wait_time: str
    income_category: str


# ============================================================
# PATIENT CREATION INPUT
# Existing database fields are retained here.
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
# ROOT
# ============================================================

@app.get("/")
def root():
    return {
        "message": "Osteoporosis Treatment Adherence Prediction System",
        "status": "running",
        "version": "1.0.0",
    }


# ============================================================
# HEALTH
# ============================================================

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "models_loaded": list(VALID_MODELS.values()),
    }


# ============================================================
# MODELS
# ============================================================

@app.get("/models")
def available_models():
    return {"models": VALID_MODELS}


# ============================================================
# DATASET
# ============================================================

@app.get("/data")
def get_dataset():
    if not DATASET_PATH.is_file():
        raise HTTPException(
            status_code=404,
            detail=f"Dataset file not found: {DATASET_PATH}",
        )

    try:
        with DATASET_PATH.open(
            mode="r",
            encoding="utf-8-sig",
            newline="",
        ) as file:

            reader = csv.DictReader(file)
            columns = reader.fieldnames or []
            records = []

            for row in reader:
                cleaned_row = {
                    key: (
                        value.strip()
                        if value is not None and value.strip()
                        else None
                    )
                    for key, value in row.items()
                    if key is not None
                }
                records.append(cleaned_row)

        missing_by_column = {
            column: sum(
                1 for record in records
                if record.get(column) is None
            )
            for column in columns
        }

        total_missing = sum(missing_by_column.values())
        total_cells = len(records) * len(columns)

        return {
            "status": "success",
            "dataset_name": DATASET_PATH.name,
            "total_records": len(records),
            "total_columns": len(columns),
            "missing_values": total_missing,
            "missing_percentage": (
                round(total_missing / total_cells * 100, 2)
                if total_cells else 0
            ),
            "missing_by_column": missing_by_column,
            "columns": columns,
            "records": records,
        }

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to read dataset: {str(e)}",
        )


# ============================================================
# PATIENTS
# ============================================================

@app.get("/patients")
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

@app.get("/patients/{patient_id}")
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

@app.post("/patients")
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


# ============================================================
# PREDICT USING ALL MODELS
# ============================================================

@app.post("/predict/all")
def predict_all(input_data: PredictionInput):
    try:
        results = predict_all_models(
            input_data.model_dump()
        )

        return {
            "status": "success",
            "predictions": results,
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "error": "Prediction failed",
                "message": str(e),
            },
        )


# ============================================================
# PREDICT USING A SPECIFIC MODEL
# ============================================================

@app.post("/predict/{model_name}")
def predict(
    model_name: str,
    input_data: PredictionInput,
):
    if model_name not in VALID_MODELS:
        raise HTTPException(
            status_code=400,
            detail={
                "error": "Invalid model name",
                "requested_model": model_name,
                "available_models": list(VALID_MODELS.keys()),
            },
        )

    try:
        result = predict_with_model(
            input_data.model_dump(),
            model_name,
        )

        return {
            "status": "success",
            "result": result,
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail={
                "error": "Prediction failed",
                "message": str(e),
            },
        )