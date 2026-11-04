
from pathlib import Path
import warnings

import joblib
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

from sklearn.inspection import permutation_importance


# ============================================================
# 1. PATHS
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parents[2]

DATA_FILE = (
    PROJECT_ROOT
    / "ml"
    / "data"
    / "synthetic_osteoporosis_treatment_adherence_dataset.csv"
)

RESULTS_DIR = PROJECT_ROOT / "ml" / "results"
MODELS_DIR = RESULTS_DIR / "models"
FIGURES_DIR = RESULTS_DIR / "figures"

FIGURES_DIR.mkdir(
    parents=True,
    exist_ok=True
)


# ============================================================
# 2. ORIGINAL FEATURES
# ============================================================

TARGET = "adherence"

EXCLUDED_COLUMNS = [
    "patient_id",
    "adherence_score",
    TARGET
]

NUMERICAL_FEATURES = [
    "age_years",
    "treatment_duration_months",
    "distance_to_clinic_km",
    "missed_doses_last_30_days"
]

CATEGORICAL_FEATURES = [
    "sex",
    "osteoporosis_treatment",
    "previous_fracture",
    "functional_status",
    "followup_attendance",
    "side_effects",
    "medication_cost_burden",
    "caregiver_support",
    "health_education"
]

ORIGINAL_FEATURES = (
    NUMERICAL_FEATURES +
    CATEGORICAL_FEATURES
)


# ============================================================
# 3. HEADER
# ============================================================

print("=" * 70)
print("OSTEOPOROSIS TREATMENT ADHERENCE")
print("MODEL INTERPRETABILITY ANALYSIS")
print("=" * 70)


# ============================================================
# 4. LOAD ORIGINAL DATA
# ============================================================

print("\nLoading original dataset...")

df = pd.read_csv(DATA_FILE)

print(f"Dataset shape: {df.shape}")


X_original = df.drop(
    columns=EXCLUDED_COLUMNS
)

y = df[TARGET].map({
    "Non-adherent": 0,
    "Adherent": 1
})


print(
    f"Original predictor variables: "
    f"{X_original.shape[1]}"
)


# ============================================================
# 5. LOAD PREPROCESSOR
# ============================================================

print("\nLoading preprocessing pipeline...")

preprocessor_file = (
    RESULTS_DIR / "preprocessor.joblib"
)

preprocessor = joblib.load(
    preprocessor_file
)

print("Preprocessor loaded successfully.")


# ============================================================
# 6. LOAD PROCESSED TEST DATA
# ============================================================

print("\nLoading processed test data...")

X_test_file = (
    RESULTS_DIR / "X_test_processed.csv"
)

y_test_file = (
    RESULTS_DIR / "y_test.csv"
)

X_test = pd.read_csv(
    X_test_file
)

y_test = pd.read_csv(
    y_test_file
).squeeze("columns")


print(
    f"Test dataset shape: {X_test.shape}"
)


# ============================================================
# 7. GET ENCODED FEATURE NAMES
# ============================================================

encoded_features = (
    preprocessor.get_feature_names_out()
)

print(
    f"Encoded feature variables: "
    f"{len(encoded_features)}"
)


# ============================================================
# 8. MAP ENCODED FEATURES TO ORIGINAL FEATURES
# ============================================================

def map_to_original_feature(encoded_name):
    """
    Maps a one-hot encoded feature back to its
    original predictor variable.
    """

    if encoded_name.startswith("numerical__"):

        return encoded_name.replace(
            "numerical__",
            "",
            1
        )

    if encoded_name.startswith("categorical__"):

        name = encoded_name.replace(
            "categorical__",
            "",
            1
        )

        for feature in CATEGORICAL_FEATURES:

            if (
                name == feature
                or name.startswith(feature + "_")
            ):
                return feature

    return encoded_name


feature_mapping = {
    feature: map_to_original_feature(feature)
    for feature in encoded_features
}


# ============================================================
# 9. LOAD TRAINED MODELS
# ============================================================

print("\nLoading trained models...")

logistic_model = joblib.load(
    MODELS_DIR / "logistic_regression.joblib"
)

