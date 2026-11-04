
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  BarChart3,
  Brain,
  ChevronRight,
  FileText,
  LayoutDashboard,
  LogOut,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Users,
  X,
  Pencil,
  Trash2,
} from "lucide-react";

import {
  createPatient,
  getPatients,
  updatePatient,
  deletePatient,
} from "../services/api";

function Sidebar() {
  const navigation = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { name: "Predictions", icon: Brain, path: "/prediction" },
    { name: "Patients", icon: Users, path: "/patients" },
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
          <h1 className="text-sm font-bold text-slate-900">OsteoPredict</h1>
          <p className="text-xs text-slate-500">Adherence Intelligence</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-5">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = item.path === "/patients";

          return (
            <a
              key={item.name}
              href={item.path}
              className={`flex items-center rounded-xl px-4 py-3 text-sm font-medium transition ${
                active
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Icon className="mr-3 h-5 w-5" />
              {item.name}
              {active && <ChevronRight className="ml-auto h-4 w-4" />}
            </a>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 p-3">
        <a
          href="/settings"
          className="flex items-center rounded-xl px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          <Settings className="mr-3 h-5 w-5" />
          Settings
        </a>

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

const initialForm = {
  patient_code: "",
  age_years: "",
  sex: "",
  osteoporosis_treatment: "",
  treatment_duration_months: "",
  previous_fracture: "",
  functional_status: "",
  followup_attendance: "",
  side_effects: "",
  medication_cost_burden: "",
  distance_to_clinic_km: "",
  caregiver_support: "",
  missed_doses_last_30_days: "",
  health_education: "",
};

const formFields = [
  {
    name: "patient_code",
    label: "Patient Code",
    required: true,
    placeholder: "e.g. OST-0001",
  },
  {
    name: "age_years",
    label: "Age (years)",
    type: "number",
    required: true,
    min: 40,
    placeholder: "e.g. 58",
  },
  {
    name: "sex",
    label: "Sex",
    required: true,
    options: ["Female", "Male"],
  },
  {
    name: "osteoporosis_treatment",
    label: "Osteoporosis Treatment",
    required: true,
    placeholder: "e.g. Alendronate",
  },
  {
    name: "treatment_duration_months",
    label: "Treatment Duration (months)",
    type: "number",
    required: true,
    min: 0,
  },
  {
    name: "previous_fracture",
    label: "Previous Fracture",
    required: true,
    options: ["Yes", "No"],
  },
  {
    name: "functional_status",
    label: "Functional Status",
    options: ["Independent", "Partially dependent", "Dependent"],
  },
  {
    name: "followup_attendance",
    label: "Follow-up Attendance",
    required: true,
    options: ["Regular", "Irregular", "Missed"],
  },
  {
    name: "side_effects",
    label: "Side Effects",
    options: ["None", "Mild", "Moderate", "Severe"],
  },
  {
    name: "medication_cost_burden",
    label: "Medication Cost Burden",
    required: true,
    options: ["Low", "Moderate", "High"],
  },
  {
    name: "distance_to_clinic_km",
    label: "Distance to Clinic (km)",
    type: "number",
    min: 0,
    step: "0.1",
    placeholder: "e.g. 12.5",
  },
  {
    name: "caregiver_support",
    label: "Caregiver Support",
    options: ["Yes", "No"],
  },
  {
    name: "missed_doses_last_30_days",
    label: "Missed Doses — Last 30 Days",
    type: "number",
    required: true,
    min: 0,
  },
  {
    name: "health_education",
    label: "Health Education",
    options: ["Adequate", "Moderate", "Limited"],
  },
];

function Patients() {
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState(initialForm);
  const [editingPatient, setEditingPatient] = useState(null);
  const [deletingPatient, setDeletingPatient] = useState(null);

  // LOAD PATIENTS
  const loadPatients = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getPatients();

      setPatients(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load patients.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  // FORM CHANGE
  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // OPEN ADD FORM
  const openForm = () => {
    setEditingPatient(null);
    setForm({ ...initialForm });
    setSuccess("");
    setError("");
    setShowForm(true);
  };

  // OPEN EDIT FORM
  const openEditForm = (patient) => {
    setEditingPatient(patient);

    setForm({
      patient_code: patient.patient_code ?? "",
      age_years: patient.age_years ?? "",
      sex: patient.sex ?? "",
      osteoporosis_treatment: patient.osteoporosis_treatment ?? "",
      treatment_duration_months: patient.treatment_duration_months ?? "",
      previous_fracture: patient.previous_fracture ?? "",
      functional_status: patient.functional_status ?? "",
      followup_attendance: patient.followup_attendance ?? "",
      side_effects: patient.side_effects ?? "",
      medication_cost_burden: patient.medication_cost_burden ?? "",
      distance_to_clinic_km: patient.distance_to_clinic_km ?? "",
      caregiver_support: patient.caregiver_support ?? "",
      missed_doses_last_30_days:
        patient.missed_doses_last_30_days ?? "",
      health_education: patient.health_education ?? "",
    });

    setSuccess("");
    setError("");
    setShowForm(true);
  };

  // CLOSE FORM
  const closeForm = () => {
    if (saving) return;

    setShowForm(false);
    setEditingPatient(null);
    setForm({ ...initialForm });
    setError("");
    setSuccess("");
  };

  // PREPARE PATIENT DATA
  const preparePatientData = () => ({
    patient_code: form.patient_code.trim(),
    age_years: Number(form.age_years),
    sex: form.sex,
    osteoporosis_treatment: form.osteoporosis_treatment,
    treatment_duration_months: Number(
      form.treatment_duration_months
    ),
    previous_fracture: form.previous_fracture,
    functional_status: form.functional_status || null,
    followup_attendance: form.followup_attendance,
    side_effects: form.side_effects || null,
    medication_cost_burden: form.medication_cost_burden,
    distance_to_clinic_km:
      form.distance_to_clinic_km === ""
        ? null
        : Number(form.distance_to_clinic_km),
    caregiver_support: form.caregiver_support || null,
    missed_doses_last_30_days: Number(
      form.missed_doses_last_30_days
    ),
    health_education: form.health_education || null,
  });

  // CREATE OR UPDATE PATIENT
  const handleSubmit = async (event) => {
    event.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const patientData = preparePatientData();

      if (editingPatient) {
        await updatePatient(editingPatient.id, patientData);
        setSuccess("Patient record updated successfully.");
      } else {
        await createPatient(patientData);
        setSuccess("Patient registered successfully.");
      }

      await loadPatients();

      setTimeout(() => {
        setShowForm(false);
        setEditingPatient(null);
        setForm({ ...initialForm });
        setSuccess("");
      }, 1000);
    } catch (err) {
      console.error(err);
      setError(
        err.message ||
          (editingPatient
            ? "Failed to update patient."
            : "Failed to create patient.")
      );
    } finally {
      setSaving(false);
    }
  };

  // DELETE PATIENT
  const handleDelete = async (patient) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete patient ${patient.patient_code}? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setDeletingPatient(patient.id);
      setError("");
      setSuccess("");

      await deletePatient(patient.id);

      setPatients((previous) =>
        previous.filter((item) => item.id !== patient.id)
      );

      setSuccess(
        `Patient ${patient.patient_code} deleted successfully.`
      );
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to delete patient.");
    } finally {
      setDeletingPatient(null);
    }
  };

  // FILTER PATIENTS
  const filteredPatients = patients.filter((patient) => {
    const search = searchTerm.toLowerCase().trim();

    if (!search) return true;

    return (
      String(patient.patient_code || "")
        .toLowerCase()
        .includes(search) ||
      String(patient.sex || "")
        .toLowerCase()
        .includes(search) ||
      String(patient.osteoporosis_treatment || "")
        .toLowerCase()
        .includes(search)
    );
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />

      <main className="ml-64 min-h-screen">
        {/* TOP BAR */}
        <header className="flex min-h-20 flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-white px-8 py-4">
          <div className="flex flex-wrap items-center gap-5">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              <ChevronRight className="h-4 w-4 rotate-180" />
              Back to Dashboard
            </button>

            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Patients
              </h2>
              <p className="text-sm text-slate-500">
                Manage patient records and treatment information
              </p>
            </div>
          </div>

          <button
            onClick={openForm}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <Plus className="h-5 w-5" />
            Add Patient
          </button>
        </header>

        {/* PAGE CONTENT */}
        <section className="p-8">
          {/* SUMMARY CARDS */}
          <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">Total Patients</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {patients.length}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">
                Adherence Outcomes
              </p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                —
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Actual outcomes will be recorded during follow-up
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">Search Results</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {filteredPatients.length}
              </p>
            </div>
          </div>

          {/* SEARCH */}
          <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
                placeholder="Search by patient code, sex, or treatment..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          {/* SUCCESS MESSAGE */}
          {success && !showForm && (
            <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
              {success}
            </div>
          )}

          {/* ERROR MESSAGE */}
          {error && !showForm && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          {/* PATIENT TABLE */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-5">
              <h3 className="font-semibold text-slate-900">
                Patient Records
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Patient information stored in the system database
              </p>
            </div>

            {loading ? (
              <div className="p-12 text-center text-sm text-slate-500">
                Loading patient records...
              </div>
            ) : error && patients.length === 0 ? (
              <div className="p-12 text-center">
                <p className="font-medium text-red-600">
                  Unable to load patients
                </p>
                <p className="mt-2 text-sm text-slate-500">{error}</p>

                <button
                  onClick={loadPatients}
                  className="mt-5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Try Again
                </button>
              </div>
            ) : filteredPatients.length === 0 ? (
              <div className="p-12 text-center">
                <Users className="mx-auto h-12 w-12 text-slate-300" />

                <h4 className="mt-4 font-semibold text-slate-900">
                  {patients.length === 0
                    ? "No patients registered"
                    : "No matching patients"}
                </h4>

                <p className="mt-2 text-sm text-slate-500">
                  {patients.length === 0
                    ? "Add the first patient to begin building the patient database."
                    : "Try changing your search term."}
                </p>

                {patients.length === 0 && (
                  <button
                    onClick={openForm}
                    className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4" />
                    Add Patient
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      {[
                        "Patient Code",
                        "Age",
                        "Sex",
                        "Treatment",
                        "Treatment Duration",
                        "Actions",
                      ].map((heading) => (
                        <th
                          key={heading}
                          className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filteredPatients.map((patient) => (
                      <tr
                        key={patient.id}
                        className="transition hover:bg-slate-50"
                      >
                        <td className="px-6 py-4">
                          <span className="font-semibold text-slate-900">
                            {patient.patient_code}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-600">
                          {patient.age_years}
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-600">
                          {patient.sex}
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-600">
                          {patient.osteoporosis_treatment}
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-600">
                          {patient.treatment_duration_months} months
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <a
                              href={`/patients/${patient.id}`}
                              className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50"
                            >
                              View
                              <ChevronRight className="h-4 w-4" />
                            </a>

                            <button
                              onClick={() => openEditForm(patient)}
                              className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold text-amber-600 hover:bg-amber-50"
                              title="Edit patient"
                            >
                              <Pencil className="h-4 w-4" />
                              Edit
                            </button>

                            <button
                              onClick={() => handleDelete(patient)}
                              disabled={deletingPatient === patient.id}
                              className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                              title="Delete patient"
                            >
                              <Trash2 className="h-4 w-4" />
                              {deletingPatient === patient.id
                                ? "Deleting..."
                                : "Delete"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* ADD / EDIT PATIENT MODAL */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-6">
          <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* MODAL HEADER */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {editingPatient
                    ? "Edit Patient Record"
                    : "Register New Patient"}
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Enter the patient's treatment and adherence-related information.
                </p>
              </div>

              <button
                onClick={closeForm}
                disabled={saving}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* FORM */}
            <form onSubmit={handleSubmit} className="overflow-y-auto">
              <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2">
                {formFields.map((field) => (
                  <div key={field.name}>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      {field.label}
                      {field.required ? " *" : ""}
                    </label>

                    {field.options ? (
                      <select
                        required={field.required}
                        name={field.name}
                        value={form[field.name]}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      >
                        <option value="">Select</option>

                        {field.options.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        required={field.required}
                        type={field.type || "text"}
                        min={field.min}
                        step={field.step}
                        name={field.name}
                        value={form[field.name]}
                        onChange={handleChange}
                        placeholder={field.placeholder || ""}
                        className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* FORM ERROR */}
              {error && (
                <div className="mx-6 mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {error}
                </div>
              )}

              {/* FORM SUCCESS */}
              {success && (
                <div className="mx-6 mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
                  {success}
                </div>
              )}

              {/* FORM BUTTONS */}
              <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : editingPatient
                      ? "Update Patient"
                      : "Save Patient"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Patients;
