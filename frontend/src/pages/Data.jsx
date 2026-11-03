
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  BarChart3,
  Brain,
  ChevronRight,
  Database,
  FileText,
  LayoutDashboard,
  LogOut,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";

const API_URL = "http://127.0.0.1:8000";

function Sidebar() {
  const navigation = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { name: "Predictions", icon: Brain, path: "/prediction" },
    { name: "Patients", icon: Users, path: "/patients" },
    { name: "Data", icon: Database, path: "/data" },
    { name: "Models", icon: Activity, path: "/models" },
    { name: "Analytics", icon: BarChart3, path: "/analytics" },
    { name: "Learning", icon: FileText, path: "/learning" },
  ];

  const handleSignOut = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-slate-200 bg-white">
      <div className="flex h-20 items-center border-b border-slate-200 px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
          <ShieldCheck className="h-6 w-6 text-white" />
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

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
        <p className="px-4 pb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Main
        </p>

        {navigation.map((item) => {
          const Icon = item.icon;
          const active = item.path === "/data";

          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center rounded-xl px-4 py-3 text-sm font-medium transition ${
                active
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Icon className="mr-3 h-5 w-5" />
              {item.name}
              {active && (
                <ChevronRight className="ml-auto h-4 w-4" />
              )}
            </Link>
          );
        })}

        <p className="px-4 pb-2 pt-6 text-xs font-semibold uppercase tracking-wider text-slate-400">
          System
        </p>

        <Link
          to="/settings"
          className="flex items-center rounded-xl px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          <Settings className="mr-3 h-5 w-5" />
          Settings
        </Link>
      </nav>

      <div className="border-t border-slate-200 p-3">
        <button
          onClick={handleSignOut}
          className="flex w-full items-center rounded-xl px-4 py-3 text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}

export default function Data() {
  const [records, setRecords] = useState([]);
  const [columns, setColumns] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("access_token");

      const response = await fetch(`${API_URL}/data`, {
        headers: token
          ? { Authorization: `Bearer ${token}` }
          : {},
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(
            "The backend does not have a GET /data endpoint yet. We need to configure the backend route."
          );
        }

        throw new Error(
          `Unable to load dataset. Server returned ${response.status}.`
        );
      }

      const result = await response.json();

      const rows = Array.isArray(result)
        ? result
        : result.records || result.data || result.items || [];

      if (!Array.isArray(rows)) {
        throw new Error("The backend returned an unsupported dataset format.");
      }

      setRecords(rows);

      const returnedColumns = Array.isArray(result.columns)
        ? result.columns
        : [];

      setColumns(
        returnedColumns.length
          ? returnedColumns
          : rows.length
            ? Object.keys(rows[0])
            : []
      );

      setLastUpdated(new Date());
    } catch (err) {
      console.error("Dataset loading error:", err);
      setError(
        err.message ||
          "Could not connect to the backend. Check that the server is running."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return records;

    return records.filter((record) =>
      Object.values(record).some((value) =>
        String(value ?? "").toLowerCase().includes(query)
      )
    );
  }, [records, search]);

  const missingValues = useMemo(() => {
    let missing = 0;

    records.forEach((record) => {
      columns.forEach((column) => {
        const value = record[column];

        if (
          value === null ||
          value === undefined ||
          value === ""
        ) {
          missing += 1;
        }
      });
    });

    return missing;
  }, [records, columns]);

  const missingPercentage =
    records.length && columns.length
      ? (
          (missingValues / (records.length * columns.length)) *
          100
        ).toFixed(1)
      : "0.0";

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />

      <main className="ml-64 min-h-screen">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-white px-8 py-6">
          <div>
            <p className="text-sm text-slate-500">
              Osteoporosis treatment adherence management
            </p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">
              Dataset Management
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              View dataset records and inspect data quality.
            </p>
          </div>

          <button
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
            Refresh Data
          </button>
        </header>

        <section className="space-y-6 p-8">
          {error && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
              <h2 className="font-semibold text-amber-900">
                Dataset connection issue
              </h2>
              <p className="mt-2 text-sm leading-6 text-amber-800">
                {error}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <StatCard
              title="Total Records"
              value={loading ? "…" : records.length}
              description="Records returned by the backend"
              icon={Database}
            />

            <StatCard
              title="Dataset Columns"
              value={loading ? "…" : columns.length}
              description="Fields available in the dataset"
              icon={FileText}
            />

            <StatCard
              title="Missing Values"
              value={
                loading
                  ? "…"
                  : `${missingValues} (${missingPercentage}%)`
              }
              description="Empty values across loaded records"
              icon={BarChart3}
            />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-6 py-5">
              <div>
                <h2 className="font-bold text-slate-900">
                  Dataset Records
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Search and inspect the records returned by the API.
                </p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search records..."
                  className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {loading ? (
              <div className="p-12 text-center text-sm text-slate-500">
                Loading dataset...
              </div>
            ) : records.length === 0 ? (
              <div className="p-12 text-center">
                <Database className="mx-auto h-10 w-10 text-slate-300" />
                <h3 className="mt-4 font-semibold text-slate-800">
                  No dataset records loaded
                </h3>
                <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
                  Once the backend dataset endpoint is configured, the
                  records and data-quality statistics will appear here.
                </p>
              </div>
            ) : filteredRecords.length === 0 ? (
              <div className="p-10 text-center text-sm text-slate-500">
                No records match your search.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      {columns.map((column) => (
                        <th
                          key={column}
                          className="whitespace-nowrap px-5 py-3 font-semibold text-slate-600"
                        >
                          {column.replaceAll("_", " ")}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filteredRecords.map((record, index) => (
                      <tr
                        key={record.id ?? record.patient_code ?? index}
                        className="hover:bg-slate-50"
                      >
                        {columns.map((column) => (
                          <td
                            key={column}
                            className="whitespace-nowrap px-5 py-3 text-slate-700"
                          >
                            {record[column] === null ||
                            record[column] === undefined ||
                            record[column] === ""
                              ? "—"
                              : String(record[column])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {!loading && records.length > 0 && (
              <div className="border-t border-slate-200 px-6 py-4 text-xs text-slate-500">
                Showing {filteredRecords.length} of {records.length} loaded records.
              </div>
            )}
          </div>

          <p className="text-xs text-slate-500">
            {lastUpdated
              ? `Last refreshed: ${lastUpdated.toLocaleString()}`
              : "Dataset has not been loaded yet."}
          </p>
        </section>
      </main>
    </div>
  );
}

function StatCard({ title, value, description, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <div className="rounded-lg bg-blue-50 p-2">
          <Icon className="h-5 w-5 text-blue-600" />
        </div>
      </div>

      <p className="mt-4 text-2xl font-bold text-slate-900">
        {value}
      </p>
      <p className="mt-1 text-xs text-slate-500">{description}</p>
    </div>
  );
}