svm_model = joblib.load(
    MODELS_DIR / "support_vector_machine.joblib"
)

gradient_model = joblib.load(
    MODELS_DIR / "gradient_boosting.joblib"
)

print("All models loaded successfully.")


# ============================================================
# PART A
# LOGISTIC REGRESSION FEATURE IMPORTANCE
# ============================================================

print("\n" + "=" * 70)
print("PART A: LOGISTIC REGRESSION FEATURE IMPORTANCE")
print("=" * 70)


logistic_coefficients = (
    logistic_model.coef_[0]
)

logistic_encoded = pd.DataFrame({
    "encoded_feature": encoded_features,
    "coefficient": logistic_coefficients
})

logistic_encoded[
    "original_feature"
] = logistic_encoded[
    "encoded_feature"
].map(feature_mapping)

logistic_encoded[
    "absolute_coefficient"
] = (
    logistic_encoded["coefficient"]
    .abs()
)


# Aggregate one-hot encoded features
logistic_original = (
    logistic_encoded
    .groupby(
        "original_feature",
        as_index=False
    )
    .agg(
        total_absolute_coefficient=(
            "absolute_coefficient",
            "sum"
        )
    )
    .sort_values(
        "total_absolute_coefficient",
        ascending=False
    )
)


logistic_file = (
    RESULTS_DIR
    / "logistic_regression_feature_importance.csv"
)

logistic_original.to_csv(
    logistic_file,
    index=False
)


print("\nLogistic Regression importance:")

print(
    logistic_original.to_string(
        index=False
    )
)


# ------------------------------------------------------------
# Logistic Regression Plot
# ------------------------------------------------------------

logistic_plot_data = (
    logistic_original
    .sort_values(
        "total_absolute_coefficient"
    )
)

plt.figure(
    figsize=(10, 7)
)

plt.barh(
    logistic_plot_data[
        "original_feature"
    ],
    logistic_plot_data[
        "total_absolute_coefficient"
    ]
)

plt.xlabel(
    "Total Absolute Coefficient"
)

plt.ylabel(
    "Original Predictor"
)

plt.title(
    "Logistic Regression Feature Importance"
)

plt.tight_layout()

logistic_plot = (
    FIGURES_DIR
    / "logistic_regression_feature_importance.png"
)

plt.savefig(
    logistic_plot,
    dpi=300,
    bbox_inches="tight"
)

plt.close()


# ============================================================
# PART B
# GRADIENT BOOSTING SHAP
# ============================================================

print("\n" + "=" * 70)
print("PART B: GRADIENT BOOSTING SHAP INTERPRETABILITY")
print("=" * 70)


shap_original = None
shap_file = None
shap_plot = None


try:

    import shap

    print(
        f"\nSHAP version: {shap.__version__}"
    )

    print(
        "Calculating SHAP values..."
    )

    X_test_array = X_test.to_numpy()

    explainer = shap.TreeExplainer(
        gradient_model
    )

    shap_values = explainer.shap_values(
        X_test_array
    )

    shap_values = np.asarray(
        shap_values
    )

    # --------------------------------------------------------
    # Handle different SHAP output shapes
    # --------------------------------------------------------

    if shap_values.ndim == 3:

        if shap_values.shape[-1] == 2:

            # Binary classification
            shap_values = shap_values[:, :, 1]

        else:

            shap_values = shap_values[:, :, 0]


    if shap_values.ndim != 2:

        raise ValueError(
            "Unexpected SHAP value shape: "
            f"{shap_values.shape}"
        )


    mean_absolute_shap = (
        np.abs(shap_values)
        .mean(axis=0)
    )


    shap_encoded = pd.DataFrame({
        "encoded_feature": encoded_features,
        "mean_absolute_shap":
            mean_absolute_shap
    })


    shap_encoded[
        "original_feature"
    ] = shap_encoded[
        "encoded_feature"
    ].map(feature_mapping)


    # --------------------------------------------------------
    # Aggregate encoded variables
    # --------------------------------------------------------

    shap_original = (
        shap_encoded
        .groupby(
            "original_feature",
            as_index=False
        )
        .agg(
            mean_absolute_shap=(
                "mean_absolute_shap",
                "sum"
            )
        )
        .sort_values(
            "mean_absolute_shap",
            ascending=False
        )
    )


    shap_file = (
        RESULTS_DIR
        / "gradient_boosting_shap_importance.csv"
    )


    shap_original.to_csv(
        shap_file,
        index=False
    )


    print(
        "\nGradient Boosting SHAP importance:"
    )

    print(
        shap_original.to_string(
            index=False
        )
    )


    # --------------------------------------------------------
    # SHAP Plot
    # --------------------------------------------------------

    shap_plot_data = (
        shap_original
        .sort_values(
            "mean_absolute_shap"
        )
    )


    plt.figure(
        figsize=(10, 7)
    )

    plt.barh(
        shap_plot_data[
            "original_feature"
        ],
        shap_plot_data[
            "mean_absolute_shap"
        ]
    )

    plt.xlabel(
        "Mean Absolute SHAP Value"
    )

    plt.ylabel(
        "Original Predictor"
    )

    plt.title(
        "Gradient Boosting SHAP Feature Importance"
    )

    plt.tight_layout()


    shap_plot = (
        FIGURES_DIR
        / "gradient_boosting_shap_importance.png"
    )


    plt.savefig(
        shap_plot,
        dpi=300,
        bbox_inches="tight"
    )

    plt.close()


