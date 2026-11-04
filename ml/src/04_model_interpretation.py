from pathlib import Path
import warnings

import joblib
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

from sklearn.inspection import permutation_importance

warnings.filterwarnings("ignore")


# ============================================================
# 1. PATHS AND CONFIGURATION
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parents[2]

DATASET_PATH = (
    PROJECT_ROOT
    / "backend"
    / "data"
    / "synthetic_osteoporosis_treatment_adherence_2000.csv"
)

RESULTS_DIR = PROJECT_ROOT / "ml" / "results"
MODEL_DIR = RESULTS_DIR / "models"

OUTPUT_DIR = RESULTS_DIR / "interpretability"
FIGURES_DIR = OUTPUT_DIR / "figures"

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
FIGURES_DIR.mkdir(parents=True, exist_ok=True)

TARGET = "adherence_binary"

PREPROCESSOR_PATH = RESULTS_DIR / "preprocessor.joblib"

LOGISTIC_PATH = MODEL_DIR / "logistic_regression.joblib"
SVM_PATH = MODEL_DIR / "support_vector_machine.joblib"
GRADIENT_PATH = MODEL_DIR / "gradient_boosting.joblib"

X_TEST_PATH = RESULTS_DIR / "X_test_processed.csv"
Y_TEST_PATH = RESULTS_DIR / "y_test.csv"


# ============================================================
# 2. LOAD DATA AND MODEL ARTIFACTS
# ============================================================

print("=" * 70)
print("OSTEOPOROSIS TREATMENT ADHERENCE - MODEL INTERPRETATION")
print("=" * 70)

print("\nLoading dataset...")

df = pd.read_csv(DATASET_PATH)

if TARGET not in df.columns:
    raise ValueError(f"Target column '{TARGET}' was not found.")

excluded_columns = [
    "patient_id",
    "adherence",
    TARGET
]

X_original = df.drop(
    columns=[column for column in excluded_columns if column in df.columns]
)

original_features = X_original.columns.tolist()

print("Dataset shape:", df.shape)
print("Original predictor variables:", len(original_features))


print("\nLoading preprocessing pipeline...")

preprocessor = joblib.load(PREPROCESSOR_PATH)

X_test = pd.read_csv(X_TEST_PATH)
y_test = pd.read_csv(Y_TEST_PATH)[TARGET]

y_test = y_test.astype(int)

logistic_model = joblib.load(LOGISTIC_PATH)
svm_model = joblib.load(SVM_PATH)
gradient_model = joblib.load(GRADIENT_PATH)


# ============================================================
# 3. VALIDATE FEATURE STRUCTURE
# ============================================================

encoded_features = preprocessor.get_feature_names_out().tolist()

if len(encoded_features) != X_test.shape[1]:
    raise ValueError(
        "The processed test data does not match the preprocessor "
        "feature count."
    )

if len(encoded_features) != len(logistic_model.coef_[0]):
    raise ValueError(
        "Logistic Regression coefficients do not match "
        "the processed feature count."
    )

print("\nEncoded features:", len(encoded_features))
print("Test records:", len(X_test))


# ============================================================
# 4. MAP ENCODED FEATURES TO ORIGINAL VARIABLES
# ============================================================

numeric_features = list(preprocessor.transformers_[0][2])
categorical_features = list(preprocessor.transformers_[1][2])

# Check longer feature names first to avoid incorrect matches.
categorical_features = sorted(
    categorical_features,
    key=len,
    reverse=True
)


def map_to_original_feature(encoded_name):

    if encoded_name.startswith("num__"):
        return encoded_name[len("num__"):]

    if encoded_name.startswith("cat__"):

        feature_name = encoded_name[len("cat__"):]

        for original_name in categorical_features:

            if (
                feature_name == original_name
                or feature_name.startswith(original_name + "_")
            ):
                return original_name

    return encoded_name


feature_mapping = pd.DataFrame({
    "encoded_feature": encoded_features,
    "original_feature": [
        map_to_original_feature(feature)
        for feature in encoded_features
    ]
})

feature_mapping.to_csv(
    OUTPUT_DIR / "encoded_to_original_feature_mapping.csv",
    index=False
)

print("Feature mapping created successfully.")


# ============================================================
# 5. LOGISTIC REGRESSION FEATURE IMPORTANCE
# ============================================================

print("\nCalculating Logistic Regression feature importance...")

logistic_coefficients = np.asarray(logistic_model.coef_)

if logistic_coefficients.ndim == 2:
    logistic_importance = np.mean(
        np.abs(logistic_coefficients),
        axis=0
    )
else:
    logistic_importance = np.abs(logistic_coefficients)

logistic_df = pd.DataFrame({
    "encoded_feature": encoded_features,
    "importance": logistic_importance
})

logistic_df["original_feature"] = (
    logistic_df["encoded_feature"].map(
        dict(zip(
            feature_mapping["encoded_feature"],
            feature_mapping["original_feature"]
        ))
    )
)

logistic_original = (
    logistic_df.groupby("original_feature")["importance"]
    .sum()
    .sort_values(ascending=False)
)

logistic_original.to_csv(
    OUTPUT_DIR / "logistic_regression_feature_importance.csv"
)

print("Logistic Regression importance completed.")


# ============================================================
# 6. GRADIENT BOOSTING SHAP INTERPRETATION
# ============================================================

print("\nCalculating SHAP feature importance...")

shap_original = None

