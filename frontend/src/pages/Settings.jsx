
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Bell,
  Check,
  LockKeyhole,
  Save,
  Settings as SettingsIcon,
  ShieldCheck,
  UserRound,
} from "lucide-react";

export default function Settings() {
  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    predictionConfirmation: true,
    showExplanations: true,
  });

  const [security, setSecurity] = useState({
    sessionTimeout: "30",
  });

  const [saved, setSaved] = useState(false);

  function updateProfile(event) {
    const { name, value } = event.target;
    setProfile((current) => ({ ...current, [name]: value }));
    setSaved(false);
  }

  function updatePreference(name) {
    setPreferences((current) => ({
      ...current,
      [name]: !current[name],
    }));
    setSaved(false);
  }

  function updateSecurity(event) {
    setSecurity((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
    setSaved(false);
  }

  function handleSave(event) {
    event.preventDefault();

    // Settings are currently held in page state only.
    // Backend persistence can be connected later.
    setSaved(true);
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-5">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-blue-600">
              <SettingsIcon size={18} />
              OsteoAdhere
            </div>

            <h1 className="mt-2 text-2xl font-bold">Settings</h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage your profile, preferences, and application options.
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

      <main className="mx-auto max-w-5xl space-y-6 px-6 py-8">
        <form onSubmit={handleSave} className="space-y-6">
          {/* PROFILE */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                <UserRound size={22} />
              </div>

              <div>
                <h2 className="font-semibold">Profile settings</h2>
                <p className="text-sm text-slate-500">
                  Enter your account details.
                </p>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label
                  htmlFor="fullName"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Full name
                </label>

                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={profile.fullName}
                  onChange={updateProfile}
                  placeholder="Enter your full name"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Email address
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  value={profile.email}
                  onChange={updateProfile}
                  placeholder="Enter your email"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>
          </section>

          {/* NOTIFICATIONS */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-xl bg-purple-50 p-3 text-purple-600">
                <Bell size={22} />
              </div>

              <div>
                <h2 className="font-semibold">Application preferences</h2>
                <p className="text-sm text-slate-500">
                  Choose how the application should behave.
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <PreferenceRow
                title="Email notifications"
                description="Receive email updates when supported by the application."
                checked={preferences.emailNotifications}
                onChange={() => updatePreference("emailNotifications")}
              />

              <PreferenceRow
                title="Confirm before predictions"
                description="Keep prediction workflows deliberate before submitting patient data."
                checked={preferences.predictionConfirmation}
                onChange={() => updatePreference("predictionConfirmation")}
              />

              <PreferenceRow
                title="Show prediction explanations"
                description="Prefer explanations that help users understand model predictions."
                checked={preferences.showExplanations}
                onChange={() => updatePreference("showExplanations")}
              />
            </div>
          </section>

          {/* SECURITY */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                <LockKeyhole size={22} />
              </div>

              <div>
                <h2 className="font-semibold">Security preferences</h2>
                <p className="text-sm text-slate-500">
                  Configure your preferred session timeout.
                </p>
              </div>
            </div>

            <div className="max-w-md">
              <label
                htmlFor="sessionTimeout"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Session timeout preference
              </label>

              <select
                id="sessionTimeout"
                name="sessionTimeout"
                value={security.sessionTimeout}
                onChange={updateSecurity}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="60">60 minutes</option>
              </select>

              <p className="mt-2 text-xs leading-5 text-slate-500">
                This is a preference only. It will not enforce automatic
                logout until session management is connected to the backend.
              </p>
            </div>

            <div className="mt-5 flex items-start gap-3 rounded-xl bg-slate-50 p-4">
              <ShieldCheck
                size={20}
                className="mt-0.5 shrink-0 text-slate-500"
              />
              <p className="text-sm leading-6 text-slate-600">
                Patient information should only be accessed by authorised
                users. Backend access controls must enforce permissions
                independently of these frontend settings.
              </p>
            </div>
          </section>

          {/* SAVE */}
          <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div>
              {saved ? (
                <p className="flex items-center gap-2 text-sm font-medium text-emerald-700">
                  <Check size={18} />
                  Settings applied for this page session.
                </p>
              ) : (
                <p className="text-sm text-slate-500">
                  Changes are currently stored in page state only.
                </p>
              )}
            </div>

            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
            >
              <Save size={17} />
              Apply Settings
            </button>
          </section>
        </form>
      </main>
    </div>
  );
}

function PreferenceRow({ title, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-5 border-b border-slate-100 pb-5 last:border-0 last:pb-0">
      <div>
        <h3 className="text-sm font-medium text-slate-800">{title}</h3>
        <p className="mt-1 text-sm leading-5 text-slate-500">
          {description}
        </p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={title}
        onClick={onChange}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          checked ? "bg-blue-600" : "bg-slate-300"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
            checked ? "left-5.5" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}
