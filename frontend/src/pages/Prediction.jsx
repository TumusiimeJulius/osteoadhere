
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPatient, predictAdherence } from "../services/api";
import { ArrowLeft } from "lucide-react";

const initialFormData = {
  age_years: "",
  sex: "Female",
  education_level: "Secondary",
  marital_status: "Married",
  previous_fracture: "No",
  family_history_osteoporosis: "No",
  comorbidities_count: "0",
  osteoporosis_severity: "Moderate",
  osteoporosis_treatment: "Bisphosphonates",
  treatment_duration_months: "12",
  dosage_frequency: "Weekly",
  previous_osteoporosis_treatment: "No",
  functional_status: "Independent",
  follow_up_attendance: "Regular",
  side_effects: "Mild",
  medication_cost_burden: "Low",
  distance_to_clinic_km: "5",
  transport_availability: "Available",
  insurance_coverage: "No",
  caregiver_support: "No",
  family_support: "Moderate",
  missed_doses_last_30_days: "0",
  health_education: "Adequate",
  medication_knowledge: "Good",
  medication_taking_routine: "Established",
  perceived_treatment_effectiveness: "Moderate",
  treatment_satisfaction: "Satisfied",
  mobility_level: "No limitation",
  osteoporosis_knowledge: "Good",
  clinic_wait_time: "Moderate",
  income_category: "Middle",
};

const fields = [
  {
    section: "Patient Demographics",
    items: [
      { name: "age_years", label: "Age (years)", type: "number", min: 40, max: 120 },
      { name: "sex", label: "Sex", options: ["Female", "Male"] },
      {
        name: "education_level",
        label: "Education Level",
        options: ["No formal education", "Primary", "Secondary", "Tertiary"],
      },
      {
        name: "marital_status",
        label: "Marital Status",
        options: ["Married", "Separated/Divorced", "Single", "Widowed"],
      },
      {
        name: "income_category",
        label: "Income Category",
        options: ["Low", "Middle", "High"],
      },
    ],
  },
  {
    section: "Medical and Osteoporosis Information",
    items: [
      { name: "previous_fracture", label: "Previous Fracture", options: ["No", "Yes"] },
      {
        name: "family_history_osteoporosis",
        label: "Family History of Osteoporosis",
        options: ["No", "Yes", "Unknown"],
      },
      {
        name: "comorbidities_count",
        label: "Number of Comorbidities",
        type: "number",
        min: 0,
        max: 30,
      },
      {
        name: "osteoporosis_severity",
        label: "Osteoporosis Severity",
        options: ["Mild", "Moderate", "Severe"],
      },
      {
        name: "osteoporosis_treatment",
        label: "Osteoporosis Treatment",
        options: [
          "Bisphosphonates",
          "Calcium/Vitamin D",
          "Denosumab",
          "Raloxifene",
          "Teriparatide",
        ],
      },
      {
        name: "treatment_duration_months",
        label: "Treatment Duration (months)",
        type: "number",
        min: 0,
        max: 600,
      },
      {
        name: "dosage_frequency",
        label: "Dosage Frequency",
        options: ["Daily", "Weekly", "Monthly", "Every 6 months", "Yearly"],
      },
      {
        name: "previous_osteoporosis_treatment",
        label: "Previous Osteoporosis Treatment",
        options: ["No", "Yes"],
      },
    ],
  },
  {
    section: "Treatment and Medication Behaviour",
    items: [
      {
        name: "functional_status",
        label: "Functional Status",
        options: ["Independent", "Partially dependent", "Dependent"],
      },
      {
        name: "follow_up_attendance",
        label: "Follow-up Attendance",
        options: ["Regular", "Irregular"],
      },
      {
        name: "side_effects",
        label: "Medication Side Effects",
        options: ["Mild", "Moderate", "Severe"],
      },
      {
        name: "medication_cost_burden",
        label: "Medication Cost Burden",
        options: ["Low", "Moderate", "High"],
      },
      {
        name: "missed_doses_last_30_days",
        label: "Missed Doses in Last 30 Days",
        type: "number",
        min: 0,
        max: 30,
      },
      {
        name: "medication_taking_routine",
        label: "Medication-taking Routine",
        options: ["Established", "Not established"],
      },
      {
        name: "medication_knowledge",
        label: "Medication Knowledge",
        options: ["Poor", "Fair", "Good"],
      },
      {
        name: "perceived_treatment_effectiveness",
        label: "Perceived Treatment Effectiveness",
        options: ["Low", "Moderate", "High", "Unsure"],
      },
      {
        name: "treatment_satisfaction",
        label: "Treatment Satisfaction",
        options: ["Dissatisfied", "Neutral", "Satisfied"],
      },
    ],
  },
  {
    section: "Healthcare Access and Support",
    items: [
      {
        name: "distance_to_clinic_km",
        label: "Distance to Clinic (km)",
        type: "number",
        min: 0,
        max: 1000,
        step: "0.1",
      },
      {
        name: "transport_availability",
        label: "Transport Availability",
        options: ["Available", "Sometimes available", "Unavailable"],
      },
      {
        name: "insurance_coverage",
        label: "Insurance Coverage",
        options: ["No", "Yes"],
      },
      {
        name: "caregiver_support",
        label: "Caregiver Support",
        options: ["No", "Yes"],
      },
      {
        name: "family_support",
        label: "Family Support",
        options: ["Limited", "Moderate", "Strong"],
      },
      {
        name: "health_education",
        label: "Health Education",
        options: ["Adequate", "Inadequate"],
      },
      {
        name: "mobility_level",
        label: "Mobility Level",
        options: ["No limitation", "Some limitation", "Major limitation"],
      },
      {
        name: "osteoporosis_knowledge",
        label: "Osteoporosis Knowledge",
        options: ["Poor", "Fair", "Good"],
      },
      {
        name: "clinic_wait_time",
        label: "Clinic Waiting Time",
        options: ["Short", "Moderate", "Long"],
      },
    ],
  },
];