try:

    import shap

    explainer = shap.TreeExplainer(gradient_model)

    shap_values = explainer.shap_values(
        X_test.to_numpy()
    )

    if isinstance(shap_values, list):

        # Binary classification: use the positive class.
        shap_array = np.asarray(shap_values[1])

    else:

        shap_array = np.asarray(shap_values)

        if shap_array.ndim == 3:

            # Common format: samples x features x classes.
            if shap_array.shape[-1] == 2:
                shap_array = shap_array[:, :, 1]

            # Alternative format: classes x samples x features.
            elif shap_array.shape[0] == 2:
                shap_array = shap_array[1]

    if shap_array.ndim != 2:
        raise ValueError(
            f"Unexpected SHAP output shape: {shap_array.shape}"
        )

    if shap_array.shape[1] != len(encoded_features):
        raise ValueError(
            "SHAP feature count does not match encoded features."
        )

    mean_absolute_shap = np.mean(
        np.abs(shap_array),
        axis=0
    )

    shap_df = pd.DataFrame({
        "encoded_feature": encoded_features,
        "importance": mean_absolute_shap
    })

    shap_df["original_feature"] = (
        shap_df["encoded_feature"].map(
            dict(zip(
                feature_mapping["encoded_feature"],
                feature_mapping["original_feature"]
            ))
        )
    )

    shap_original = (
        shap_df.groupby("original_feature")["importance"]
        .sum()
        .sort_values(ascending=False)
    )

    shap_original.to_csv(
        OUTPUT_DIR / "gradient_boosting_shap_importance.csv"
    )

    print("SHAP interpretation completed successfully.")

except Exception as error:

    print("\nSHAP interpretation could not be completed.")
    print("Reason:", str(error))


# ============================================================
# 7. SUPPORT VECTOR MACHINE PERMUTATION IMPORTANCE
# ============================================================

print("\nCalculating SVM permutation importance...")

permutation_result = permutation_importance(
    svm_model,
    X_test,
    y_test,
    scoring="roc_auc",
    n_repeats=5,
    random_state=42,
    n_jobs=-1
)

svm_df = pd.DataFrame({
    "encoded_feature": encoded_features,
    "importance": permutation_result.importances_mean
})

svm_df["original_feature"] = (
    svm_df["encoded_feature"].map(
        dict(zip(
            feature_mapping["encoded_feature"],
            feature_mapping["original_feature"]
        ))
    )
)

svm_original = (
    svm_df.groupby("original_feature")["importance"]
    .sum()
    .sort_values(ascending=False)
)

svm_original.to_csv(
    OUTPUT_DIR / "svm_permutation_importance.csv"
)

print("SVM permutation importance completed.")


# ============================================================
# 8. COMBINE FEATURE IMPORTANCE RESULTS
# ============================================================

print("\nCombining interpretation results...")

combined = pd.DataFrame({
    "original_feature": original_features
})

combined["logistic_regression_importance"] = (
    combined["original_feature"].map(logistic_original)
)

combined["gradient_boosting_shap_importance"] = np.nan

if shap_original is not None:

    combined["gradient_boosting_shap_importance"] = (
        combined["original_feature"].map(shap_original)
    )

combined["svm_permutation_importance"] = (
    combined["original_feature"].map(svm_original)
)

combined.to_csv(
    OUTPUT_DIR / "combined_feature_importance.csv",
    index=False
)

print("Combined feature importance saved.")


# ============================================================
# 9. GENERATE FEATURE IMPORTANCE FIGURES
# ============================================================

def create_importance_plot(series, title, filename, xlabel):

    if series is None or len(series) == 0:
        print(f"Skipping figure: {title}")
        return

    top_features = series.sort_values(
        ascending=True
    ).tail(15)

    plt.figure(figsize=(10, 7))

    top_features.plot(
        kind="barh"
    )

    plt.title(title)
    plt.xlabel(xlabel)
    plt.ylabel("Original predictor variable")

    plt.tight_layout()

    plt.savefig(
        FIGURES_DIR / filename,
        dpi=300,
        bbox_inches="tight"
    )

    plt.close()

    print("Saved figure:", filename)


create_importance_plot(
    logistic_original,
    "Logistic Regression Feature Importance",
    "logistic_regression_importance.png",
    "Sum of absolute coefficients"
)

create_importance_plot(
    shap_original,
    "Gradient Boosting SHAP Feature Importance",
    "gradient_boosting_shap_importance.png",
    "Mean absolute SHAP value"
)

create_importance_plot(
    svm_original,
    "SVM Permutation Feature Importance",
    "svm_permutation_importance.png",
    "Mean decrease in ROC-AUC"
)


# ============================================================
# 10. FINAL SUMMARY
# ============================================================

print("\n" + "=" * 70)
print("MODEL INTERPRETATION COMPLETED")
print("=" * 70)

print("\nTop Logistic Regression features:")
print(logistic_original.head(10))

if shap_original is not None:

    print("\nTop Gradient Boosting SHAP features:")
    print(shap_original.head(10))

print("\nTop SVM permutation features:")
print(svm_original.head(10))

print("\nOutput directory:")
print(OUTPUT_DIR)

print("\nGenerated files:")
print("- logistic_regression_feature_importance.csv")
print("- gradient_boosting_shap_importance.csv (if SHAP succeeds)")
print("- svm_permutation_importance.csv")
print("- combined_feature_importance.csv")
print("- encoded_to_original_feature_mapping.csv")
print("- figures folder")

print("\nNote: These importance values describe model behaviour.")
print("They do not establish causal relationships.")

print("=" * 70)