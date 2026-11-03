
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Phone,
  ShieldCheck,
  User,
  Globe,
} from "lucide-react";

import { registerUser } from "../services/api";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone_number: "",
    country: "",
    password: "",
    confirm_password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    // Frontend validation
    if (
      !formData.full_name.trim() ||
      !formData.email.trim() ||
      !formData.phone_number.trim() ||
      !formData.country.trim() ||
      !formData.password ||
      !formData.confirm_password
    ) {
      setError("Please complete all required fields.");
      return;
    }

    if (formData.password !== formData.confirm_password) {
      setError("Passwords do not match.");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    try {
      setLoading(true);

      const data = await registerUser({
        full_name: formData.full_name.trim(),
        email: formData.email.trim(),
        phone_number: formData.phone_number.trim(),
        country: formData.country.trim(),
        password: formData.password,
        confirm_password: formData.confirm_password,
      });

      setSuccess(
        data?.message ||
          "Registration successful. Please check your email for the verification OTP."
      );

      // Move to email verification page
      setTimeout(() => {
        navigate(
          `/verify-email?email=${encodeURIComponent(
            formData.email.trim()
          )}`
        );
      }, 1200);
    } catch (err) {
      setError(
        err.message ||
          "Unable to connect to the server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">

      {/* Left section */}
      <div className="hidden lg:flex lg:w-5/12 bg-blue-700 text-white p-12 relative overflow-hidden">

        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-blue-600 opacity-50" />

        <div className="absolute -bottom-48 -left-48 w-[600px] h-[600px] rounded-full bg-blue-800 opacity-50" />

        <div className="relative z-10 flex flex-col justify-between w-full">

          {/* Branding */}
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

          {/* Information */}
          <div>

            <p className="text-blue-200 text-sm font-medium mb-4">
              CREATE YOUR ACCOUNT
            </p>

            <h2 className="text-4xl font-bold leading-tight">
              Access an interpretable machine learning system for
              treatment adherence analysis.
            </h2>

            <p className="mt-6 text-blue-100 leading-relaxed">
              Create an account to securely access patient prediction
              tools, model results and interpretation features.
            </p>

            <div className="mt-8 space-y-4">

              <div className="flex items-center gap-3 text-blue-100">
                <ShieldCheck size={21} />

                <span className="text-sm">
                  Secure user authentication
                </span>
              </div>

              <div className="flex items-center gap-3 text-blue-100">
                <Activity size={21} />

                <span className="text-sm">
                  Three machine learning models
                </span>
              </div>

            </div>

          </div>

          <p className="text-blue-200 text-sm">
            Osteoporosis Treatment Adherence Prediction System
          </p>

        </div>
      </div>

      {/* Registration form */}
      <div className="w-full lg:w-7/12 flex items-center justify-center p-6 sm:p-10">

        <div className="w-full max-w-xl">

          {/* Mobile branding */}
          <div className="lg:hidden mb-8 text-center">

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

          {/* Heading */}
          <div className="mb-7">

            <h2 className="text-3xl font-bold text-slate-900">
              Create your account
            </h2>

            <p className="mt-2 text-slate-500">
              Enter your details to create a secure account.
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
            <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {success}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* Full name */}
            <div>

              <label
                htmlFor="full_name"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Full name
              </label>

              <div className="relative">

                <User
                  size={19}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  autoComplete="name"
                  disabled={loading}
                  className="w-full rounded-lg border border-slate-300 bg-white py-3 pl-10 pr-4 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                />

              </div>

            </div>

            {/* Email + Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

              {/* Email */}
              <div>

                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Email address
                </label>

                <div className="relative">

                  <Mail
                    size={19}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    autoComplete="email"
                    disabled={loading}
                    className="w-full rounded-lg border border-slate-300 bg-white py-3 pl-10 pr-4 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                  />

                </div>

              </div>

              {/* Phone */}
              <div>

                <label
                  htmlFor="phone_number"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Phone number
                </label>

                <div className="relative">

                  <Phone
                    size={19}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="phone_number"
                    name="phone_number"
                    type="tel"
                    value={formData.phone_number}
                    onChange={handleChange}
                    placeholder="+256..."
                    autoComplete="tel"
                    disabled={loading}
                    className="w-full rounded-lg border border-slate-300 bg-white py-3 pl-10 pr-4 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                  />

                </div>

              </div>

            </div>

            {/* Country */}
            <div>

              <label
                htmlFor="country"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Country
              </label>

              <div className="relative">

                <Globe
                  size={19}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="country"
                  name="country"
                  type="text"
                  value={formData.country}
                  onChange={handleChange}
                  placeholder="Enter your country"
                  autoComplete="country-name"
                  disabled={loading}
                  className="w-full rounded-lg border border-slate-300 bg-white py-3 pl-10 pr-4 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                />

              </div>

            </div>

            {/* Passwords */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

              {/* Password */}
              <div>

                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Password
                </label>

                <div className="relative">

                  <LockKeyhole
                    size={19}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create password"
                    autoComplete="new-password"
                    disabled={loading}
                    className="w-full rounded-lg border border-slate-300 bg-white py-3 pl-10 pr-11 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (previous) => !previous
                      )
                    }
                    disabled={loading}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 disabled:opacity-50"
                  >
                    {showPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>

                </div>

                <p className="mt-1.5 text-xs text-slate-400">
                  At least 8 characters.
                </p>

              </div>

              {/* Confirm password */}
              <div>

                <label
                  htmlFor="confirm_password"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Confirm password
                </label>

                <div className="relative">

                  <LockKeyhole
                    size={19}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="confirm_password"
                    name="confirm_password"
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    value={formData.confirm_password}
                    onChange={handleChange}
                    placeholder="Confirm password"
                    autoComplete="new-password"
                    disabled={loading}
                    className="w-full rounded-lg border border-slate-300 bg-white py-3 pl-10 pr-11 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(
                        (previous) => !previous
                      )
                    }
                    disabled={loading}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 disabled:opacity-50"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>

                </div>

              </div>

            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 py-3.5 font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center gap-2"
            >

              {loading ? (
                <>
                  <span className="h-5 w-5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Create account
                  <ArrowRight size={18} />
                </>
              )}

            </button>

          </form>

          {/* Login link */}
          <p className="mt-7 text-center text-sm text-slate-600">

            Already have an account?{" "}

            <Link
              to="/login"
              className="font-semibold text-blue-600 hover:text-blue-700"
            >
              Sign in
            </Link>

          </p>

          <p className="mt-6 text-center text-xs text-slate-400">
            By creating an account, you agree to use the system
            responsibly and keep your credentials secure.
          </p>

        </div>
      </div>

    </div>
  );
}

export default Register;

