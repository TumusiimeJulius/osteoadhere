from pathlib import Path

import pandas as pd

from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
import joblib


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
RESULTS_DIR.mkdir(parents=True, exist_ok=True)

PREPROCESSOR_FILE = RESULTS_DIR / "preprocessor.joblib"


# ============================================================
# 2. LOAD DATA
# ============================================================

print("=" * 70)
print("OSTEOPOROSIS TREATMENT ADHERENCE - DATA PREPROCESSING")
print("=" * 70)

print("\nLoading dataset:")
print(DATA_FILE)

if not DATA_FILE.exists():
    raise FileNotFoundError(
        f"Dataset not found:\n{DATA_FILE}"
    )

df = pd.read_csv(DATA_FILE)

print(f"\nDataset shape: {df.shape}")


# ============================================================
# 3. REMOVE IDENTIFIER AND POTENTIAL DATA LEAKAGE
# ============================================================

print("\n" + "=" * 70)
print("REMOVING NON-PREDICTIVE / LEAKAGE VARIABLES")
print("=" * 70)

# patient_id is an identifier and should not be used for prediction.
#
# adherence_score is excluded because it appears to encode the
# adherence outcome. Using it could cause target leakage.

columns_to_remove = [
    "patient_id",
    "adherence_score"
]

df_model = df.drop(columns=columns_to_remove)

print("Removed columns:")
for column in columns_to_remove:
    print(f"- {column}")


# ============================================================
# 4. SEPARATE FEATURES AND TARGET
# ============================================================

print("\n" + "=" * 70)
print("SEPARATING FEATURES AND TARGET")
print("=" * 70)

X = df_model.drop(columns=["adherence"])
y = df_model["adherence"]

print(f"\nNumber of features before encoding: {X.shape[1]}")
print(f"Number of records: {X.shape[0]}")


# ============================================================
# 5. ENCODE TARGET
# ============================================================

print("\n" + "=" * 70)
print("ENCODING TARGET VARIABLE")
print("=" * 70)

target_mapping = {
    "Non-adherent": 0,
    "Adherent": 1
}

y = y.map(target_mapping)

if y.isnull().any():
    raise ValueError(
        "The adherence column contains unexpected values."
    )

y = y.astype(int)

print("\nTarget mapping:")
print("Non-adherent = 0")
print("Adherent     = 1")

print("\nTarget distribution:")
print(y.value_counts().sort_index())


# ============================================================
# 6. IDENTIFY NUMERICAL AND CATEGORICAL FEATURES
# ============================================================

print("\n" + "=" * 70)
print("IDENTIFYING FEATURE TYPES")
print("=" * 70)

numeric_features = X.select_dtypes(
    include=["int64", "float64"]
).columns.tolist()

categorical_features = X.select_dtypes(
    include=["str"]
).columns.tolist()

print("\nNumerical features:")
for feature in numeric_features:
    print(f"- {feature}")

print("\nCategorical features:")
for feature in categorical_features:
    print(f"- {feature}")


# ============================================================
# 7. NUMERICAL PREPROCESSING
# ============================================================

numeric_pipeline = Pipeline(
    steps=[
        (
            "imputer",
            SimpleImputer(strategy="median")
        ),
        (
            "scaler",
            StandardScaler()
        )
    ]
)


# ============================================================
# 8. CATEGORICAL PREPROCESSING
# ============================================================

categorical_pipeline = Pipeline(
    steps=[
        (
            "imputer",
            SimpleImputer(strategy="most_frequent")
        ),
        (
            "onehot",
            OneHotEncoder(
                handle_unknown="ignore",
                sparse_output=False
            )
        )
    ]
)


# ============================================================
# 9. COMBINE PREPROCESSING
# ============================================================

preprocessor = ColumnTransformer(
    transformers=[
        (
            "numerical",
            numeric_pipeline,
            numeric_features
        ),
        (
            "categorical",
            categorical_pipeline,
            categorical_features
        )
    ]
)


# ============================================================
# 10. TRAIN / TEST SPLIT
# ============================================================

print("\n" + "=" * 70)
print("TRAIN / TEST SPLIT")
print("=" * 70)

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)

print(f"\nTraining records: {len(X_train)}")
print(f"Testing records:  {len(X_test)}")

print("\nTraining target distribution:")
print(y_train.value_counts().sort_index())

print("\nTesting target distribution:")
print(y_test.value_counts().sort_index())


# ============================================================
# 11. FIT PREPROCESSOR ONLY ON TRAINING DATA
# ============================================================

print("\n" + "=" * 70)
print("FITTING PREPROCESSING PIPELINE")
print("=" * 70)

X_train_processed = preprocessor.fit_transform(X_train)

X_test_processed = preprocessor.transform(X_test)

print("\nPreprocessing completed.")

print(
    f"Processed training shape: {X_train_processed.shape}"
)

print(
    f"Processed testing shape:  {X_test_processed.shape}"
)


# ============================================================
# 12. SAVE PREPROCESSOR
# ============================================================

joblib.dump(
    preprocessor,
    PREPROCESSOR_FILE
)

print("\nPreprocessor saved to:")
print(PREPROCESSOR_FILE)


# ============================================================
# 13. SAVE PROCESSED DATA
# ============================================================

train_output = RESULTS_DIR / "X_train_processed.csv"
test_output = RESULTS_DIR / "X_test_processed.csv"

train_target_output = RESULTS_DIR / "y_train.csv"
test_target_output = RESULTS_DIR / "y_test.csv"

pd.DataFrame(X_train_processed).to_csv(
    train_output,
    index=False
)

pd.DataFrame(X_test_processed).to_csv(
    test_output,
    index=False
)

y_train.to_csv(
    train_target_output,
    index=False
)

y_test.to_csv(
    test_target_output,
    index=False
)


# ============================================================
# 14. FINAL SUMMARY
# ============================================================

print("\n" + "=" * 70)
print("PREPROCESSING SUMMARY")
print("=" * 70)

print(f"\nOriginal records: {len(df)}")
print(f"Training records: {len(X_train)}")
print(f"Testing records: {len(X_test)}")

print(
    f"\nOriginal predictor variables: {X.shape[1]}"
)

print(
    f"Encoded predictor variables: {X_train_processed.shape[1]}"
)

print("\nFiles created:")
print(f"- {train_output}")
print(f"- {test_output}")
print(f"- {train_target_output}")
print(f"- {test_target_output}")
print(f"- {PREPROCESSOR_FILE}")

print("\nPreprocessing completed successfully.")

print("=" * 70)