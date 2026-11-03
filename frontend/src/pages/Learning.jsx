
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Brain,
  CheckCircle2,
  Clock,
  Database,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

export default function Learning() {
  const [status, setStatus] = useState("idle");

  const learningSteps = [
    {
      title: "Collect new data",
      description:
        "Add new patient treatment-adherence records to the dataset.",
      icon: Database,
    },
    {
      title: "Validate data quality",
      description:
        "Check missing values, invalid entries, and required features.",
      icon: ShieldCheck,
    },
    {
      title: "Train candidate models",
      description:
        "Train candidate models using validated and appropriately prepared data.",
      icon: Brain,
    },
    {
      title: "Evaluate performance",
      description:
        "Compare candidate models with the current model using suitable evaluation metrics.",
      icon: TrendingUp,
    },
  ];

  function handleStart() {
    setStatus("planned");
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-5">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-blue-600">
              <Brain size={18} />
              OsteoAdhere
            </div>

            <h1 className="mt-2 text-2xl font-bold">
              Continuous Learning
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage the process of improving the treatment-adherence
              prediction models with new data.
            </p>
          </div>

          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-6 py-8">
        <section className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                <RefreshCw size={26} />
              </div>

              <div>
                <h2 className="text-lg font-semibold">
                  Model improvement workflow
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                  Continuous learning provides a controlled process for
                  validating new data, training candidate models, and
                  checking whether a new model performs better before
                  it replaces the current model.
                </p>
              </div>
            </div>

            <div className="shrink-0 rounded-lg bg-amber-50 px-4 py-3">
              <p className="text-xs font-medium text-amber-700">
                Current implementation
              </p>
              <p className="mt-1 text-sm font-semibold text-amber-800">
                Workflow preview
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold">
            Learning pipeline
          </h2>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {learningSteps.map((step, index) => {
              const Icon = step.icon;

              return (
                <div
                  key={step.title}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="rounded-xl bg-slate-100 p-3 text-slate-700">
                      <Icon size={22} />
                    </div>

                    <span className="text-sm font-semibold text-slate-400">
                      STEP {index + 1}
                    </span>
                  </div>

                  <h3 className="mt-5 font-semibold">
                    {step.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-purple-50 p-3 text-purple-600">
                <Brain size={22} />
              </div>

              <div>
                <h2 className="font-semibold">
                  Model retraining
                </h2>
                <p className="text-sm text-slate-500">
                  Prepare for a future retraining process.
                </p>
              </div>
            </div>

            <p className="mt-4 text-sm leading-6 text-slate-600">
              Retraining should use validated data and a defined
              training procedure. The new model should be evaluated
              against the existing model before deployment.
            </p>

            <div className="mt-5 rounded-xl bg-slate-50 p-4">
              <div className="flex items-start gap-3">
                <Clock
                  size={19}
                  className="mt-0.5 text-slate-500"
                />
                <div>
                  <p className="text-sm font-medium">
                    Retraining status
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    No retraining job is connected to this page yet.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleStart}
              className="mt-5 w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700"
            >
              {status === "planned"
                ? "Workflow preview selected"
                : "Review Learning Workflow"}
            </button>

            {status === "planned" && (
              <p className="mt-3 text-sm text-blue-700">
                This is a workflow preview only. No model has been
                trained or changed.
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                <ShieldCheck size={22} />
              </div>

              <div>
                <h2 className="font-semibold">
                  Model validation and approval
                </h2>
                <p className="text-sm text-slate-500">
                  Protect prediction quality before deployment.
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              {[
                "Check data quality and target labels",
                "Compare accuracy, precision, recall, and F1-score",
                "Review interpretability and important features",
                "Approve the candidate model before deployment",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle2
                    size={19}
                    className="mt-0.5 shrink-0 text-emerald-600"
                  />
                  <p className="text-sm leading-6 text-slate-600">
                    {item}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm leading-6 text-amber-800">
                A candidate model should not replace the existing
                model automatically. Evaluate it first and retain
                the ability to roll back if its performance is worse.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
