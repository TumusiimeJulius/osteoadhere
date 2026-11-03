import { useEffect, useState } from "react";
import {
  Activity,
  Brain,
  Database,
  FileText,
  LayoutDashboard,
  LogOut,
  Settings,
  ShieldCheck,
  Users,
  BarChart3,
  RefreshCw,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { getHealth, getModels } from "../services/api";

function Dashboard() {
  const navigate = useNavigate();

  const [health, setHealth] = useState(null);
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user") || "null");

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
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    navigate("/login");
  }

  const navigation = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
      path: "/dashboard",
    },
    {
      name: "Predictions",
      icon: Brain,
      path: "/prediction",
    },
    {
      name: "Patients",
      icon: Users,
      path: "/patients",
    },
    {
      name: "Data",
      icon: Database,
      path: "/data",
    },
    {
      name: "Models",
      icon: Activity,
      path: "/models",
    },
    {
      name: "Analytics",
      icon: BarChart3,
      path: "/analytics",
    },
    {
      name: "Learning",
      icon: RefreshCw,
      path: "/learning",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">

        {/* SIDEBAR */}
        <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-slate-200 bg-white">

          {/* Logo */}
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

          {/* Navigation */}
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

                    <span className="ml-3">
                      {item.name}
                    </span>

                    {active && (
                      <ChevronRight
                        size={16}
                        className="ml-auto"
                      />
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

              <span className="ml-3">
                Settings
              </span>
            </button>
          </nav>

          {/* User */}
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

              <span className="ml-3">
                Sign Out
              </span>
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="ml-64 flex-1">

          {/* TOP BAR */}
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
                  Start Prediction
                  <ChevronRight size={17} />
                </button>

              </div>
            </section>

            {/* STAT CARDS */}
            <section className="mb-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">

              {/* Patients */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                <div className="flex items-center justify-between">
                  <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                    <Users size={22} />
                  </div>

                  <span className="text-xs font-medium text-slate-400">
                    Records
                  </span>
                </div>

                <p className="mt-5 text-3xl font-bold text-slate-900">
                  —
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Patients
                </p>

              </div>

              {/* Predictions */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                <div className="flex items-center justify-between">
                  <div className="rounded-xl bg-purple-50 p-3 text-purple-600">
                    <FileText size={22} />
                  </div>

                  <span className="text-xs font-medium text-slate-400">
                    Activity
                  </span>
                </div>

                <p className="mt-5 text-3xl font-bold text-slate-900">
                  —
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Predictions
                </p>

              </div>

              {/* Models */}
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

              {/* System */}
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

            {/* TWO COLUMN AREA */}
            <section className="grid gap-6 xl:grid-cols-3">

              {/* Models */}
              <div className="xl:col-span-2 rounded-2xl border border-slate-200 bg-white shadow-sm">

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
                            <Brain
                              size={18}
                              className="text-slate-600"
                            />
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

              {/* Quick Actions */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                <h3 className="font-semibold text-slate-900">
                  Quick Actions
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Common system tasks
                </p>

                <div className="mt-5 space-y-3">

                  <button
                    onClick={() => navigate("/prediction")}
                    className="flex w-full items-center rounded-xl border border-slate-200 p-4 text-left hover:bg-slate-50"
                  >
                    <Brain
                      size={20}
                      className="text-blue-600"
                    />

                    <div className="ml-3">
                      <p className="text-sm font-semibold">
                        New Prediction
                      </p>

                      <p className="text-xs text-slate-500">
                        Assess treatment adherence
                      </p>
                    </div>

                    <ChevronRight
                      size={17}
                      className="ml-auto text-slate-400"
                    />
                  </button>

                  <button
                    onClick={() => navigate("/patients")}
                    className="flex w-full items-center rounded-xl border border-slate-200 p-4 text-left hover:bg-slate-50"
                  >
                    <Users
                      size={20}
                      className="text-purple-600"
                    />

                    <div className="ml-3">
                      <p className="text-sm font-semibold">
                        Patients
                      </p>

                      <p className="text-xs text-slate-500">
                        View patient records
                      </p>
                    </div>

                    <ChevronRight
                      size={17}
                      className="ml-auto text-slate-400"
                    />
                  </button>

                  <button
                    onClick={() => navigate("/analytics")}
                    className="flex w-full items-center rounded-xl border border-slate-200 p-4 text-left hover:bg-slate-50"
                  >
                    <BarChart3
                      size={20}
                      className="text-emerald-600"
                    />

                    <div className="ml-3">
                      <p className="text-sm font-semibold">
                        Analytics
                      </p>

                      <p className="text-xs text-slate-500">
                        Review model analytics
                      </p>
                    </div>

                    <ChevronRight
                      size={17}
                      className="ml-auto text-slate-400"
                    />
                  </button>

                  <button
                    onClick={() => navigate("/learning")}
                    className="flex w-full items-center rounded-xl border border-slate-200 p-4 text-left hover:bg-slate-50"
                  >
                    <RefreshCw
                      size={20}
                      className="text-orange-600"
                    />

                    <div className="ml-3">
                      <p className="text-sm font-semibold">
                        Model Learning
                      </p>

                      <p className="text-xs text-slate-500">
                        Manage future model updates
                      </p>
                    </div>

                    <ChevronRight
                      size={17}
                      className="ml-auto text-slate-400"
                    />
                  </button>

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
                    that show which input features contributed to each model's
                    prediction. These explanations are intended to support
                    assessment and do not replace professional clinical
                    judgement.
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