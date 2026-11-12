
import os
import joblib
import numpy as np
import pandas as pd

try:
    import shap
except ImportError:
    shap = None


# ============================================================
# 1. PATHS
# ============================================================

BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.dirname(os.path.abspath(__file__))
    )
)

RESULTS_DIR = os.path.join(BASE_DIR, "ml", "results")
MODELS_DIR = os.path.join(RESULTS_DIR, "models")

DATASET_PATH = os.path.join(
    BASE_DIR,
    "backend",
    "data",
    "synthetic_osteoporosis_treatment_adherence_2000.csv"
)

PREPROCESSOR_PATH = os.path.join(
    RESULTS_DIR,
    "preprocessor.joblib"
)


# ============================================================
# 2. LOAD PREPROCESSOR AND SELECTED MODEL
# ============================================================

preprocessor = joblib.load(PREPROCESSOR_PATH)

svm_model = joblib.load(
    os.path.join(
        MODELS_DIR,
        "support_vector_machine.joblib"
    )
)

MODEL_NAME = "Support Vector Machine"
MODEL_KEY = "support_vector_machine"

FEATURE_NAMES = list(preprocessor.feature_names_in_)

ENCODED_FEATURE_NAMES = list(
    preprocessor.get_feature_names_out()
)


# ============================================================
# 3. FEATURE MAPPING
# ============================================================

numeric_features = list(preprocessor.transformers_[0][2])

categorical_features = sorted(
    list(preprocessor.transformers_[1][2]),
    key=len,
    reverse=True
)


def map_to_original_feature(encoded_name):

    if encoded_name.startswith("num__"):
        return encoded_name[len("num__"):]

    if encoded_name.startswith("cat__"):

        name = encoded_name[len("cat__"):]

        for feature in categorical_features:

            if (
                name == feature
                or name.startswith(feature + "_")
            ):
                return feature

    return encoded_name


ENCODED_TO_ORIGINAL = {
    name: map_to_original_feature(name)
    for name in ENCODED_FEATURE_NAMES
}


# ============================================================
# 4. READABLE FEATURE NAMES
# ============================================================

FEATURE_LABELS = {
    "age_years": "Age",
    "sex": "Sex",
    "education_level": "Education level",
    "marital_status": "Marital status",
    "previous_fracture": "Previous fracture",
    "family_history_osteoporosis": "Family history of osteoporosis",
    "comorbidities_count": "Number of comorbidities",
    "osteoporosis_severity": "Osteoporosis severity",
    "osteoporosis_treatment": "Osteoporosis treatment",
    "treatment_duration_months": "Treatment duration",
    "dosage_frequency": "Dosage frequency",
    "previous_osteoporosis_treatment": "Previous osteoporosis treatment",
    "functional_status": "Functional status",
    "follow_up_attendance": "Follow-up attendance",
    "side_effects": "Side effects",
    "medication_cost_burden": "Medication cost burden",
    "distance_to_clinic_km": "Distance to clinic",
    "transport_availability": "Transport availability",
    "insurance_coverage": "Insurance coverage",
    "caregiver_support": "Caregiver support",
    "family_support": "Family support",
    "missed_doses_last_30_days": "Missed doses in last 30 days",
    "health_education": "Health education",
    "medication_knowledge": "Medication knowledge",
    "medication_taking_routine": "Medication-taking routine",
    "perceived_treatment_effectiveness": "Perceived treatment effectiveness",
    "treatment_satisfaction": "Treatment satisfaction",
    "mobility_level": "Mobility level",
    "osteoporosis_knowledge": "Osteoporosis knowledge",
    "clinic_wait_time": "Clinic waiting time",
    "income_category": "Income category"
}


def clean_feature_name(feature_name):

    name = str(feature_name)

    return FEATURE_LABELS.get(
        name,
        name.replace("_", " ").title()
    )


# ============================================================
# 5. BUILD SHAP BACKGROUND
# ============================================================

def build_shap_background():

    if not os.path.exists(DATASET_PATH):
        print("SHAP background dataset not found.")
        return None

    try:

        dataset = pd.read_csv(DATASET_PATH)

        background_data = dataset[
            FEATURE_NAMES
        ].copy()

        sample_size = min(50, len(background_data))

        background_data = background_data.sample(
            n=sample_size,
            random_state=42
        )

        processed = preprocessor.transform(
            background_data
        )

        return np.asarray(
            processed,
            dtype=float
        )

    except Exception as error:

        print("SHAP background error:", error)
        return None


SHAP_BACKGROUND = build_shap_background()


# ============================================================
# 6. FEATURE EXPLANATION BUILDER
# ============================================================

