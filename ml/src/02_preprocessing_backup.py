
from pathlib import Path

import joblib
import pandas as pd

from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler


# ============================================================
# 1. PATHS
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parents[2]

DATASET_PATH = (
    PROJECT_ROOT
    / "backend"
    / "data"
    / "synthetic_osteoporosis_treatment_adherence_2000.csv"
)

RESULTS_DIR = PROJECT_ROOT / "ml" / "results"
RESULTS_DIR.mkdir(parents=True, exist_ok=True)

PREPROCESSOR_PATH = RESULTS_DIR / "preprocessor.joblib"


# ============================================================
# 2. LOAD AND VALIDATE DATA
# ============================================================

print("=" * 70)
print("OSTEOPOROSIS TREATMENT ADHERENCE - DATA PREPROCESSING")
print("=" * 70)

df = pd.read_csv(DATASET_PATH)

print("\nDataset shape:", df.shape)

TARGET = "adherence_binary"

if TARGET not in df.columns:
    raise ValueError(f"Target column '{TARGET}' was not found.")

if df[TARGET].isna().any():
    raise ValueError("The target column contains missing values.")

df[TARGET] = pd.to_numeric(df[TARGET], errors="raise").astype(int)

if not set(df[TARGET].unique()).issubset({0, 1}):
    raise ValueError("Target must contain only 0 and 1.")

# Exclude identifiers and all target-related columns.
excluded_columns = [
    "patient_id",
    "adherence",
    "adherence_binary"
]

X = df.drop(
    columns=[c for c in excluded_columns if c in df.columns]
)

y = df[TARGET]

if X.shape[1] == 0:
    raise ValueError("No predictor columns remain after exclusions.")

print("Predictor columns:", X.shape[1])
print("\nTarget distribution:")
print(y.value_counts().sort_index())


# ============================================================
# 3. IDENTIFY FEATURE TYPES
# ============================================================

numeric_features = X.select_dtypes(
    include=["number"]
).columns.tolist()

categorical_features = X.select_dtypes(
    exclude=["number"]
).columns.tolist()

print("\nNumeric features:", len(numeric_features))
print("Categorical features:", len(categorical_features))


# ============================================================
# 4. DEFINE PREPROCESSING PIPELINES
# ============================================================

numeric_pipeline = Pipeline(
    steps=[
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler())
    ]
)

categorical_pipeline = Pipeline(
    steps=[
        ("imputer", SimpleImputer(strategy="most_frequent")),
        (
            "encoder",
            OneHotEncoder(
                handle_unknown="ignore",
                sparse_output=False
            )
        )
    ]
)

preprocessor = ColumnTransformer(
    transformers=[
        ("num", numeric_pipeline, numeric_features),
        ("cat", categorical_pipeline, categorical_features)
    ],
    remainder="drop"
)


# ============================================================
# 5. STRATIFIED 70:30 TRAIN-TEST SPLIT
# ============================================================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.30,
    random_state=42,
    stratify=y
)

print("\nTraining records:", len(X_train))
print("Testing records:", len(X_test))

print("\nTraining target distribution:")
print(y_train.value_counts().sort_index())

print("\nTesting target distribution:")
print(y_test.value_counts().sort_index())


# ============================================================
# 6. FIT PREPROCESSOR ON TRAINING DATA ONLY
# ============================================================

print("\nFitting preprocessing pipeline...")

X_train_processed = preprocessor.fit_transform(X_train)

X_test_processed = preprocessor.transform(X_test)

feature_names = preprocessor.get_feature_names_out()

X_train_df = pd.DataFrame(
    X_train_processed,
    columns=feature_names
)

X_test_df = pd.DataFrame(
    X_test_processed,
    columns=feature_names
)

print("\nProcessed training shape:", X_train_df.shape)
print("Processed testing shape:", X_test_df.shape)


# ============================================================
# 7. SAVE PREPROCESSOR AND PROCESSED DATA
# ============================================================

joblib.dump(preprocessor, PREPROCESSOR_PATH)

X_train_df.to_csv(
    RESULTS_DIR / "X_train_processed.csv",
    index=False
)

X_test_df.to_csv(
    RESULTS_DIR / "X_test_processed.csv",
    index=False
)

y_train.to_frame(name=TARGET).to_csv(
    RESULTS_DIR / "y_train.csv",
    index=False
)

y_test.to_frame(name=TARGET).to_csv(
    RESULTS_DIR / "y_test.csv",
    index=False
)


# ============================================================
# 8. FINAL SUMMARY
# ============================================================

print("\n" + "=" * 70)
print("PREPROCESSING COMPLETED SUCCESSFULLY")
print("=" * 70)

print("Dataset:", DATASET_PATH)
print("Training records:", len(X_train))
print("Testing records:", len(X_test))
print("Processed features:", len(feature_names))
print("Preprocessor saved:", PREPROCESSOR_PATH)

print("\nGenerated files:")
print("- X_train_processed.csv")
print("- X_test_processed.csv")
print("- y_train.csv")
print("- y_test.csv")
print("- preprocessor.joblib")

print("=" * 70)
