from pathlib import Path
import pandas as pd


# ============================================================
# 1. LOCATE DATASET
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parents[2]

DATA_FILE = (
    PROJECT_ROOT
    / "ml"
    / "data"
    / "synthetic_osteoporosis_treatment_adherence_dataset.csv"
)


# ============================================================
# 2. LOAD DATASET
# ============================================================

print("=" * 70)
print("OSTEOPOROSIS TREATMENT ADHERENCE DATA INSPECTION")
print("=" * 70)

print(f"\nDataset path:")
print(DATA_FILE)

if not DATA_FILE.exists():
    print("\nERROR: Dataset file was not found.")
    print("Expected location:")
    print(DATA_FILE)
    raise SystemExit(1)

df = pd.read_csv(DATA_FILE)


# ============================================================
# 3. BASIC INFORMATION
# ============================================================

print("\n" + "=" * 70)
print("1. DATASET SHAPE")
print("=" * 70)

print(f"Rows: {df.shape[0]}")
print(f"Columns: {df.shape[1]}")


# ============================================================
# 4. COLUMN NAMES
# ============================================================

print("\n" + "=" * 70)
print("2. COLUMN NAMES")
print("=" * 70)

for number, column in enumerate(df.columns, start=1):
    print(f"{number}. {column}")


# ============================================================
# 5. FIRST FIVE RECORDS
# ============================================================

print("\n" + "=" * 70)
print("3. FIRST FIVE RECORDS")
print("=" * 70)

print(df.head().to_string())


# ============================================================
# 6. DATA TYPES
# ============================================================

print("\n" + "=" * 70)
print("4. DATA TYPES")
print("=" * 70)

print(df.dtypes)


# ============================================================
# 7. DATASET INFORMATION
# ============================================================

print("\n" + "=" * 70)
print("5. DATASET INFORMATION")
print("=" * 70)

df.info()


# ============================================================
# 8. MISSING VALUES
# ============================================================

print("\n" + "=" * 70)
print("6. MISSING VALUES")
print("=" * 70)

missing = df.isnull().sum()

missing_table = pd.DataFrame({
    "Missing Values": missing,
    "Missing Percentage": (missing / len(df) * 100).round(2)
})

print(missing_table)


# ============================================================
# 9. DUPLICATE RECORDS
# ============================================================

print("\n" + "=" * 70)
print("7. DUPLICATE RECORDS")
print("=" * 70)

duplicates = df.duplicated().sum()

print(f"Number of duplicate rows: {duplicates}")


# ============================================================
# 10. TARGET VARIABLE
# ============================================================

print("\n" + "=" * 70)
print("8. TARGET VARIABLE: ADHERENCE")
print("=" * 70)

if "adherence" in df.columns:

    print("\nClass counts:")
    print(df["adherence"].value_counts(dropna=False))

    print("\nClass percentages:")
    print(
        (df["adherence"].value_counts(normalize=True, dropna=False) * 100)
        .round(2)
    )

else:
    print("ERROR: 'adherence' column was not found.")


# ============================================================
# 11. NUMERICAL VARIABLES
# ============================================================

print("\n" + "=" * 70)
print("9. NUMERICAL VARIABLES")
print("=" * 70)

numeric_columns = df.select_dtypes(include="number").columns

print("Numerical columns:")
for column in numeric_columns:
    print(f"- {column}")

print("\nSummary statistics:")
print(df[numeric_columns].describe().round(2))


# ============================================================
# 12. CATEGORICAL VARIABLES
# ============================================================

print("\n" + "=" * 70)
print("10. CATEGORICAL VARIABLES")
print("=" * 70)

categorical_columns = df.select_dtypes(include="object").columns

for column in categorical_columns:

    print(f"\n{column}")
    print("-" * len(column))

    print(df[column].value_counts(dropna=False))


# ============================================================
# 13. ADHERENCE SCORE CHECK
# ============================================================

print("\n" + "=" * 70)
print("11. ADHERENCE SCORE CHECK")
print("=" * 70)

if "adherence_score" in df.columns:

    print("Adherence score statistics:")
    print(df["adherence_score"].describe().round(3))

    print("\nAdherence score by target:")
    print(
        df.groupby("adherence", dropna=False)["adherence_score"]
        .agg(["count", "mean", "min", "max"])
        .round(3)
    )


# ============================================================
# 14. DATASET SUMMARY
# ============================================================

print("\n" + "=" * 70)
print("12. FINAL SUMMARY")
print("=" * 70)

print(f"Total records: {len(df)}")
print(f"Total variables: {len(df.columns)}")
print(f"Duplicate rows: {duplicates}")
print(f"Total missing values: {df.isnull().sum().sum()}")

print("\nInspection completed successfully.")

print("=" * 70)