def build_feature_explanations(
    contributions,
    method,
    top_n=5
):

    contributions = np.asarray(
        contributions,
        dtype=float
    ).reshape(-1)

    if len(contributions) != len(ENCODED_FEATURE_NAMES):
        raise ValueError(
            "Explanation values do not match encoded features."
        )

    aggregated = {}

    for index, value in enumerate(contributions):

        encoded_name = ENCODED_FEATURE_NAMES[index]

        original_name = ENCODED_TO_ORIGINAL.get(
            encoded_name,
            encoded_name
        )

        aggregated[original_name] = (
            aggregated.get(original_name, 0.0)
            + float(value)
        )

    explanations = []

    for feature, value in aggregated.items():

        if not np.isfinite(value) or abs(value) < 1e-10:
            continue

        explanations.append({
            "feature": clean_feature_name(feature),
            "contribution": round(abs(value), 4),
            "direction": (
                "increases"
                if value > 0
                else "decreases"
            ),
            "method": method
        })

    explanations.sort(
        key=lambda item: item["contribution"],
        reverse=True
    )

    return explanations[:top_n]


# ============================================================
# 7. NORMALISE SHAP OUTPUT
# ============================================================

def extract_positive_class_shap(shap_values):

    if hasattr(shap_values, "values"):
        shap_values = shap_values.values

    if isinstance(shap_values, list):

        if len(shap_values) > 1:
            shap_values = shap_values[1]
        else:
            shap_values = shap_values[0]

    values = np.asarray(
        shap_values,
        dtype=float
    )

    if values.ndim == 3:

        if values.shape[-1] == 2:
            values = values[0, :, 1]

        elif values.shape[0] == 2:
            values = values[1, 0, :]

        else:
            raise ValueError(
                "Unsupported SHAP output dimensions."
            )

    elif values.ndim == 2:

        values = values[0]

    elif values.ndim != 1:

        raise ValueError(
            "Unsupported SHAP output shape."
        )

    return values.reshape(-1)


# ============================================================
# 8. SUPPORT VECTOR MACHINE SHAP EXPLANATION
# ============================================================

_svm_shap_explainer = None


def get_svm_shap_explainer():

    global _svm_shap_explainer

    if shap is None or SHAP_BACKGROUND is None:
        return None

    if _svm_shap_explainer is not None:
        return _svm_shap_explainer

    try:

        def predict_probability(data):

            data = np.asarray(
                data,
                dtype=float
            )

            return svm_model.predict_proba(data)[:, 1]

        _svm_shap_explainer = shap.KernelExplainer(
            predict_probability,
            SHAP_BACKGROUND
        )

        return _svm_shap_explainer

    except Exception as error:

        print("SVM SHAP initialization error:", error)
        return None


def explain_svm(processed_data):

    if shap is None:
        return []

    explainer = get_svm_shap_explainer()

    if explainer is None:
        return []

    try:

        shap_values = explainer.shap_values(
            processed_data,
            nsamples=100
        )

        contributions = extract_positive_class_shap(
            shap_values
        )

        return build_feature_explanations(
            contributions,
            "SHAP"
        )

    except Exception as error:

        print("SVM SHAP explanation error:", error)
        return []


# ============================================================
# 9. INTERPRETABILITY
# ============================================================

def get_interpretability(processed_data):

    explanations = explain_svm(processed_data)

    return {
        "method": "SHAP" if explanations else "Unavailable",
        "top_features": explanations
    }


# ============================================================
# 10. VALIDATE PATIENT INPUT
# ============================================================

def prepare_patient_data(data):

    if not isinstance(data, dict):
        raise ValueError(
            "Patient information must be supplied as a dictionary."
        )

    missing_features = [
        feature
        for feature in FEATURE_NAMES
        if feature not in data
    ]

    if missing_features:

        raise ValueError(
            "Missing required patient information: "
            + ", ".join(missing_features)
        )

    patient_data = {
        feature: data[feature]
        for feature in FEATURE_NAMES
    }

    return pd.DataFrame([patient_data])


# ============================================================
# 11. PREDICT USING SVM ONLY
# ============================================================

def predict_with_svm(data: dict):

    input_data = prepare_patient_data(data)

    processed_data = preprocessor.transform(
        input_data
    )

    prediction = int(
        svm_model.predict(processed_data)[0]
    )

    probabilities = svm_model.predict_proba(
        processed_data
    )[0]

    classes = list(svm_model.classes_)

    if 1 not in classes or 0 not in classes:
        raise ValueError(
            "SVM must have class labels 0 and 1."
        )

    probability_adherent = float(
        probabilities[classes.index(1)]
    )

    probability_non_adherent = float(
        probabilities[classes.index(0)]
    )

    prediction_label = (
        "Adherent"
        if prediction == 1
        else "Non-adherent"
    )

    interpretability = get_interpretability(
        processed_data
    )

    return {
        "model": MODEL_NAME,
        "prediction": prediction_label,
        "probability_adherent": round(
            probability_adherent, 4
        ),
        "probability_non_adherent": round(
            probability_non_adherent, 4
        ),
        "interpretability": interpretability
    }
