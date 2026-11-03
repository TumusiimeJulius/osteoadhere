
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Brain,
  CheckCircle2,
  LoaderCircle,
  XCircle,
} from "lucide-react";
import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import {
  getPatient,
  predictAllModels,
} from "../services/api";

const initialFormData = {
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

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500";

function formatFeatureName(feature) {
  return feature
    .replace("numerical__", "")
    .replace("categorical__", "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function Prediction() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const patientId = searchParams.get("patientId");

  const [formData, setFormData] = useState(initialFormData);
  const [patient, setPatient] = useState(null);
  const [loadingPatient, setLoadingPatient] = useState(false);
  const [patientError, setPatientError] = useState("");

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load the selected patient's saved information.
  useEffect(() => {
    let cancelled = false;

    async function loadPatient() {
      if (!patientId) {
        setPatient(null);
        setPatientError("");
        setFormData(initialFormData);
        return;
      }

      setLoadingPatient(true);
      setPatientError("");
      setError("");
      setResults(null);
      setPatient(null);

      try {
        const data = await getPatient(patientId);

        if (cancelled) return;

        setPatient(data);

        setFormData({
          age_years: data.age_years ?? "",
          sex: data.sex ?? "",
          osteoporosis_treatment:
            data.osteoporosis_treatment ?? "",
          treatment_duration_months:
            data.treatment_duration_months ?? "",
          previous_fracture: data.previous_fracture ?? "",
          functional_status: data.functional_status ?? "",
          followup_attendance:
            data.followup_attendance ?? "",
          side_effects: data.side_effects ?? "",
          medication_cost_burden:
            data.medication_cost_burden ?? "",
          distance_to_clinic_km:
            data.distance_to_clinic_km ?? "",
          caregiver_support: data.caregiver_support ?? "",
          missed_doses_last_30_days:
            data.missed_doses_last_30_days ?? "",
          health_education: data.health_education ?? "",
        });
      } catch (err) {
        if (!cancelled) {
          setPatientError(
            err.message || "Failed to load patient information."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingPatient(false);
        }
      }
    }

    loadPatient();

    return () => {
      cancelled = true;
    };
  }, [patientId]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (
      formData.age_years === "" ||
      Number(formData.age_years) < 40 ||
      Number(formData.age_years) > 120
    ) {
      return "Age must be between 40 and 120 years.";
    }

    const requiredFields = [
      "sex",
      "osteoporosis_treatment",
      "treatment_duration_months",
      "previous_fracture",
      "followup_attendance",
      "medication_cost_burden",
      "missed_doses_last_30_days",
    ];

    for (const field of requiredFields) {
      if (
        formData[field] === "" ||
        formData[field] === null ||
        formData[field] === undefined
      ) {
        return "Please complete all required fields.";
      }
    }

    if (
      Number(formData.treatment_duration_months) < 0 ||
      Number(formData.missed_doses_last_30_days) < 0
    ) {
      return "Treatment duration and missed doses cannot be negative.";
    }

    if (
      formData.distance_to_clinic_km !== "" &&
      Number(formData.distance_to_clinic_km) < 0
    ) {
      return "Distance to clinic cannot be negative.";
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    setResults(null);
    setLoading(true);

    const payload = {
      age_years: Number(formData.age_years),
      sex: formData.sex,
      osteoporosis_treatment:
        formData.osteoporosis_treatment,
      treatment_duration_months: Number(
        formData.treatment_duration_months
      ),
      previous_fracture: formData.previous_fracture,
      functional_status: formData.functional_status || null,
      followup_attendance: formData.followup_attendance,
      side_effects: formData.side_effects || null,
      medication_cost_burden:
        formData.medication_cost_burden,
      distance_to_clinic_km:
        formData.distance_to_clinic_km !== ""
          ? Number(formData.distance_to_clinic_km)
          : null,
      caregiver_support: formData.caregiver_support || null,
      missed_doses_last_30_days: Number(
        formData.missed_doses_last_30_days
      ),
      health_education: formData.health_education || null,
    };

    try {
      const data = await predictAllModels(payload);

      console.log("Prediction response:", data);

      if (!data.predictions) {
        throw new Error(
          "The server did not return prediction results."
        );
      }

      setResults(data.predictions);
    } catch (err) {
      setError(err.message || "Prediction failed.");
    } finally {
      setLoading(false);
    }
  };

  const renderInterpretability = (interpretability) => {
    if (!interpretability) {
      return null;
    }

    const features = interpretability.top_features || [];

    if (features.length === 0) {
      return (
        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <h4 className="font-semibold text-slate-900">
            Why this prediction?
          </h4>

          <p className="mt-2 text-sm text-slate-600">
            Feature-level explanation is currently unavailable
            for this model.
          </p>
        </div>
      );
    }

    return (
      <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-center justify-between gap-3">
          <h4 className="font-semibold text-slate-900">
            Why this prediction?
          </h4>

          <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600">
            {interpretability.method}
          </span>
        </div>

        <p className="mt-2 text-sm text-slate-600">
          These are the main features contributing to this
          model's prediction.
        </p>

        <div className="mt-4 space-y-3">
          {features.map((feature, index) => (
            <div
              key={`${feature.feature}-${index}`}
              className="rounded-lg border border-slate-200 bg-white p-3"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-medium text-slate-800">
                  {formatFeatureName(feature.feature)}
                </span>

                <span className="text-sm font-semibold text-slate-700">
                  {Number(feature.contribution).toFixed(3)}
                </span>
              </div>

              <div className="mt-2 flex items-center gap-2">
                {feature.direction === "increases" ? (
                  <CheckCircle2
                    size={16}
                    className="text-emerald-600"
                  />
                ) : (
                  <XCircle
                    size={16}
                    className="text-red-600"
                  />
                )}

                <span
                  className={`text-sm font-medium ${
                    feature.direction === "increases"
                      ? "text-emerald-700"
                      : "text-red-700"
                  }`}
                >
                  {feature.direction === "increases"
                    ? "Increases adherence"
                    : "Decreases adherence"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-600 p-2 text-white">
              <Brain size={22} />
            </div>

            <div>
              <h1 className="text-lg font-bold text-slate-900">
                Osteoporosis Adherence Prediction
              </h1>

              <p className="text-sm text-slate-500">
                Interpretable machine learning assessment
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate(
                patientId
                  ? `/patients/${patientId}`
                  : "/dashboard"
              )
            }
            className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <ArrowLeft size={17} />
            {patientId ? "Patient Details" : "Dashboard"}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900">
            Treatment Adherence Prediction
          </h2>

          <p className="mt-2 text-slate-600">
            Enter patient information to generate adherence
            predictions and feature-level explanations.
          </p>
        </div>

        {/* Selected patient information */}

        {loadingPatient && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700">
            <LoaderCircle
              size={18}
              className="animate-spin"
            />
            Loading selected patient's information...
          </div>
        )}

        {patientError && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-700">
              {patientError}
            </p>

            <button
              type="button"
              onClick={() => navigate("/patients")}
              className="mt-3 text-sm font-semibold text-red-700 underline"
            >
              Return to Patients
            </button>
          </div>
        )}

        {patient && !loadingPatient && (
          <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
              Selected Patient
            </p>

            <h3 className="mt-2 text-lg font-bold text-slate-900">
              {patient.patient_code}
            </h3>

            <p className="mt-1 text-sm text-slate-600">
              Patient ID: {patient.id}
              {" · "}
              {patient.age_years} years
              {" · "}
              {patient.sex}
            </p>

            <p className="mt-3 text-sm text-slate-600">
              The form has been populated from this patient's
              saved record. Review the information before
              generating predictions.
            </p>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Age (years) *
              </label>

              <input
                required
                type="number"
                name="age_years"
                value={formData.age_years}
                onChange={handleChange}
                min="40"
                max="120"
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Sex *
              </label>

              <select
                required
                name="sex"
                value={formData.sex}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">Select</option>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Osteoporosis Treatment *
              </label>

              <select
                required
                name="osteoporosis_treatment"
                value={formData.osteoporosis_treatment}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">Select</option>
                <option value="Bisphosphonates">
                  Bisphosphonates
                </option>
                <option value="Denosumab">Denosumab</option>
                <option value="Teriparatide">
                  Teriparatide
                </option>
                <option value="Raloxifene">Raloxifene</option>
                <option value="Calcium/Vitamin D">
                  Calcium/Vitamin D
                </option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Treatment Duration (months) *
              </label>

              <input
                required
                type="number"
                name="treatment_duration_months"
                value={formData.treatment_duration_months}
                onChange={handleChange}
                min="0"
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Previous Fracture *
              </label>

              <select
                required
                name="previous_fracture"
                value={formData.previous_fracture}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Functional Status
              </label>

              <select
                name="functional_status"
                value={formData.functional_status}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">Select</option>
                <option value="Independent">Independent</option>
                <option value="Partially dependent">
                  Partially dependent
                </option>
                <option value="Dependent">Dependent</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Follow-up Attendance *
              </label>

              <select
                required
                name="followup_attendance"
                value={formData.followup_attendance}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">Select</option>
                <option value="Regular">Regular</option>
                <option value="Irregular">Irregular</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Side Effects
              </label>

              <select
                name="side_effects"
                value={formData.side_effects}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">Select</option>
                <option value="None">None</option>
                <option value="Mild">Mild</option>
                <option value="Severe">Severe</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Medication Cost Burden *
              </label>

              <select
                required
                name="medication_cost_burden"
                value={formData.medication_cost_burden}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">Select</option>
                <option value="Low">Low</option>
                <option value="Moderate">Moderate</option>
                <option value="High">High</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Distance to Clinic (km)
              </label>

              <input
                type="number"
                name="distance_to_clinic_km"
                value={formData.distance_to_clinic_km}
                onChange={handleChange}
                min="0"
                step="0.1"
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Caregiver Support
              </label>

              <select
                name="caregiver_support"
                value={formData.caregiver_support}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Missed Doses in Last 30 Days *
              </label>

              <input
                required
                type="number"
                name="missed_doses_last_30_days"
                value={formData.missed_doses_last_30_days}
                onChange={handleChange}
                min="0"
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Health Education
              </label>

              <select
                name="health_education"
                value={formData.health_education}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">Select</option>
                <option value="Adequate">Adequate</option>
                <option value="Inadequate">Inadequate</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="mt-6">
            <button
              type="submit"
              disabled={loading || loadingPatient || Boolean(patientError)}
              className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <LoaderCircle
                    size={18}
                    className="animate-spin"
                  />
                  Running Models...
                </>
              ) : (
                <>
                  <Brain size={18} />
                  Generate Prediction
                </>
              )}
            </button>
          </div>
        </form>

        {results && (
          <section className="mt-10">
            <div className="mb-5">
              <h3 className="text-xl font-bold text-slate-900">
                Prediction Results
              </h3>

              <p className="mt-1 text-sm text-slate-600">
                Predictions from all available machine learning models.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {Object.entries(results).map(
                ([modelKey, result]) => {
                  const isAdherent =
                    result.prediction === "Adherent";

                  return (
                    <div
                      key={modelKey}
                      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h4 className="font-bold text-slate-900">
                            {result.model}
                          </h4>

                          <p className="mt-1 text-xs text-slate-500">
                            {modelKey.replace(/_/g, " ")}
                          </p>
                        </div>

                        {isAdherent ? (
                          <CheckCircle2
                            size={24}
                            className="text-emerald-600"
                          />
                        ) : (
                          <XCircle
                            size={24}
                            className="text-red-600"
                          />
                        )}
                      </div>

                      <div className="mt-5">
                        <p className="text-sm text-slate-500">
                          Prediction
                        </p>

                        <p
                          className={`mt-1 text-xl font-bold ${
                            isAdherent
                              ? "text-emerald-600"
                              : "text-red-600"
                          }`}
                        >
                          {result.prediction}
                        </p>
                      </div>

                      <div className="mt-5 space-y-3">
                        <div>
                          <div className="mb-1 flex justify-between text-sm">
                            <span className="text-slate-600">
                              Adherent
                            </span>

                            <span className="font-semibold text-slate-800">
                              {(
                                result.probability_adherent * 100
                              ).toFixed(2)}
                              %
                            </span>
                          </div>

                          <div className="h-2 rounded-full bg-slate-200">
                            <div
                              className="h-2 rounded-full bg-emerald-500"
                              style={{
                                width: `${Math.min(
                                  result.probability_adherent * 100,
                                  100
                                )}%`,
                              }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="mb-1 flex justify-between text-sm">
                            <span className="text-slate-600">
                              Non-adherent
                            </span>

                            <span className="font-semibold text-slate-800">
                              {(
                                result.probability_non_adherent *
                                100
                              ).toFixed(2)}
                              %
                            </span>
                          </div>

                          <div className="h-2 rounded-full bg-slate-200">
                            <div
                              className="h-2 rounded-full bg-red-500"
                              style={{
                                width: `${Math.min(
                                  result.probability_non_adherent *
                                    100,
                                  100
                                )}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      {renderInterpretability(
                        result.interpretability
                      )}
                    </div>
                  );
                }
              )}
            </div>

            <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm text-amber-800">
                <strong>Important:</strong> These explanations
                show how the model's features contributed to its
                prediction. They should support clinical
                assessment rather than replace professional
                clinical judgment.
              </p>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default Prediction;