function Prediction() {
  const { patientId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [loadingPatient, setLoadingPatient] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!patientId) return;

    const loadPatient = async () => {
      setLoadingPatient(true);
      setError("");

      try {
        const response = await getPatient(patientId);
        const patient = response?.patient || response?.data || response;

        setFormData((previous) => {
          const updated = { ...previous };

          Object.keys(initialFormData).forEach((key) => {
            if (patient?.[key] !== undefined && patient?.[key] !== null) {
              updated[key] = String(patient[key]);
            }
          });

          return updated;
        });
      } catch (err) {
        setError(
          "Unable to load patient information. You can enter the details manually."
        );
      } finally {
        setLoadingPatient(false);
      }
    };

    loadPatient();
  }, [patientId]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (
      !formData.age_years ||
      Number(formData.age_years) < 40 ||
      Number(formData.age_years) > 120
    ) {
      setError("Enter a valid patient age between 40 and 120 years.");
      return;
    }

    const payload = {
      age_years: Number(formData.age_years),
      sex: formData.sex,
      education_level: formData.education_level,
      marital_status: formData.marital_status,
      previous_fracture: formData.previous_fracture,
      family_history_osteoporosis: formData.family_history_osteoporosis,
      comorbidities_count: Number(formData.comorbidities_count),
      osteoporosis_severity: formData.osteoporosis_severity,
      osteoporosis_treatment: formData.osteoporosis_treatment,
      treatment_duration_months: Number(formData.treatment_duration_months),
      dosage_frequency: formData.dosage_frequency,
      previous_osteoporosis_treatment: formData.previous_osteoporosis_treatment,
      functional_status: formData.functional_status,
      follow_up_attendance: formData.follow_up_attendance,
      side_effects: formData.side_effects,
      medication_cost_burden: formData.medication_cost_burden,
      distance_to_clinic_km: Number(formData.distance_to_clinic_km),
      transport_availability: formData.transport_availability,
      insurance_coverage: formData.insurance_coverage,
      caregiver_support: formData.caregiver_support,
      family_support: formData.family_support,
      missed_doses_last_30_days: Number(formData.missed_doses_last_30_days),
      health_education: formData.health_education,
      medication_knowledge: formData.medication_knowledge,
      medication_taking_routine: formData.medication_taking_routine,
      perceived_treatment_effectiveness: formData.perceived_treatment_effectiveness,
      treatment_satisfaction: formData.treatment_satisfaction,
      mobility_level: formData.mobility_level,
      osteoporosis_knowledge: formData.osteoporosis_knowledge,
      clinic_wait_time: formData.clinic_wait_time,
      income_category: formData.income_category,
    };

    setLoading(true);

    try {
      const response = await predictAdherence(payload);
      const result = response?.result;

      if (!result) {
        throw new Error("The backend returned no prediction result.");
      }

      navigate("/prediction-results", {
        state: {
          result,
          patientId: patientId || null,
          patientData: payload,
          trial_predictions_used: response.trial_predictions_used,
          trial_limit: response.trial_limit,
          subscription_active: response.subscription_active,
        },
      });
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          err?.message ||
          "Prediction failed. Check that the backend server is running."
      );
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setError("");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="mb-6 inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </button>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
            Treatment Adherence Prediction
          </h1>

          <p className="mt-2 text-gray-600">
            Enter patient information to predict osteoporosis treatment
            adherence using the selected Support Vector Machine (SVM) model.
          </p>
        </div>

        {loadingPatient && (
          <div className="mb-4 rounded-lg bg-blue-50 p-3 text-blue-700">
            Loading patient information...
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {fields.map((section) => (
              <section
                key={section.section}
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm md:p-6"
              >
                <h2 className="mb-5 border-b border-gray-100 pb-3 text-lg font-semibold text-gray-900">
                  {section.section}
                </h2>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {section.items.map((field) => (
                    <div key={field.name}>
                      <label
                        htmlFor={field.name}
                        className="mb-2 block text-sm font-medium text-gray-700"
                      >
                        {field.label}
                        <span className="text-red-500"> *</span>
                      </label>

                      {field.options ? (
                        <select
                          id={field.name}
                          name={field.name}
                          value={formData[field.name]}
                          onChange={handleChange}
                          required
                          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        >
                          {field.options.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          id={field.name}
                          name={field.name}
                          type="number"
                          min={field.min}
                          max={field.max}
                          step={field.step || "1"}
                          value={formData[field.name]}
                          onChange={handleChange}
                          required
                          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={loading || loadingPatient}
              className="rounded-lg bg-blue-700 px-6 py-3 font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Generating Prediction..." : "Generate Prediction"}
            </button>

            <button
              type="button"
              onClick={resetForm}
              disabled={loading}
              className="rounded-lg border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-50"
            >
              Reset Form
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Prediction;
