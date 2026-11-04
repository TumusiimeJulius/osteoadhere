
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  CheckCircle,
  Clock,
  CreditCard,
  ShieldCheck,
  ArrowRight,
  Sparkles,
} from "lucide-react";

function SubscriptionNotice() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const savedUser = JSON.parse(
        localStorage.getItem("user") || "null"
      );

      setUser(savedUser);
    } catch {
      setUser(null);
    }
  }, []);

  const trialUsed = Number(
    user?.trial_predictions_used || 0
  );

  const trialRemaining = Math.max(
    0,
    2 - trialUsed
  );

  const subscriptionActive =
    user?.subscription_status === "active" &&
    (
      !user?.subscription_expires_at ||
      new Date(user.subscription_expires_at) > new Date()
    );

  function continueToDashboard() {
    navigate("/dashboard");
  }

  function subscribe(plan) {
    navigate("/subscription", {
      state: { selectedPlan: plan },
    });
  }

  return (
    <div className="min-h-screen bg-slate-50">

      {/* HEADER */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">

          <div className="flex items-center gap-3">

            <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center">
              <Activity size={25} />
            </div>

            <div>
              <h1 className="font-bold text-slate-900">
                Osteoporosis Adherence
              </h1>

              <p className="text-xs text-slate-500">
                Prediction System
              </p>
            </div>

          </div>

          <div className="flex items-center gap-2 text-sm text-slate-500">
            <ShieldCheck size={18} className="text-green-600" />
            Secure Account
          </div>

        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-6xl mx-auto px-6 py-12">

        <div className="text-center max-w-2xl mx-auto mb-10">

          <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 text-blue-700 px-4 py-2 text-sm font-semibold mb-5">
            <Sparkles size={16} />
            Welcome to Osteoporosis Adherence
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
            Choose Your Access Plan
          </h2>

          <p className="mt-4 text-slate-600 leading-relaxed">
            Your account includes two free prediction attempts.
            Continue with the free trial or choose a subscription
            plan for extended access to the system.
          </p>

        </div>

        {/* TRIAL STATUS */}
        <div className="max-w-3xl mx-auto mb-10 bg-white border border-blue-200 rounded-2xl p-6 shadow-sm">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">

            <div className="flex items-start gap-4">

              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <Clock size={25} />
              </div>

              <div>
                <h3 className="font-bold text-lg text-slate-900">
                  {subscriptionActive
                    ? "Your Subscription"
                    : "Your Free Trial"}
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                  {subscriptionActive
                    ? "Your subscription is currently active."
                    : "Start using the system with your free prediction attempts."}
                </p>
              </div>

            </div>

            <div className="sm:text-right">

              {subscriptionActive ? (
                <span className="inline-flex items-center gap-2 text-green-700 font-semibold">
                  <CheckCircle size={19} />
                  Active
                </span>
              ) : (
                <>
                  <p className="text-3xl font-bold text-blue-700">
                    {trialRemaining}/2
                  </p>

                  <p className="text-xs text-slate-500">
                    Free attempts remaining
                  </p>
                </>
              )}

            </div>

          </div>

        </div>

        {/* SUBSCRIPTION PLANS */}
        <div className="grid md:grid-cols-3 gap-6">

          {/* FREE PLAN */}
          <div className="bg-white rounded-2xl border border-slate-200 p-7 shadow-sm flex flex-col">

            <div>
              <h3 className="text-xl font-bold text-slate-900">
                Free Trial
              </h3>

              <p className="text-sm text-slate-500 mt-2">
                Explore the prediction system.
              </p>

              <div className="mt-6">
                <span className="text-4xl font-bold text-slate-900">
                  $0
                </span>
                <span className="text-slate-500 text-sm">
                  {" "} / free
                </span>
              </div>

              <div className="border-t border-slate-100 my-6" />

              <ul className="space-y-4 text-sm text-slate-600">

                <li className="flex items-center gap-3">
                  <CheckCircle size={18} className="text-green-600" />
                  2 free prediction attempts
                </li>

                <li className="flex items-center gap-3">
                  <CheckCircle size={18} className="text-green-600" />
                  Access to the prediction system
                </li>

                <li className="flex items-center gap-3">
                  <CheckCircle size={18} className="text-green-600" />
                  Explore model results
                </li>

              </ul>
            </div>

            <button
              onClick={continueToDashboard}
              className="mt-auto pt-5 w-full"
            >
              <span className="flex items-center justify-center gap-2 w-full rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold py-3 transition">
                Continue with Free Trial
                <ArrowRight size={18} />
              </span>
            </button>

          </div>

          {/* MONTHLY PLAN */}
          <div className="bg-white rounded-2xl border-2 border-blue-500 p-7 shadow-md flex flex-col relative">

            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-4 py-1 rounded-full">
              MONTHLY PLAN
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-900">
                Monthly Access
              </h3>

              <p className="text-sm text-slate-500 mt-2">
                Flexible monthly access.
              </p>

              <div className="mt-6">
                <span className="text-4xl font-bold text-slate-900">
                  $14
                </span>

                <span className="text-slate-500 text-sm">
                  {" "} / month
                </span>
              </div>

              <div className="border-t border-slate-100 my-6" />

              <ul className="space-y-4 text-sm text-slate-600">

                <li className="flex items-center gap-3">
                  <CheckCircle size={18} className="text-green-600" />
                  Extended prediction access
                </li>

                <li className="flex items-center gap-3">
                  <CheckCircle size={18} className="text-green-600" />
                  Access to all three ML models
                </li>

                <li className="flex items-center gap-3">
                  <CheckCircle size={18} className="text-green-600" />
                  Prediction results and explanations
                </li>

                <li className="flex items-center gap-3">
                  <CheckCircle size={18} className="text-green-600" />
                  One-month subscription
                </li>

              </ul>
            </div>

            <button
              onClick={() => subscribe("monthly")}
              className="mt-auto pt-5 w-full"
            >
              <span className="flex items-center justify-center gap-2 w-full rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 transition">
                Choose Monthly
                <ArrowRight size={18} />
              </span>
            </button>

          </div>

          {/* ANNUAL PLAN */}
          <div className="bg-white rounded-2xl border border-slate-200 p-7 shadow-sm flex flex-col">

            <div>
              <h3 className="text-xl font-bold text-slate-900">
                Annual Access
              </h3>

              <p className="text-sm text-slate-500 mt-2">
                Long-term access at a lower cost.
              </p>

              <div className="mt-6">
                <span className="text-4xl font-bold text-slate-900">
                  $56
                </span>

                <span className="text-slate-500 text-sm">
                  {" "} / year
                </span>
              </div>

              <div className="mt-2">
                <span className="inline-block rounded-full bg-green-100 text-green-700 text-xs font-semibold px-3 py-1">
                  Save $112 yearly
                </span>
              </div>

              <div className="border-t border-slate-100 my-6" />

              <ul className="space-y-4 text-sm text-slate-600">

                <li className="flex items-center gap-3">
                  <CheckCircle size={18} className="text-green-600" />
                  Extended prediction access
                </li>

                <li className="flex items-center gap-3">
                  <CheckCircle size={18} className="text-green-600" />
                  Access to all three ML models
                </li>

                <li className="flex items-center gap-3">
                  <CheckCircle size={18} className="text-green-600" />
                  Prediction results and explanations
                </li>

                <li className="flex items-center gap-3">
                  <CheckCircle size={18} className="text-green-600" />
                  Twelve-month subscription
                </li>

              </ul>
            </div>

            <button
              onClick={() => subscribe("annual")}
              className="mt-auto pt-5 w-full"
            >
              <span className="flex items-center justify-center gap-2 w-full rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 transition">
                Choose Annual
                <ArrowRight size={18} />
              </span>
            </button>

          </div>

        </div>

        {/* PAYMENT NOTICE */}
        <div className="max-w-3xl mx-auto mt-10 bg-amber-50 border border-amber-200 rounded-xl p-5">

          <div className="flex gap-3">

            <CreditCard
              size={22}
              className="text-amber-600 shrink-0"
            />

            <div>
              <h4 className="font-semibold text-amber-900">
                Demonstration Payment Notice
              </h4>

              <p className="text-sm text-amber-800 mt-1 leading-relaxed">
                Subscription payments are simulated for this
                prototype. No real payment or financial transaction
                will be processed.
              </p>
            </div>

          </div>

        </div>

        {/* FOOTER */}
        <footer className="text-center text-xs text-slate-400 mt-10">
          Osteoporosis Treatment Adherence Prediction System
        </footer>

      </main>

    </div>
  );
}

export default SubscriptionNotice;
