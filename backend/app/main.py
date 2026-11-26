
import csv
from pathlib import Path
from typing import Optional
from datetime import datetime, timezone

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import engine, get_db
from app.models import Base, User
from app.predictor import predict_with_svm, MODEL_NAME
from app.auth import router as auth_router, get_current_user
from app.patient_routes import router as patient_router


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
    title="OsteoPredict - Osteoporosis Treatment Adherence Prediction",
    description=(
        "Interpretable osteoporosis treatment adherence prediction "
        "system powered by Support Vector Machine."
    ),
    version="1.0.0",
)


# ============================================================
# CORS CONFIGURATION
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "https://osteoadhere.netlify.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# ROUTERS
# ============================================================

app.include_router(auth_router)
app.include_router(patient_router)


# ============================================================
# SELECTED MODEL
# ============================================================

SELECTED_MODEL = MODEL_NAME


# ============================================================
# TRIAL CONFIGURATION
# ============================================================

FREE_TRIAL_LIMIT = 2


# ============================================================
# SUBSCRIPTION VALIDATION
# ============================================================

def has_active_subscription(user: User) -> bool:

    if user.subscription_status != "active":
        return False

    if not user.subscription_expires_at:
        return False

    return (
        user.subscription_expires_at
        > datetime.now(timezone.utc).replace(tzinfo=None)
    )


# ============================================================
# CHECK PREDICTION ACCESS
# ============================================================

def check_prediction_access(user: User, db: Session):

    if has_active_subscription(user):
        return

    if user.subscription_status == "active":
        user.subscription_status = "expired"
        user.subscription_plan = "free"
        user.subscription_expires_at = None
        db.commit()

    if user.trial_predictions_used >= FREE_TRIAL_LIMIT:
        raise HTTPException(
            status_code=402,
            detail={
                "error": "TRIAL_EXHAUSTED",
                "message": (
                    "You have used your two free prediction generations. "
                    "Please subscribe to continue."
                ),
                "trial_predictions_used": user.trial_predictions_used,
                "trial_limit": FREE_TRIAL_LIMIT,
                "subscription_required": True,
            },
        )


# ============================================================
# RECORD PREDICTION GENERATION
# ============================================================

def record_prediction_generation(user: User, db: Session):

    if has_active_subscription(user):
        return

    user.trial_predictions_used += 1

    db.commit()
    db.refresh(user)


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
# ROOT
# ============================================================

@app.get("/")
def root():

    return {
        "message": "OsteoPredict",
        "status": "running",
        "version": "1.0.0",
        "selected_model": SELECTED_MODEL,
    }


# ============================================================
# HEALTH
# ============================================================

@app.get("/health")
def health_check():

    return {
        "status": "healthy",
        "selected_model": SELECTED_MODEL,
        "models_loaded": [SELECTED_MODEL],
    }


# ============================================================
# SELECTED MODEL
# ============================================================

@app.get("/models")
def available_models():

    return {
        "selected_model": SELECTED_MODEL,
        "models": {
            "support_vector_machine": SELECTED_MODEL
        },
    }


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
# PREDICT USING SELECTED SVM MODEL
# ============================================================

@app.post("/predict")
def predict(
    input_data: PredictionInput,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):

    check_prediction_access(current_user, db)

    try:

        result = predict_with_svm(
            input_data.model_dump()
        )

        record_prediction_generation(current_user, db)

        return {
            "status": "success",
            "result": result,
            "selected_model": SELECTED_MODEL,
            "trial_predictions_used": current_user.trial_predictions_used,
            "trial_limit": FREE_TRIAL_LIMIT,
            "subscription_active": has_active_subscription(current_user),
        }

    except HTTPException:
        raise

    except Exception as e:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail={
                "error": "Prediction failed",
                "message": str(e),
            },
        )
