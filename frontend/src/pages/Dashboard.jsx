
import { useEffect, useState } from "react";
import {
  Activity,
  Brain,
  FileText,
  LayoutDashboard,
  LogOut,
  Settings,
  ShieldCheck,
  Users,
  BarChart3,
  RefreshCw,
  ChevronRight,
  ClipboardList,
  CreditCard,
  Clock,
  CheckCircle,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import {
  getHealth,
  getModels,
  removeToken,
} from "../services/api";

function Dashboard() {
  const navigate = useNavigate();

  const [health, setHealth] = useState(null);
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user") || "null");

  const trialLimit = 2;
  const trialUsed = Number(user?.trial_predictions_used || 0);
  const trialRemaining = Math.max(0, trialLimit - trialUsed);

  const subscriptionActive =
    user?.subscription_status === "active" &&
    (!user?.subscription_expires_at ||
      new Date(user.subscription_expires_at) > new Date());

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    setLoading(true);

    try {
      const [healthData, modelsData] = await Promise.all([
        getHealth(),
        getModels(),
      ]);

      setHealth(healthData);

      const modelList = Object.entries(modelsData.models || {}).map(
        ([key, name]) => ({
          key,
          name,
        })
      );

      setModels(modelList);
    } catch (error) {
      console.error("Dashboard loading error:", error);
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    removeToken();
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  }

  const navigation = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { name: "Predictions", icon: Brain, path: "/prediction" },
    {
      name: "Prediction Results",
      icon: ClipboardList,
      path: "/prediction-results",
    },
    { name: "Patients", icon: Users, path: "/patients" },
    { name: "Models", icon: Activity, path: "/models" },
    { name: "Analytics", icon: BarChart3, path: "/analytics" },
    { name: "Learning", icon: RefreshCw, path: "/learning" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">

        {/* SIDEBAR */}
        <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-slate-200 bg-white">

          <div className="flex h-20 items-center border-b border-slate-200 px-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
              <ShieldCheck size={22} />
            </div>

            <div className="ml-3">
              <h1 className="text-sm font-bold text-slate-900">
                OsteoAdhere
              </h1>

              <p className="text-xs text-slate-500">
                ML Prediction System
              </p>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-6">

            <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Main
            </p>

            <div className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = item.path === "/dashboard";

                return (
                  <button
                    key={item.name}
                    onClick={() => navigate(item.path)}
                    className={`flex w-full items-center rounded-xl px-3 py-3 text-sm font-medium transition ${
                      active
                        ? "bg-blue-50 text-blue-700"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <Icon size={19} />

                    <span className="ml-3">{item.name}</span>

                    {active && (
                      <ChevronRight size={16} className="ml-auto" />
                    )}
                  </button>
                );
              })}
            </div>

            <p className="mb-3 mt-8 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
              System
            </p>

            <button
              onClick={() => navigate("/settings")}
              className="flex w-full items-center rounded-xl px-3 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
            >
              <Settings size={19} />
              <span className="ml-3">Settings</span>
            </button>
          </nav>

          {/* USER */}
          <div className="border-t border-slate-200 p-4">
            <div className="mb-3 rounded-xl bg-slate-50 p-3">
              <p className="truncate text-sm font-semibold text-slate-900">
                {user?.full_name || "System User"}
              </p>

              <p className="truncate text-xs text-slate-500">
                {user?.email || "User"}
              </p>

              <p className="mt-1 text-xs capitalize text-blue-600">
                {user?.role || "user"}
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="flex w-full items-center rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
            >
              <LogOut size={18} />
              <span className="ml-3">Sign Out</span>
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="ml-64 flex-1">

          <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white/95 px-8 backdrop-blur">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Dashboard
              </h2>

              <p className="text-sm text-slate-500">
                Osteoporosis treatment adherence management
              </p>
            </div>

            <button
              onClick={loadDashboard}
              className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              <RefreshCw
                size={16}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </header>

          <div className="p-8">

            {/* WELCOME */}
            <section className="mb-8 rounded-2xl bg-blue-600 p-7 text-white shadow-sm">
              <div className="max-w-3xl">
                <p className="mb-2 text-sm font-medium text-blue-100">
                  Welcome back
                </p>

                <h3 className="text-2xl font-bold">
                  {user?.full_name || "Healthcare User"}
                </h3>

                <p className="mt-2 text-sm leading-6 text-blue-100">
                  Use the system to assess osteoporosis treatment adherence,
                  review patient information, analyse model predictions,
                  and monitor the machine learning system.
                </p>

                <button
                  onClick={() => navigate("/prediction")}
                  className="mt-5 inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-50"
                >
                  Generate Predictions
                  <ChevronRight size={17} />
                </button>
              </div>
            </section>

            {/* SUBSCRIPTION NOTIFICATION */}
            <section className="mb-8 overflow-hidden rounded-2xl border border-blue-200 bg-white shadow-sm">

              <div className="border-b border-slate-100 bg-blue-50/70 px-6 py-4">
                <div className="flex items-center gap-2">
                  <CreditCard size={20} className="text-blue-600" />
                  <h3 className="font-bold text-slate-900">
                    Subscription and Free Trial
                  </h3>
                </div>
              </div>

              <div className="flex flex-col justify-between gap-6 p-6 lg:flex-row lg:items-center">

                <div className="flex-1">
                  {subscriptionActive ? (
                    <>
                      <div className="flex items-center gap-2">
                        <CheckCircle size={20} className="text-green-600" />
                        <h4 className="font-bold text-green-700">
                          Active Subscription
                        </h4>
                      </div>

                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        Your {user?.subscription_plan || "subscription"} plan
                        is currently active. You have access to the system's
                        subscription features.
                      </p>
                    </>
                  ) : trialRemaining > 0 ? (
                    <>
                      <div className="flex items-center gap-2">
                        <Clock size={20} className="text-blue-600" />
                        <h4 className="font-bold text-slate-900">
                          Explore OsteoAdhere with Your Free Trial
                        </h4>
                      </div>

                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        Your account includes two free prediction attempts.
                        After using them, you will need a subscription to
                        continue generating predictions.
                      </p>

                      <p className="mt-3 text-sm font-semibold text-blue-700">
                        {trialUsed} of {trialLimit} free predictions used.
                        {" "}{trialRemaining} remaining.
                      </p>

                      <div className="mt-3 h-2 w-full max-w-md overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-blue-600 transition-all"
                          style={{
                            width: `${(trialUsed / trialLimit) * 100}%`,
                          }}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <CreditCard size={20} className="text-amber-600" />
                        <h4 className="font-bold text-slate-900">
                          Your Free Trial Has Ended
                        </h4>
                      </div>

                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        You have used all your free prediction attempts.
                        Choose a subscription plan to continue accessing
                        prediction services.
                      </p>
                    </>
                  )}

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                      2 Free Predictions
                    </span>

                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                      Monthly Plan
                    </span>

                    <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">
                      Annual Plan
                    </span>
                  </div>
                </div>

                <div className="flex shrink-0 flex-col gap-3 lg:w-56">
                  <button
                    onClick={() => navigate("/subscription")}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                  >
                    {subscriptionActive ? "Manage Subscription" : "Continue"}
                    <ChevronRight size={18} />
                  </button>

                  <p className="text-center text-xs leading-5 text-slate-400">
                    Monthly and annual plans available.
                    <br />
                    Demonstration payment only.
                  </p>
                </div>

              </div>
            </section>

            {/* STAT CARDS */}
            <section className="mb-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">

              {/* PATIENTS */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                    <Users size={22} />
                  </div>

                  <span className="text-xs font-medium text-slate-400">
                    Records
                  </span>
                </div>

                <p className="mt-5 text-3xl font-bold text-slate-900">—</p>
                <p className="mt-1 text-sm text-slate-500">Patients</p>
              </div>

              {/* PREDICTIONS */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="rounded-xl bg-purple-50 p-3 text-purple-600">
                    <FileText size={22} />
                  </div>

                  <span className="text-xs font-medium text-slate-400">
                    Activity
                  </span>
                </div>

                <p className="mt-5 text-3xl font-bold text-slate-900">—</p>
                <p className="mt-1 text-sm text-slate-500">Predictions</p>
              </div>

              {/* MODELS */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                    <Brain size={22} />
                  </div>

                  <span className="text-xs font-medium text-slate-400">
                    Available
                  </span>
                </div>

                <p className="mt-5 text-3xl font-bold text-slate-900">
                  {models.length}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Machine Learning Models
                </p>
              </div>

              {/* SYSTEM STATUS */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="rounded-xl bg-green-50 p-3 text-green-600">
                    <Activity size={22} />
                  </div>

                  <span className="text-xs font-medium text-slate-400">
                    API
                  </span>
                </div>

                <p className="mt-5 text-xl font-bold text-green-600">
                  {health?.status === "healthy"
                    ? "Healthy"
                    : "Unavailable"}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  System Status
                </p>
              </div>

            </section>

            {/* AVAILABLE MODELS */}
            <section className="grid gap-6">
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      Available Models
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      Models currently available for prediction
                    </p>
                  </div>

                  <button
                    onClick={() => navigate("/models")}
                    className="text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    View models
                  </button>
                </div>

                <div className="divide-y divide-slate-100">
                  {models.length > 0 ? (
                    models.map((model) => (
                      <div
                        key={model.key}
                        className="flex items-center justify-between px-6 py-4"
                      >
                        <div className="flex items-center gap-4">
                          <div className="rounded-lg bg-slate-100 p-2.5">
                            <Brain size={18} className="text-slate-600" />
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              {model.name}
                            </p>

                            <p className="text-xs text-slate-500">
                              Interpretable prediction model
                            </p>
                          </div>
                        </div>

                        <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                          Available
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="px-6 py-8 text-center text-sm text-slate-500">
                      No models available.
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* SYSTEM INFORMATION */}
            <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                  <ShieldCheck size={22} />
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900">
                    Interpretable Machine Learning
                  </h3>

                  <p className="mt-1 max-w-4xl text-sm leading-6 text-slate-500">
                    Predictions are supported by feature-level explanations
                    that show which input features contributed to each
                    model's prediction. These explanations are intended to
                    support assessment and do not replace professional
                    clinical judgement.
                  </p>
                </div>
              </div>
            </section>

          </div>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
