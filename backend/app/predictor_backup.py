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
# 2. LOAD PREPROCESSOR AND MODELS
# ============================================================

preprocessor = joblib.load(PREPROCESSOR_PATH)

models = {
    "logistic_regression": joblib.load(
        os.path.join(MODELS_DIR, "logistic_regression.joblib")
    ),
    "support_vector_machine": joblib.load(
        os.path.join(MODELS_DIR, "support_vector_machine.joblib")
    ),
    "gradient_boosting": joblib.load(
        os.path.join(MODELS_DIR, "gradient_boosting.joblib")
    )
}

model_names = {
    "logistic_regression": "Logistic Regression",
    "support_vector_machine": "Support Vector Machine",
    "gradient_boosting": "Gradient Boosting"
}

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
    "treatment_duration_months": "Treatment duration",
    "missed_doses_last_30_days": "Missed doses in last 30 days",
    "osteoporosis_treatment": "Osteoporosis treatment",
    "dosage_frequency": "Dosage frequency",
    "family_history_osteoporosis": "Family history of osteoporosis",
    "education_level": "Education level",
    "transport_availability": "Transport availability",
    "marital_status": "Marital status",
    "perceived_treatment_effectiveness": "Perceived treatment effectiveness",
    "side_effects": "Side effects",
    "mobility_level": "Mobility level",
    "distance_to_clinic_km": "Distance to clinic",
    "follow_up_attendance": "Follow-up attendance",
    "comorbidities_count": "Number of comorbidities",
    "insurance_coverage": "Insurance coverage",
    "osteoporosis_knowledge": "Osteoporosis knowledge",
    "osteoporosis_severity": "Osteoporosis severity",
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

        sample_size = min(
            50,
            len(background_data)
        )

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
    ).flatten()

    if len(contributions) != len(ENCODED_FEATURE_NAMES):
        raise ValueError(
            "Explanation values do not match encoded features."
        )

    # Aggregate encoded contributions into original variables.
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

        if abs(value) < 1e-10:
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
# 7. LOGISTIC REGRESSION EXPLANATION
# ============================================================

def explain_logistic_regression(
    model,
    processed_data
):

    try:

        coefficients = np.asarray(
            model.coef_[0],
            dtype=float
        )

        values = np.asarray(
            processed_data,
            dtype=float
        ).flatten()

        contributions = coefficients * values

        return build_feature_explanations(
            contributions,
            "Linear model contribution"
        )

    except Exception as error:

        print("Logistic Regression explanation error:", error)
        return []


# ============================================================
# 8. GRADIENT BOOSTING SHAP EXPLANATION
# ============================================================

def explain_gradient_boosting(
    model,
    processed_data
):

    if shap is None:
        return []

    try:

        explainer = shap.TreeExplainer(model)

        shap_values = explainer.shap_values(
            processed_data
        )

        if isinstance(shap_values, list):

            values = np.asarray(
                shap_values[1]
            ).flatten()

        else:

            values = np.asarray(shap_values)

            if values.ndim == 3:

                if values.shape[-1] == 2:
                    values = values[0, :, 1]

                elif values.shape[0] == 2:
                    values = values[1, 0, :]

            elif values.ndim == 2:
                values = values[0]

            values = values.flatten()

        return build_feature_explanations(
            values,
            "SHAP"
        )

    except Exception as error:

        print("Gradient Boosting SHAP error:", error)
        return []


# ============================================================
# 9. SUPPORT VECTOR MACHINE SHAP EXPLANATION
# ============================================================

_svm_shap_explainer = None


def get_svm_shap_explainer():

    global _svm_shap_explainer

    if shap is None or SHAP_BACKGROUND is None:
        return None

    if _svm_shap_explainer is not None:
        return _svm_shap_explainer

    try:

        svm_model = models["support_vector_machine"]

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

        if isinstance(shap_values, list):
            values = np.asarray(shap_values[1]).flatten()
        else:
            values = np.asarray(shap_values).flatten()

        return build_feature_explanations(
            values,
            "SHAP"
        )

    except Exception as error:

        print("SVM SHAP explanation error:", error)
        return []


# ============================================================
# 10. INTERPRETABILITY ROUTER
# ============================================================

def get_interpretability(
    model,
    model_key,
    processed_data
):

    explanations = []
    method = "Unavailable"

    if model_key == "logistic_regression":

        explanations = explain_logistic_regression(
            model,
            processed_data
        )

        if explanations:
            method = "Linear model contribution"

    elif model_key == "support_vector_machine":

        explanations = explain_svm(
            processed_data
        )

        if explanations:
            method = "SHAP"

    elif model_key == "gradient_boosting":

        explanations = explain_gradient_boosting(
            model,
            processed_data
        )

        if explanations:
            method = "SHAP"

    return {
        "method": method,
        "top_features": explanations
    }


# ============================================================
# 11. VALIDATE PATIENT INPUT
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

    # Preserve the exact training feature order.
    patient_data = {
        feature: data[feature]
        for feature in FEATURE_NAMES
    }

    return pd.DataFrame([patient_data])


# ============================================================
# 12. PREDICT WITH ONE MODEL
# ============================================================

def predict_with_model(data: dict, model_key: str):

    if model_key not in models:
        raise ValueError(
            f"Unknown model: {model_key}"
        )

    input_data = prepare_patient_data(data)

    processed_data = preprocessor.transform(
        input_data
    )

    model = models[model_key]

    prediction = int(
        model.predict(processed_data)[0]
    )

    probabilities = model.predict_proba(
        processed_data
    )[0]

    probability_non_adherent = float(
        probabilities[0]
    )

    probability_adherent = float(
        probabilities[1]
    )

    prediction_label = (
        "Adherent"
        if prediction == 1
        else "Non-adherent"
    )

    interpretability = get_interpretability(
        model,
        model_key,
        processed_data
    )

    return {
        "model": model_names[model_key],
        "prediction": prediction_label,
        "probability_adherent": round(
            probability_adherent, 4
        ),
        "probability_non_adherent": round(
            probability_non_adherent, 4
        ),
        "interpretability": interpretability
    }


# ============================================================
# 13. PREDICT WITH ALL MODELS
# ============================================================

def predict_all_models(data: dict):

    results = {}

    for model_key in models:

        results[model_key] = predict_with_model(
            data,
            model_key
        )

    return results