except Exception as error:

    print(
        "\nSHAP analysis failed."
    )

    print(
        f"Error: {error}"
    )

    shap_original = None


# ============================================================
# PART C
# SVM PERMUTATION IMPORTANCE
# ============================================================

print("\n" + "=" * 70)
print("PART C: SUPPORT VECTOR MACHINE")
print("PERMUTATION FEATURE IMPORTANCE")
print("=" * 70)


print(
    "\nCalculating permutation importance..."
)


with warnings.catch_warnings():

    warnings.simplefilter(
        "ignore"
    )

    permutation = (
        permutation_importance(
            svm_model,
            X_test,
            y_test,
            n_repeats=10,
            random_state=42,
            scoring="f1"
        )
    )


svm_encoded = pd.DataFrame({
    "encoded_feature": encoded_features,

    "importance_mean":
        permutation.importances_mean,

    "importance_std":
        permutation.importances_std
})


svm_encoded[
    "original_feature"
] = svm_encoded[
    "encoded_feature"
].map(feature_mapping)


# ------------------------------------------------------------
# Aggregate encoded features
# ------------------------------------------------------------

svm_original = (
    svm_encoded
    .groupby(
        "original_feature",
        as_index=False
    )
    .agg(
        importance_mean=(
            "importance_mean",
            "sum"
        )
    )
    .sort_values(
        "importance_mean",
        ascending=False
    )
)


svm_file = (
    RESULTS_DIR
    / "svm_permutation_importance.csv"
)


svm_original.to_csv(
    svm_file,
    index=False
)


print(
    "\nSVM permutation importance:"
)

print(
    svm_original.to_string(
        index=False
    )
)


# ------------------------------------------------------------
# SVM Plot
# ------------------------------------------------------------

svm_plot_data = (
    svm_original
    .sort_values(
        "importance_mean"
    )
)


plt.figure(
    figsize=(10, 7)
)

plt.barh(
    svm_plot_data[
        "original_feature"
    ],
    svm_plot_data[
        "importance_mean"
    ]
)

plt.xlabel(
    "Mean Decrease in F1 Score"
)

plt.ylabel(
    "Original Predictor"
)

plt.title(
    "SVM Permutation Feature Importance"
)

plt.tight_layout()


svm_plot = (
    FIGURES_DIR
    / "svm_permutation_importance.png"
)


plt.savefig(
    svm_plot,
    dpi=300,
    bbox_inches="tight"
)

plt.close()


# ============================================================
# PART D
# COMBINED FEATURE IMPORTANCE
# ============================================================

print("\n" + "=" * 70)
print("PART D: COMBINED FEATURE IMPORTANCE")
print("=" * 70)


# ------------------------------------------------------------
# Prepare Logistic Regression results
# ------------------------------------------------------------

