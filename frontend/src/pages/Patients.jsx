import { useEffect, useState } from "react";
import {
  Activity,
  BarChart3,
  Brain,
  ChevronRight,
  Database,
  FileText,
  LayoutDashboard,
  LogOut,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { createPatient, getPatients } from "../services/api";


function Sidebar() {
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
      icon: FileText,
      path: "/learning",
    },
  ];

  const handleSignOut = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");

    window.location.href = "/login";
  };

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-slate-200 bg-white">
      
      {/* LOGO */}
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


      {/* NAVIGATION */}
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

              {active && (
                <ChevronRight className="ml-auto h-4 w-4" />
              )}
            </a>
          );
        })}
      </nav>


      {/* SETTINGS + LOGOUT */}
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


function Patients() {

  const [patients, setPatients] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [saving, setSaving] = useState(false);

  const [success, setSuccess] = useState("");

  const [form, setForm] = useState(initialForm);


  /* ============================================================
     LOAD PATIENTS
     ============================================================ */

  const loadPatients = async () => {

    try {

      setLoading(true);

      setError("");

      const data = await getPatients();

      setPatients(
        Array.isArray(data)
          ? data
          : []
      );

    } catch (err) {

      console.error(err);

      setError(
        err.message ||
        "Failed to load patients."
      );

    } finally {

      setLoading(false);

    }
  };


  useEffect(() => {
    loadPatients();
  }, []);


  /* ============================================================
     FORM CHANGE
     ============================================================ */

  const handleChange = (event) => {

    const {
      name,
      value,
    } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };


  /* ============================================================
     OPEN FORM
     ============================================================ */

  const openForm = () => {

    setForm(initialForm);

    setSuccess("");

    setError("");

    setShowForm(true);
  };


  /* ============================================================
     CLOSE FORM
     ============================================================ */

  const closeForm = () => {

    if (saving) {
      return;
    }

    setShowForm(false);
  };


  /* ============================================================
     SUBMIT PATIENT
     ============================================================ */

  const handleSubmit = async (event) => {

    event.preventDefault();

    setSaving(true);

    setError("");

    setSuccess("");


    try {

      const patientData = {
        patient_code:
          form.patient_code.trim(),

        age_years:
          Number(form.age_years),

        sex:
          form.sex,

        osteoporosis_treatment:
          form.osteoporosis_treatment,

        treatment_duration_months:
          Number(form.treatment_duration_months),

        previous_fracture:
          form.previous_fracture,

        functional_status:
          form.functional_status || null,

        followup_attendance:
          form.followup_attendance,

        side_effects:
          form.side_effects || null,

        medication_cost_burden:
          form.medication_cost_burden,

        distance_to_clinic_km:
          form.distance_to_clinic_km === ""
            ? null
            : Number(form.distance_to_clinic_km),

        caregiver_support:
          form.caregiver_support || null,

        missed_doses_last_30_days:
          Number(form.missed_doses_last_30_days),

        health_education:
          form.health_education || null,
      };


      await createPatient(patientData);


      setSuccess(
        "Patient registered successfully."
      );

      setForm(initialForm);

      await loadPatients();


      setTimeout(() => {
        setShowForm(false);
        setSuccess("");
      }, 1200);


    } catch (err) {

      console.error(err);

      setError(
        err.message ||
        "Failed to create patient."
      );

    } finally {

      setSaving(false);

    }
  };


  /* ============================================================
     FILTER PATIENTS
     ============================================================ */

  const filteredPatients =
    patients.filter((patient) => {

      const search =
        searchTerm
          .toLowerCase()
          .trim();

      if (!search) {
        return true;
      }

      return (
        String(
          patient.patient_code || ""
        )
          .toLowerCase()
          .includes(search)
        ||
        String(
          patient.sex || ""
        )
          .toLowerCase()
          .includes(search)
        ||
        String(
          patient.osteoporosis_treatment || ""
        )
          .toLowerCase()
          .includes(search)
      );
    });


  return (
    <div className="min-h-screen bg-slate-50">

      <Sidebar />


      {/* MAIN CONTENT */}

      <main className="ml-64 min-h-screen">

        {/* TOP BAR */}

        <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-8">

          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Patients
            </h2>

            <p className="text-sm text-slate-500">
              Manage patient records and treatment information
            </p>
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

          {/* SUMMARY */}

          <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-3">

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

              <p className="text-sm text-slate-500">
                Total Patients
              </p>

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

              <p className="text-sm text-slate-500">
                Search Results
              </p>

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


          {/* SUCCESS */}

          {success && !showForm && (
            <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
              {success}
            </div>
          )}


          {/* ERROR */}

          {error && !showForm && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}


          {/* TABLE */}

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

                <p className="mt-2 text-sm text-slate-500">
                  {error}
                </p>

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

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Patient Code
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Age
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Sex
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Treatment
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Treatment Duration
                      </th>

                      <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Action
                      </th>

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


                        <td className="px-6 py-4 text-right">

                          <a
                            href={`/patients/${patient.id}`}
                            className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50"
                          >
                            View
                            <ChevronRight className="h-4 w-4" />
                          </a>

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


      {/* ========================================================
          ADD PATIENT MODAL
          ======================================================== */}

      {showForm && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-6">

          <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

            {/* MODAL HEADER */}

            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">

              <div>

                <h3 className="text-lg font-bold text-slate-900">
                  Register New Patient
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

            <form
              onSubmit={handleSubmit}
              className="overflow-y-auto"
            >

              <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2">


                {/* PATIENT CODE */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Patient Code *
                  </label>

                  <input
                    required
                    type="text"
                    name="patient_code"
                    value={form.patient_code}
                    onChange={handleChange}
                    placeholder="e.g. OST-0001"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                </div>


                {/* AGE */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Age (years) *
                  </label>

                  <input
                    required
                    min="40"
                    type="number"
                    name="age_years"
                    value={form.age_years}
                    onChange={handleChange}
                    placeholder="e.g. 58"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                </div>


                {/* SEX */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Sex *
                  </label>

                  <select
                    required
                    name="sex"
                    value={form.sex}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >

                    <option value="">
                      Select sex
                    </option>

                    <option value="Female">
                      Female
                    </option>

                    <option value="Male">
                      Male
                    </option>

                  </select>

                </div>


                {/* TREATMENT */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Osteoporosis Treatment *
                  </label>

                  <input
                    required
                    type="text"
                    name="osteoporosis_treatment"
                    value={form.osteoporosis_treatment}
                    onChange={handleChange}
                    placeholder="e.g. Alendronate"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                </div>


                {/* TREATMENT DURATION */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Treatment Duration (months) *
                  </label>

                  <input
                    required
                    min="0"
                    type="number"
                    name="treatment_duration_months"
                    value={form.treatment_duration_months}
                    onChange={handleChange}
                    placeholder="e.g. 12"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                </div>


                {/* PREVIOUS FRACTURE */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Previous Fracture *
                  </label>

                  <select
                    required
                    name="previous_fracture"
                    value={form.previous_fracture}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >

                    <option value="">
                      Select
                    </option>

                    <option value="Yes">
                      Yes
                    </option>

                    <option value="No">
                      No
                    </option>

                  </select>

                </div>


                {/* FUNCTIONAL STATUS */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Functional Status
                  </label>

                  <select
                    name="functional_status"
                    value={form.functional_status}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >

                    <option value="">
                      Select
                    </option>

                    <option value="Independent">
                      Independent
                    </option>

                    <option value="Partially dependent">
                      Partially dependent
                    </option>

                    <option value="Dependent">
                      Dependent
                    </option>

                  </select>

                </div>


                {/* FOLLOW-UP */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Follow-up Attendance *
                  </label>

                  <select
                    required
                    name="followup_attendance"
                    value={form.followup_attendance}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >

                    <option value="">
                      Select
                    </option>

                    <option value="Regular">
                      Regular
                    </option>

                    <option value="Irregular">
                      Irregular
                    </option>

                    <option value="Missed">
                      Missed
                    </option>

                  </select>

                </div>


                {/* SIDE EFFECTS */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Side Effects
                  </label>

                  <select
                    name="side_effects"
                    value={form.side_effects}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >

                    <option value="">
                      Select
                    </option>

                    <option value="None">
                      None
                    </option>

                    <option value="Mild">
                      Mild
                    </option>

                    <option value="Moderate">
                      Moderate
                    </option>

                    <option value="Severe">
                      Severe
                    </option>

                  </select>

                </div>


                {/* COST BURDEN */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Medication Cost Burden *
                  </label>

                  <select
                    required
                    name="medication_cost_burden"
                    value={form.medication_cost_burden}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >

                    <option value="">
                      Select
                    </option>

                    <option value="Low">
                      Low
                    </option>

                    <option value="Moderate">
                      Moderate
                    </option>

                    <option value="High">
                      High
                    </option>

                  </select>

                </div>


                {/* DISTANCE */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Distance to Clinic (km)
                  </label>

                  <input
                    min="0"
                    step="0.1"
                    type="number"
                    name="distance_to_clinic_km"
                    value={form.distance_to_clinic_km}
                    onChange={handleChange}
                    placeholder="e.g. 12.5"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                </div>


                {/* CAREGIVER SUPPORT */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Caregiver Support
                  </label>

                  <select
                    name="caregiver_support"
                    value={form.caregiver_support}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >

                    <option value="">
                      Select
                    </option>

                    <option value="Yes">
                      Yes
                    </option>

                    <option value="No">
                      No
                    </option>

                  </select>

                </div>


                {/* MISSED DOSES */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Missed Doses — Last 30 Days *
                  </label>

                  <input
                    required
                    min="0"
                    type="number"
                    name="missed_doses_last_30_days"
                    value={form.missed_doses_last_30_days}
                    onChange={handleChange}
                    placeholder="e.g. 2"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                </div>


                {/* HEALTH EDUCATION */}

                <div>

                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Health Education
                  </label>

                  <select
                    name="health_education"
                    value={form.health_education}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >

                    <option value="">
                      Select
                    </option>

                    <option value="Adequate">
                      Adequate
                    </option>

                    <option value="Moderate">
                      Moderate
                    </option>

                    <option value="Limited">
                      Limited
                    </option>

                  </select>

                </div>

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


              {/* BUTTONS */}

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
                    ? "Saving Patient..."
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