
import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Activity,
  ArrowLeft,
  CheckCircle2,
  Mail,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

import {
  verifyEmail,
  resendVerification,
} from "../services/api";

function VerifyEmail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const emailFromUrl = searchParams.get("email") || "";

  const [email, setEmail] = useState(emailFromUrl);
  const [otp, setOtp] = useState("");

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (emailFromUrl) {
      setEmail(emailFromUrl);
    }
  }, [emailFromUrl]);

  function handleOtpChange(event) {
    const value = event.target.value.replace(/\D/g, "");

    if (value.length <= 6) {
      setOtp(value);
    }
  }

  async function handleVerify(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (otp.length !== 6) {
      setError("Please enter the 6-digit verification OTP.");
      return;
    }

    try {
      setLoading(true);

      const data = await verifyEmail(
        email.trim(),
        otp
      );

      setSuccess(
        data?.message ||
          "Your email has been verified successfully."
      );

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      setError(
        err.message ||
          "Email verification failed."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setError("");
    setSuccess("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    try {
      setResending(true);

      const data = await resendVerification(
        email.trim()
      );

      setSuccess(
        data?.message ||
          "A new verification OTP has been sent to your email."
      );
    } catch (err) {
      setError(
        err.message ||
          "Unable to resend verification OTP."
      );
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">

      {/* Left branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-blue-700 text-white p-12 relative overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-blue-600 opacity-50" />

        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-blue-800 opacity-50" />

        <div className="relative z-10 flex flex-col justify-between w-full">

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center">
              <Activity size={25} />
            </div>

            <div>
              <h1 className="font-bold text-lg">
                Osteoporosis Adherence
              </h1>

              <p className="text-blue-200 text-sm">
                Prediction System
              </p>
            </div>
          </div>

          <div className="max-w-lg">

            <p className="text-blue-200 text-sm font-medium mb-4">
              ACCOUNT SECURITY
            </p>

            <h2 className="text-4xl font-bold leading-tight">
              Verify your email address.
            </h2>

            <p className="mt-6 text-blue-100 leading-relaxed">
              Email verification helps protect your account and
              ensures that you have access to the email address
              associated with your account.
            </p>

            <div className="mt-8 flex items-center gap-3 text-blue-100">
              <ShieldCheck size={21} />

              <span className="text-sm">
                Secure account verification
              </span>
            </div>

          </div>

          <p className="text-blue-200 text-sm">
            Osteoporosis Treatment Adherence Prediction System
          </p>

        </div>
      </div>

      {/* Verification form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">

            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 text-white">
              <Activity size={25} />
            </div>

            <h1 className="mt-3 text-xl font-bold text-slate-900">
              Osteoporosis Adherence
            </h1>

            <p className="text-sm text-slate-500">
              Prediction System
            </p>

          </div>

          {/* Header */}
          <div className="text-center mb-8">

            <div className="mx-auto w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <Mail size={30} />
            </div>

            <h2 className="mt-5 text-3xl font-bold text-slate-900">
              Verify your email
            </h2>

            <p className="mt-3 text-slate-500 leading-relaxed">
              Enter the 6-digit OTP sent to your email address.
            </p>

          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="mb-5 flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              <CheckCircle2
                size={19}
                className="mt-0.5 shrink-0"
              />

              <span>{success}</span>
            </div>
          )}

          {/* Verification form */}
          <form onSubmit={handleVerify} className="space-y-5">

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Email address
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* OTP */}
            <div>
              <label
                htmlFor="otp"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Verification OTP
              </label>

              <input
                id="otp"
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={handleOtpChange}
                placeholder="000000"
                autoComplete="one-time-code"
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-4 text-center text-2xl font-semibold tracking-[0.5em] text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              <p className="mt-2 text-xs text-slate-400">
                The OTP expires after 10 minutes.
              </p>
            </div>

            {/* Verify button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 py-3.5 font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Verifying..." : "Verify email"}
            </button>

          </form>

          {/* Resend */}
          <div className="mt-6 text-center">

            <p className="text-sm text-slate-500">
              Didn't receive the OTP?
            </p>

            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={resending ? "animate-spin" : ""}
              />

              {resending
                ? "Sending..."
                : "Resend verification OTP"}
            </button>

          </div>

          {/* Back to login */}
          <div className="mt-7 text-center">

            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700"
            >
              <ArrowLeft size={16} />

              Back to sign in
            </Link>

          </div>

        </div>
      </div>

    </div>
  );
}

export default VerifyEmail;