logistic_combined = logistic_original[
    [
        "original_feature",
        "total_absolute_coefficient"
    ]
].copy()

logistic_combined = logistic_combined.rename(
    columns={
        "total_absolute_coefficient":
            "logistic_importance"
    }
)


# ------------------------------------------------------------
# Prepare SHAP results
# ------------------------------------------------------------

if shap_original is not None:

    shap_combined = shap_original[
        [
            "original_feature",
            "mean_absolute_shap"
        ]
    ].copy()

    shap_combined = shap_combined.rename(
        columns={
            "mean_absolute_shap":
                "gradient_boosting_shap"
        }
    )

else:

    # Create an empty table containing
    # all original predictors.
    shap_combined = pd.DataFrame({
        "original_feature":
            ORIGINAL_FEATURES,

        "gradient_boosting_shap":
            0.0
    })


# ------------------------------------------------------------
# Prepare SVM results
# ------------------------------------------------------------

svm_combined = svm_original[
    [
        "original_feature",
        "importance_mean"
    ]
].copy()

svm_combined = svm_combined.rename(
    columns={
        "importance_mean":
            "svm_permutation_importance"
    }
)


# ------------------------------------------------------------
# Merge all analyses
# ------------------------------------------------------------

combined = pd.DataFrame({
    "original_feature":
        ORIGINAL_FEATURES
})


combined = combined.merge(
    logistic_combined,
    on="original_feature",
    how="left"
)


combined = combined.merge(
    shap_combined,
    on="original_feature",
    how="left"
)


combined = combined.merge(
    svm_combined,
    on="original_feature",
    how="left"
)


# ------------------------------------------------------------
# Replace missing values
# ------------------------------------------------------------

combined = combined.fillna(0)


# ------------------------------------------------------------
# Save combined results
# ------------------------------------------------------------

combined_path = (
    RESULTS_DIR
    / "combined_feature_importance.csv"
)


combined.to_csv(
    combined_path,
    index=False
)


# ------------------------------------------------------------
# Display combined results
# ------------------------------------------------------------

print(
    "\nCombined feature importance:"
)

print(
    combined.to_string(
        index=False
    )
)


print(
    "\nCombined feature importance saved to:"
)

print(
    combined_path
)


# ============================================================
# PART E
# SAVE FEATURE MAPPING
# ============================================================

mapping_df = pd.DataFrame({
    "encoded_feature": encoded_features,

    "original_feature": [
        feature_mapping[f]
        for f in encoded_features
    ]
})


mapping_file = (
    RESULTS_DIR
    / "encoded_to_original_feature_mapping.csv"
)


mapping_df.to_csv(
    mapping_file,
    index=False
)


print(
    "\nEncoded-to-original feature mapping saved to:"
)

print(
    mapping_file
)


# ============================================================
# PART F
# SAVE A COMPLETE INTERPRETABILITY SUMMARY
# ============================================================

print("\n" + "=" * 70)
print("PART F: COMPLETE INTERPRETABILITY SUMMARY")
print("=" * 70)


summary_file = (
    RESULTS_DIR
    / "model_interpretability_summary.csv"
)


combined.to_csv(
    summary_file,
    index=False
)


print(
    "\nComplete interpretability summary saved to:"
)

print(
    summary_file
)


# ============================================================
# 10. FINAL OUTPUT
# ============================================================

print("\n" + "=" * 70)
print("MODEL INTERPRETABILITY ANALYSIS COMPLETED")
print("=" * 70)


print("\nCSV files created:")

print(
    f"- {logistic_file}"
)

if shap_original is not None:

    print(
        f"- {shap_file}"
    )

print(
    f"- {svm_file}"
)

print(
    f"- {combined_path}"
)

print(
    f"- {mapping_file}"
)

print(
    f"- {summary_file}"
)


print("\nFigure files created:")

print(
    f"- {logistic_plot}"
)

if shap_original is not None:

    print(
        f"- {shap_plot}"
    )

print(
    f"- {svm_plot}"
)


print("\nStep 4 completed successfully.")

print("=" * 70)

