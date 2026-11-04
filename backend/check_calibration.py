import pandas as pd
from sklearn.calibration import calibration_curve

data = pd.read_csv(r"..\ml\results\test_predictions.csv")

models = [
    ("Logistic Regression", "logistic_regression_probability"),
    ("SVM", "support_vector_machine_probability"),
    ("Gradient Boosting", "gradient_boosting_probability")
]

for name, column in models:
    observed, predicted = calibration_curve(
        data["Actual"],
        data[column],
        n_bins=5,
        strategy="quantile"
    )

    print("\n" + name)

    for p, o in zip(predicted, observed):
        print(f"Predicted={p:.3f}, Observed={o:.3f}")