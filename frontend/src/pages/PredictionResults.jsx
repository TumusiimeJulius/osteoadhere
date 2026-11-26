
import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Activity,
  CheckCircle,
  AlertTriangle,
  Download,
} from "lucide-react";

function PredictionResults() {
  const location = useLocation();
  const navigate = useNavigate();

  const result = location.state?.result;
  const patientId = location.state?.patientId;

  const downloadResults = () => {
    window.print();
  };

  const renderInterpretability = (interpretability) => {
    const features = interpretability?.top_features || [];

    if (features.length === 0) {
      return (
        <p className="text-sm text-gray-500">
          Feature explanations are unavailable for this prediction.
        </p>
      );
    }

    return (
      <div className="mt-4">
        <div className="mb-3">
          <h3 className="font-semibold text-gray-800">
            Feature-level explanations
          </h3>

          <p className="text-xs text-gray-500">
            Explanation method: {interpretability.method || "Not specified"}
          </p>
        </div>

        <div className="space-y-3">
          {features.map((item, index) => {
            const contribution = Math.min(
              Math.max(Number(item.contribution) * 100, 0),
              100
            );

            return (
              <div
                key={`${item.feature}-${index}`}
                className="rounded-lg bg-gray-50 p-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-medium text-gray-800">
                    {item.feature}
                  </span>

                  <span
                    className={`text-xs font-semibold ${
                      item.direction === "increases"
                        ? "text-green-700"
                        : "text-red-700"
                    }`}
                  >
                    {item.direction === "increases"
                      ? "Increases model output"
                      : "Decreases model output"}
                  </span>
                </div>

                <div className="mt-2 flex items-center gap-3">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="h-full rounded-full bg-blue-600"
                      style={{ width: `${contribution}%` }}
                    />
                  </div>

                  <span className="text-xs text-gray-600">
                    {Number(item.contribution).toFixed(4)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (!result) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
        <div className="w-full max-w-lg rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <AlertTriangle className="mx-auto mb-4 text-amber-500" size={42} />

          <h1 className="text-xl font-bold text-gray-900">
            No Prediction Results
          </h1>

          <p className="mt-2 text-sm text-gray-600">
            No prediction result was found. Generate a prediction first to
            view the result here.
          </p>

          <Link
            to="/prediction"
            className="mt-6 inline-flex rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800"
          >
            Go to Prediction Form
          </Link>
        </div>
      </div>
    );
  }

  const adherent = result.prediction === "Adherent";

  const adherentProbability = Math.min(
    Math.max(Number(result.probability_adherent) * 100 || 0, 0),
    100
  );

  const nonAdherentProbability = Math.min(
    Math.max(Number(result.probability_non_adherent) * 100 || 0, 0),
    100
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 print:min-h-0 print:bg-white print:p-0">
      <style>
        {`
          @page {
            size: A4 portrait;
            margin: 12mm;
          }

          @media print {
            html, body {
              background: white !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }

            .no-print {
              display: none !important;
            }

            .results-container {
              max-width: none !important;
              width: 100% !important;
              margin: 0 !important;
            }

            .result-card,
            .clinical-notice {
              break-inside: avoid;
              page-break-inside: avoid;
              box-shadow: none !important;
            }
          }
        `}
      </style>

      <div className="results-container mx-auto max-w-5xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
              Prediction Results
            </h1>

            <p className="mt-2 text-gray-600">
              Osteoporosis treatment adherence prediction using the selected
              Support Vector Machine model.
            </p>
          </div>

          <div className="no-print flex flex-wrap gap-3">
            <button
              type="button"
              onClick={downloadResults}
              className="inline-flex items-center gap-2 rounded-lg bg-green-700 px-4 py-2.5 font-semibold text-white hover:bg-green-800"
            >
              <Download size={18} />
              Download Results
            </button>

            <button
              type="button"
              onClick={() => navigate("/prediction")}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 font-semibold text-gray-700 hover:bg-gray-100"
            >
              <ArrowLeft size={18} />
              New Prediction
            </button>
          </div>
        </div>

        {patientId && (
          <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
            Results generated for patient record: <strong>{patientId}</strong>
          </div>
        )}

        <div className="mb-6 flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4">
          <CheckCircle className="text-green-600" size={22} />

          <div>
            <p className="font-semibold text-green-800">
              Prediction generated successfully
            </p>

            <p className="text-sm text-green-700">
              The selected Support Vector Machine model has completed the
              prediction.
            </p>
          </div>
        </div>

        <div className="result-card rounded-xl border border-gray-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex items-center gap-2">
            <Activity className="text-blue-700" size={22} />

            <h2 className="text-xl font-bold text-gray-900">
              {result.model || "Support Vector Machine"}
            </h2>
          </div>

          <div
            className={`mt-6 rounded-lg p-5 ${
              adherent ? "bg-green-50" : "bg-red-50"
            }`}
          >
            <p className="text-sm text-gray-600">
              Predicted Treatment Adherence
            </p>

            <p
              className={`mt-2 text-3xl font-bold ${
                adherent ? "text-green-700" : "text-red-700"
              }`}
            >
              {result.prediction}
            </p>
          </div>

          <div className="mt-6 space-y-5">
            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span className="font-medium text-gray-700">
                  Probability of Adherence
                </span>

                <strong>{adherentProbability.toFixed(2)}%</strong>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-green-600"
                  style={{ width: `${adherentProbability}%` }}
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex justify-between text-sm">
                <span className="font-medium text-gray-700">
                  Probability of Non-adherence
                </span>

                <strong>{nonAdherentProbability.toFixed(2)}%</strong>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-red-600"
                  style={{ width: `${nonAdherentProbability}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mt-7 border-t border-gray-100 pt-5">
            {renderInterpretability(result.interpretability)}
          </div>
        </div>

        <div className="clinical-notice mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <strong>Clinical decision-support notice:</strong> These are
          machine-learning predictions, not a clinical diagnosis. Feature
          explanations describe model behaviour and should not be interpreted
          as proof of causation. Healthcare professionals should review
          predictions alongside clinical information.
        </div>
      </div>
    </div>
  );
}

export default PredictionResults;
