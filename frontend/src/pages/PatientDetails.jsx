
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Activity,
  ArrowLeft,
  BarChart3,
  Brain,
  ChevronRight,
  Database,
  FileText,
  LayoutDashboard,
  LogOut,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";

import { getPatient } from "../services/api";

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
            OsteoPredict
          </h1>
          <p className="text-xs text-slate-500">
            Adherence Intelligence
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = item.path === "/patients";

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
      </nav>

      <div className="border-t border-slate-200 p-3">
        <Link
          to="/settings"
          className="flex items-center rounded-xl px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          <Settings className="mr-3 h-5 w-5" />
          Settings
        </Link>

        <button
          onClick={handleSignOut}
          className="flex w-full items-center rounded-xl px-4 py-3 text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Sign out
        </button>
      </div>
    </aside>
  );
}

function PatientDetails() {
  const { patientId } = useParams();

  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadPatient = async () => {
      if (!patientId) {
        setError("No patient ID was provided.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");
        setPatient(null);

        const data = await getPatient(patientId);

        if (!cancelled) {
          setPatient(data);
        }
      } catch (err) {
        console.error("Failed to load patient:", err);

        if (!cancelled) {
          setError(
            err.message || "Failed to load patient information."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadPatient();

    return () => {
      cancelled = true;
    };
  }, [patientId]);

  if (loading) {
    return (
      <PageLayout>
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <p className="text-sm text-slate-500">
            Loading patient information...
          </p>
        </div>
      </PageLayout>
    );
  }

  if (error || !patient) {
    return (
      <PageLayout>
        <div className="rounded-2xl border border-red-200 bg-white p-12 text-center shadow-sm">
          <h2 className="text-lg font-bold text-red-600">
            Patient Not Found
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            {error || "The requested patient does not exist."}
          </p>

          <Link
            to="/patients"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Patients
          </Link>
        </div>
      </PageLayout>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />

      <main className="ml-64 min-h-screen">
        <header className="border-b border-slate-200 bg-white px-8 py-6">
          <Link
            to="/patients"
            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Patients
          </Link>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Patient Record
              </p>

              <h1 className="mt-1 text-2xl font-bold text-slate-900">
                {patient.patient_code || `Patient ${patient.id}`}
              </h1>
            </div>

            <div className="rounded-xl bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
              Patient #{patient.id}
            </div>
          </div>
        </header>

        <section className="p-8">
          <div className="mb-6">
            <h2 className="mb-4 text-lg font-bold text-slate-900">
              Patient Information
            </h2>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
              <InfoCard
                label="Patient Code"
                value={patient.patient_code}
              />

              <InfoCard
                label="Age"
                value={
                  patient.age_years != null
                    ? `${patient.age_years} years`
                    : null
                }
              />

              <InfoCard
                label="Sex"
                value={patient.sex}
              />

              <InfoCard
                label="Treatment"
                value={patient.osteoporosis_treatment}
              />
            </div>
          </div>

          <DetailSection title="Treatment Information">
            <DetailItem
              label="Treatment Duration"
              value={
                patient.treatment_duration_months != null
                  ? `${patient.treatment_duration_months} months`
                  : null
              }
            />

            <DetailItem
              label="Previous Fracture"
              value={patient.previous_fracture}
            />

            <DetailItem
              label="Functional Status"
              value={patient.functional_status}
            />

            <DetailItem
              label="Follow-up Attendance"
              value={patient.followup_attendance}
            />

            <DetailItem
              label="Side Effects"
              value={patient.side_effects}
            />

            <DetailItem
              label="Medication Cost Burden"
              value={patient.medication_cost_burden}
            />
          </DetailSection>

          <DetailSection title="Adherence-Related Information">
            <DetailItem
              label="Missed Doses — Last 30 Days"
              value={patient.missed_doses_last_30_days}
            />

            <DetailItem
              label="Distance to Clinic"
              value={
                patient.distance_to_clinic_km != null
                  ? `${patient.distance_to_clinic_km} km`
                  : null
              }
            />

            <DetailItem
              label="Caregiver Support"
              value={patient.caregiver_support}
            />

            <DetailItem
              label="Health Education"
              value={patient.health_education}
            />
          </DetailSection>

          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600">
                <Brain className="h-5 w-5 text-white" />
              </div>

              <div>
                <h2 className="font-bold text-slate-900">
                  Treatment Adherence Prediction
                </h2>

                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Generate an adherence prediction using this patient's
                  recorded information. The prediction page will receive
                  this patient's ID and load the available details.
                </p>

                <Link
                  to={`/prediction?patientId=${encodeURIComponent(patient.id)}`}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Make Prediction
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-bold text-slate-900">
              Record Information
            </h2>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <DetailItem
                label="Database ID"
                value={patient.id}
              />

              <DetailItem
                label="Created By User ID"
                value={patient.created_by_user_id}
              />

              <DetailItem
                label="Created At"
                value={
                  patient.created_at
                    ? new Date(patient.created_at).toLocaleString()
                    : null
                }
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function PageLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <main className="ml-64 min-h-screen p-8">
        {children}
      </main>
    </div>
  );
}

function InfoCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-2 break-words text-lg font-bold text-slate-900">
        {value ?? "Not recorded"}
      </p>
    </div>
  );
}

function DetailSection({ title, children }) {
  return (
    <div className="mb-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-6 py-5">
        <h2 className="font-bold text-slate-900">{title}</h2>
      </div>

      <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2 lg:grid-cols-3">
        {children}
      </div>
    </div>
  );
}

function DetailItem({ label, value }) {
  const displayValue =
    value === null || value === undefined || value === ""
      ? "Not recorded"
      : String(value);

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-medium text-slate-800">
        {displayValue}
      </p>
    </div>
  );
}

export default PatientDetails;
