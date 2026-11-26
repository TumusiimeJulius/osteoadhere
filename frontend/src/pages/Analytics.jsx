
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  ArrowLeft,
  BarChart3,
  Brain,
  Database,
  RefreshCw,
  ShieldCheck,
  Users,
} from "lucide-react";

const API_URL = "https://osteoadhere.onrender.com";

export default function Analytics() {
  const [dataset, setDataset] = useState(null);
  const [models, setModels] = useState({});
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadAnalytics() {
    setLoading(true);
    setError("");

    try {
      const [dataResponse, modelsResponse, healthResponse] =
        await Promise.all([
          fetch(`${API_URL}/data`),
          fetch(`${API_URL}/models`),
          fetch(`${API_URL}/health`),
        ]);

      if (!dataResponse.ok) {
        throw new Error("Could not load the dataset.");
      }

      if (!modelsResponse.ok || !healthResponse.ok) {
        throw new Error("Could not load model or system information.");
      }

      const [data, modelData, healthData] = await Promise.all([
        dataResponse.json(),
        modelsResponse.json(),
        healthResponse.json(),
      ]);

      setDataset(data);
      setModels(modelData.models || {});
      setHealth(healthData);
    } catch (err) {
      setError(
        err.message ||
          "Unable to connect to the backend. Check that FastAPI is running."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAnalytics();
  }, []);

  const records = dataset?.records || [];
  const columns = dataset?.columns || [];

  function countValues(column) {
    const counts = {};

    records.forEach((record) => {
      const value = String(record[column] ?? "").trim();

      if (!value) return;

      counts[value] = (counts[value] || 0) + 1;
    });

    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }

  function findTargetColumn() {
    return columns.find((column) =>
      ["adherence", "treatment_adherence", "adherence_status"].includes(
        column.toLowerCase().trim()
      )
    );
  }

  const targetColumn = findTargetColumn();
  const adherenceCounts = targetColumn ? countValues(targetColumn) : [];
  const totalAdherenceRecords = adherenceCounts.reduce(
    (sum, item) => sum + item[1],
    0
  );

  const missingValues = dataset?.missing_values ?? 0;
  const missingPercentage = dataset?.missing_percentage ?? 0;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-5">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-blue-600">
              <BarChart3 size={18} />
              OsteoAdhere Analytics
            </div>

            <h1 className="mt-2 text-2xl font-bold">
              Dataset Analytics
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Explore dataset composition and adherence distribution.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={loadAnalytics}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>

            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              <ArrowLeft size={16} />
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-6 py-8">
        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {loading && !dataset ? (
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-slate-500">
            Loading analytics...
          </div>
        ) : dataset ? (
          <>
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                icon={Database}
                label="Dataset records"
                value={dataset.total_records ?? records.length}
                description="Rows in the loaded CSV"
                color="blue"
              />

              <MetricCard
                icon={BarChart3}
                label="Dataset columns"
                value={dataset.total_columns ?? columns.length}
                description="Available variables"
                color="purple"
              />

              <MetricCard
                icon={Activity}
                label="Missing values"
                value={missingValues}
                description={`${missingPercentage}% of dataset cells`}
                color="orange"
              />

              <MetricCard
                icon={Brain}
                label="Available models"
                value={Object.keys(models).length}
                description={
                  health?.status === "healthy"
                    ? "Backend reports healthy"
                    : "System status not confirmed"
                }
                color="green"
              />
            </section>

            <section className="grid gap-6 xl:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-center gap-3">
                  <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                    <Database size={21} />
                  </div>

                  <div>
                    <h2 className="font-semibold">
                      Dataset overview
                    </h2>
                    <p className="text-sm text-slate-500">
                      Loaded source and structure
                    </p>
                  </div>
                </div>

                <p className="break-all rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
                  {dataset.dataset_name || "Dataset loaded"}
                </p>

                <div className="mt-5 space-y-3">
                  <InfoRow
                    label="Records"
                    value={records.length.toLocaleString()}
                  />
                  <InfoRow
                    label="Columns"
                    value={columns.length.toLocaleString()}
                  />
                  <InfoRow
                    label="Missing cells"
                    value={missingValues.toLocaleString()}
                  />
                  <InfoRow
                    label="Missing percentage"
                    value={`${missingPercentage}%`}
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-center gap-3">
                  <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                    <Users size={21} />
                  </div>

                  <div>
                    <h2 className="font-semibold">
                      Treatment adherence distribution
                    </h2>
                    <p className="text-sm text-slate-500">
                      Counts calculated from the dataset
                    </p>
                  </div>
                </div>

                {!targetColumn ? (
                  <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
                    No recognised adherence target column was found.
                    Check the dataset column names.
                  </p>
                ) : adherenceCounts.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    No adherence values are available.
                  </p>
                ) : (
                  <div className="space-y-5">
                    {adherenceCounts.map(([label, count]) => {
                      const percentage =
                        totalAdherenceRecords > 0
                          ? (count / totalAdherenceRecords) * 100
                          : 0;

                      return (
                        <div key={label}>
                          <div className="mb-2 flex items-center justify-between gap-3">
                            <span className="text-sm font-medium text-slate-700">
                              {label}
                            </span>
                            <span className="text-sm text-slate-600">
                              {count} ({percentage.toFixed(1)}%)
                            </span>
                          </div>

                          <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full bg-blue-600"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}

                    <p className="border-t border-slate-100 pt-3 text-xs text-slate-500">
                      Target column: {targetColumn}
                    </p>
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-xl bg-purple-50 p-3 text-purple-600">
                  <Brain size={21} />
                </div>

                <div>
                  <h2 className="font-semibold">
                    Registered machine learning models
                  </h2>
                  <p className="text-sm text-slate-500">
                    Models reported by your backend API.
                  </p>
                </div>
              </div>

              {Object.keys(models).length === 0 ? (
                <p className="text-sm text-slate-500">
                  No models were returned by the backend.
                </p>
              ) : (
                <div className="grid gap-3 md:grid-cols-3">
                  {Object.entries(models).map(([key, name]) => (
                    <div
                      key={key}
                      className="rounded-xl border border-slate-200 p-4"
                    >
                      <p className="font-semibold text-slate-800">
                        {name}
                      </p>
                      <p className="mt-2 break-all font-mono text-xs text-slate-500">
                        {key}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-5 flex items-start gap-3 rounded-lg bg-slate-50 p-4">
                <ShieldCheck
                  size={20}
                  className="mt-0.5 shrink-0 text-slate-500"
                />
                <p className="text-sm leading-6 text-slate-600">
                  Dataset statistics are calculated from the CSV file.
                  This page does not report model accuracy, precision,
                  recall, F1-score, or ROC-AUC because those metrics
                  must be obtained from actual model evaluation results.
                </p>
              </div>
            </section>
          </>
        ) : null}
      </main>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, description, color }) {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
    green: "bg-emerald-50 text-emerald-600",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className={`rounded-xl p-3 ${colors[color]}`}>
          <Icon size={21} />
        </div>
        <span className="text-xs text-slate-400">Analytics</span>
      </div>

      <p className="mt-5 text-3xl font-bold text-slate-900">
        {Number(value).toLocaleString()}
      </p>

      <p className="mt-1 text-sm font-medium text-slate-700">
        {label}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {description}
      </p>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-semibold text-slate-800">
        {value}
      </span>
    </div>
  );
}
