
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_URL = "http://127.0.0.1:8000";

const MODEL_DETAILS = {
  logistic_regression: {
    description:
      "Estimates the likelihood of treatment adherence using a logistic regression model.",
    type: "Classification",
  },
  support_vector_machine: {
    description:
      "Classifies patients according to patterns learned from their treatment and healthcare characteristics.",
    type: "Classification",
  },
  gradient_boosting: {
    description:
      "Combines multiple decision trees to predict treatment adherence from patient characteristics.",
    type: "Ensemble classification",
  },
};

export default function Models() {
  const [models, setModels] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function fetchModels() {
      try {
        const response = await fetch(`${API_URL}/models`);

        if (!response.ok) {
          throw new Error("The backend could not return the available models.");
        }

        const data = await response.json();

        if (active) {
          setModels(data.models || {});
          setError("");
        }
      } catch {
        if (active) {
          setError(
            "Could not connect to the backend. Make sure your FastAPI server is running."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchModels();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
              OsteoAdhere
            </p>

            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              Machine Learning Models
            </h1>

            <p className="mt-2 max-w-2xl text-slate-600">
              View the models available for predicting osteoporosis
              treatment adherence among adults.
            </p>
          </div>

          <Link
            to="/dashboard"
            className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            Back to Dashboard
          </Link>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Available models</p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {loading ? "..." : Object.keys(models).length}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Backend connection</p>

            <p
              className={`mt-2 text-lg font-semibold ${
                error
                  ? "text-red-600"
                  : loading
                    ? "text-amber-600"
                    : "text-emerald-600"
              }`}
            >
              {loading ? "Connecting..." : error ? "Disconnected" : "Connected"}
            </p>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-slate-500">
            Loading available models...
          </div>
        ) : Object.keys(models).length === 0 ? (
          !error && (
            <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-slate-500">
              No models were returned by the backend.
            </div>
          )
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {Object.entries(models).map(([key, name]) => {
              const details = MODEL_DETAILS[key];

              return (
                <article
                  key={key}
                  className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      className="h-6 w-6"
                      aria-hidden="true"
                    >
                      <path d="M4 19V5M4 19H21" />
                      <path d="M7 15l4-4 3 2 6-7" />
                    </svg>
                  </div>

                  <h2 className="text-xl font-bold text-slate-900">
                    {name}
                  </h2>

                  <p className="mt-3 min-h-16 text-sm leading-6 text-slate-600">
                    {details?.description ||
                      "A machine learning model available in the backend."}
                  </p>

                  <div className="mt-4 border-t border-slate-100 pt-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Model type
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-700">
                      {details?.type || "Machine learning"}
                    </p>

                    <p className="mt-3 text-xs font-medium uppercase tracking-wide text-slate-400">
                      Model identifier
                    </p>

                    <p className="mt-1 break-all font-mono text-xs text-slate-600">
                      {key}
                    </p>
                  </div>

                  <Link
                    to="/prediction"
                    className="mt-5 inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    Test with Prediction
                  </Link>
                </article>
              );
            })}
          </div>
        )}

        <div className="mt-8 rounded-xl border border-blue-100 bg-blue-50 p-5">
          <h2 className="font-semibold text-slate-900">
            About model interpretability
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-700">
            Model predictions should be evaluated using appropriate
            performance metrics and interpretability techniques.
            This page displays the models registered by the backend;
            it does not independently verify their accuracy or
            explanation results.
          </p>
        </div>
      </div>
    </div>
  );
}
