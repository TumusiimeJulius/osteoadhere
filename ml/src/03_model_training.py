
from pathlib import Path

import joblib
import pandas as pd

from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.calibration import CalibratedClassifierCV
from sklearn.ensemble import GradientBoostingClassifier

from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    confusion_matrix,
    classification_report
)


# ============================================================
# 1. PATHS
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parents[2]

RESULTS_DIR = PROJECT_ROOT / "ml" / "results"
MODELS_DIR = RESULTS_DIR / "models"

MODELS_DIR.mkdir(parents=True, exist_ok=True)


X_TRAIN_FILE = RESULTS_DIR / "X_train_processed.csv"
X_TEST_FILE = RESULTS_DIR / "X_test_processed.csv"
Y_TRAIN_FILE = RESULTS_DIR / "y_train.csv"
Y_TEST_FILE = RESULTS_DIR / "y_test.csv"


# ============================================================
# 2. LOAD PROCESSED DATA
# ============================================================

print("=" * 70)
print("OSTEOPOROSIS TREATMENT ADHERENCE - MODEL TRAINING")
print("=" * 70)

print("\nLoading processed datasets...")

X_train = pd.read_csv(X_TRAIN_FILE)
X_test = pd.read_csv(X_TEST_FILE)

y_train = pd.read_csv(Y_TRAIN_FILE).squeeze("columns")
y_test = pd.read_csv(Y_TEST_FILE).squeeze("columns")

print(f"\nTraining feature shape: {X_train.shape}")
print(f"Testing feature shape:  {X_test.shape}")

print(f"Training target shape: {y_train.shape}")
print(f"Testing target shape:  {y_test.shape}")


# ============================================================
# 3. DEFINE MODELS
# ============================================================

print("\n" + "=" * 70)
print("DEFINING MACHINE LEARNING MODELS")
print("=" * 70)

models = {
    "Logistic Regression": LogisticRegression(
        max_iter=1000,
        random_state=42
    ),

    # SVC probability=True is deprecated in newer
    # versions of scikit-learn.
    # CalibratedClassifierCV provides probability estimates
    # without using the deprecated parameter.
    "Support Vector Machine": CalibratedClassifierCV(
        SVC(),
        ensemble=False
    ),

    "Gradient Boosting": GradientBoostingClassifier(
        random_state=42
    )
}

for model_name in models:
    print(f"- {model_name}")


# ============================================================
# 4. TRAIN MODELS
# ============================================================

print("\n" + "=" * 70)
print("TRAINING MODELS")
print("=" * 70)

trained_models = {}

for model_name, model in models.items():

    print(f"\nTraining {model_name}...")

    model.fit(X_train, y_train)

    trained_models[model_name] = model

    print(f"{model_name} training completed.")


# ============================================================
# 5. EVALUATE MODELS
# ============================================================

print("\n" + "=" * 70)
print("MODEL EVALUATION")
print("=" * 70)

evaluation_results = []


for model_name, model in trained_models.items():

    print("\n" + "-" * 70)
    print(model_name)
    print("-" * 70)

    # --------------------------------------------------------
    # Predictions
    # --------------------------------------------------------

    y_pred = model.predict(X_test)

    # Probability for positive class
    y_probability = model.predict_proba(X_test)[:, 1]

    # --------------------------------------------------------
    # Metrics
    # --------------------------------------------------------

    accuracy = accuracy_score(
        y_test,
        y_pred
    )

    precision = precision_score(
        y_test,
        y_pred,
        zero_division=0
    )

    recall = recall_score(
        y_test,
        y_pred,
        zero_division=0
    )

    f1 = f1_score(
        y_test,
        y_pred,
        zero_division=0
    )

    roc_auc = roc_auc_score(
        y_test,
        y_probability
    )

    # --------------------------------------------------------
    # Confusion matrix
    # --------------------------------------------------------

    cm = confusion_matrix(
        y_test,
        y_pred
    )

    # --------------------------------------------------------
    # Print metrics
    # --------------------------------------------------------

    print(f"\nAccuracy : {accuracy:.4f}")
    print(f"Precision: {precision:.4f}")
    print(f"Recall   : {recall:.4f}")
    print(f"F1-score : {f1:.4f}")
    print(f"ROC-AUC  : {roc_auc:.4f}")

    print("\nConfusion Matrix:")
    print(cm)

    print("\nClassification Report:")

    print(
        classification_report(
            y_test,
            y_pred,
            target_names=[
                "Non-adherent",
                "Adherent"
            ],
            zero_division=0
        )
    )

    # --------------------------------------------------------
    # Store results
    # --------------------------------------------------------

    evaluation_results.append({
        "Model": model_name,
        "Accuracy": accuracy,
        "Precision": precision,
        "Recall": recall,
        "F1_Score": f1,
        "ROC_AUC": roc_auc
    })


# ============================================================
# 6. CREATE RESULTS TABLE
# ============================================================

print("\n" + "=" * 70)
print("MODEL COMPARISON")
print("=" * 70)

results_df = pd.DataFrame(
    evaluation_results
)

print("\n")

print(
    results_df.to_string(
        index=False,
        float_format=lambda x: f"{x:.4f}"
    )
)


# ============================================================
# 7. SAVE EVALUATION RESULTS
# ============================================================

results_file = (
    RESULTS_DIR /
    "model_evaluation_results.csv"
)

results_df.to_csv(
    results_file,
    index=False
)

print("\nEvaluation results saved to:")
print(results_file)


# ============================================================
# 8. SAVE TRAINED MODELS
# ============================================================

print("\n" + "=" * 70)
print("SAVING TRAINED MODELS")
print("=" * 70)

model_files = {
    "Logistic Regression":
        MODELS_DIR / "logistic_regression.joblib",

    "Support Vector Machine":
        MODELS_DIR / "support_vector_machine.joblib",

    "Gradient Boosting":
        MODELS_DIR / "gradient_boosting.joblib"
}


for model_name, model in trained_models.items():

    model_file = model_files[model_name]

    joblib.dump(
        model,
        model_file
    )

    print(f"\n{model_name} saved to:")
    print(model_file)


# ============================================================
# 9. SAVE PREDICTIONS
# ============================================================

print("\n" + "=" * 70)
print("SAVING TEST PREDICTIONS")
print("=" * 70)

prediction_results = pd.DataFrame({
    "Actual": y_test
})


for model_name, model in trained_models.items():

    safe_name = (
        model_name
        .lower()
        .replace(" ", "_")
        .replace("-", "_")
    )

    prediction_results[
        f"{safe_name}_prediction"
    ] = model.predict(X_test)

    prediction_results[
        f"{safe_name}_probability"
    ] = model.predict_proba(X_test)[:, 1]


predictions_file = (
    RESULTS_DIR /
    "test_predictions.csv"
)

prediction_results.to_csv(
    predictions_file,
    index=False
)

print("\nTest predictions saved to:")
print(predictions_file)


# ============================================================
# 10. FINAL SUMMARY
# ============================================================

print("\n" + "=" * 70)
print("MODEL TRAINING COMPLETED SUCCESSFULLY")
print("=" * 70)

print("\nModels trained:")

for model_name in trained_models:
    print(f"- {model_name}")


print("\nFiles created:")

print(f"- {results_file}")
print(f"- {predictions_file}")


for model_name, model_file in model_files.items():
    print(f"- {model_file}")


print("\nModel training and evaluation completed.")
print("=" * 70)

