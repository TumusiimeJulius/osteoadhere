
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_URL = "http://127.0.0.1:8000";

const MODEL_DETAILS = {
  support_vector_machine: {
    description:
      "Predicts osteoporosis treatment adherence by identifying patterns in patients' treatment and healthcare characteristics. It is the selected model for this system.",
    type: "Support Vector Classification",
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
          throw new Error("The backend could not return the selected model.");
        }

        const data = await response.json();

        if (active) {
          const availableModels = data.models || {};

          setModels(
            Object.fromEntries(
              Object.entries(availableModels).filter(
                ([key]) => key === "support_vector_machine"
              )
            )
          );
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
              Machine Learning Model
            </h1>

            <p className="mt-2 max-w-2xl text-slate-600">
              View the selected machine learning model used for predicting
              osteoporosis treatment adherence among adults.
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
            <p className="text-sm text-slate-500">Selected models</p>
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
            Loading selected model...
          </div>
        ) : Object.keys(models).length === 0 ? (
          !error && (
            <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-slate-500">
              The selected SVM model was not returned by the backend.
            </div>
          )
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {Object.entries(models).map(([key, name]) => {
              const details = MODEL_DETAILS[key];

              return (
                <article
                  key={key}
                  className="rounded-xl border border-blue-200 bg-white p-6 shadow-sm"
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
                    {details.description}
                  </p>

                  <div className="mt-4 border-t border-slate-100 pt-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Model type
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-700">
                      {details.type}
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
            The selected Support Vector Machine model provides predictions
            supported by feature-level explanations. These explanations
            help users understand how input characteristics contribute
            to individual predictions. They do not establish causal
            relationships or independently verify clinical accuracy.
          </p>
        </div>
      </div>
    </div>
  );
}
