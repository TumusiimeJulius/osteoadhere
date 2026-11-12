
import pandas as pd
from sklearn.calibration import calibration_curve
from sklearn.metrics import brier_score_loss

data = pd.read_csv(r"..\ml\results\test_predictions.csv")

models = [
    ("Logistic Regression", "logistic_regression_probability"),
    ("SVM", "support_vector_machine_probability"),
    ("Gradient Boosting", "gradient_boosting_probability")
]

for name, column in models:

    y_true = data["Actual"]
    y_prob = data[column]

    observed, predicted = calibration_curve(
        y_true,
        y_prob,
        n_bins=5,
        strategy="quantile"
    )

    brier = brier_score_loss(y_true, y_prob)

    print("\n" + name)
    print(f"Brier Score: {brier:.4f}")

    for p, o in zip(predicted, observed):
        print(f"Predicted={p:.3f}, Observed={o:.3f}")
