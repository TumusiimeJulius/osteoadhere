
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Activity,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";

import { loginUser } from "../services/api";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /*
   * Load remembered email when the login page opens.
   */
  useEffect(() => {
    const savedEmail = localStorage.getItem("login_email");

    if (savedEmail) {
      setFormData((previous) => ({
        ...previous,
        email: savedEmail,
      }));

      setRememberMe(true);
    }
  }, []);

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

    const email = formData.email.trim();
    const password = formData.password;

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      /*
       * Send login request through the centralized API service.
       */
      const data = await loginUser(email, password);

      console.log("LOGIN RESPONSE:", data);

      /*
       * Store the authentication token returned by
       * the backend.
       */
      if (data?.access_token) {
        localStorage.setItem(
          "access_token",
          data.access_token
        );
      } else if (data?.token) {
        localStorage.setItem(
          "access_token",
          data.token
        );
      }

      /*
       * Store user information if the backend provides it.
       */
      if (data?.user) {
        localStorage.setItem(
          "user",
          JSON.stringify(data.user)
        );
      }

      /*
       * Remember email only when requested.
       */
      if (rememberMe) {
        localStorage.setItem("login_email", email);
      } else {
        localStorage.removeItem("login_email");
      }

      /*
       * Login successful.
       * Display subscription notification before
       * allowing the user into the dashboard.
       */
      navigate("/subscription-notice");

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

      {/* Left branding section */}
      <div className="hidden lg:flex lg:w-1/2 bg-blue-700 text-white p-12 relative overflow-hidden">

        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-blue-600 opacity-50" />

        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-blue-800 opacity-50" />

        <div className="relative z-10 flex flex-col justify-between w-full">

          {/* Branding */}
          <div>
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
          </div>

          {/* Main message */}
          <div className="max-w-lg">

            <p className="text-blue-200 text-sm font-medium mb-4">
              INTERPRETABLE MACHINE LEARNING
            </p>

            <h2 className="text-4xl font-bold leading-tight">
              Supporting informed healthcare decisions through
              interpretable prediction.
            </h2>

            <p className="mt-6 text-blue-100 leading-relaxed">
              A machine learning system designed to help analyze
              factors associated with osteoporosis treatment
              adherence among adults in healthcare.
            </p>

            <div className="mt-8 flex items-center gap-3 text-blue-100">

              <ShieldCheck size={21} />

              <span className="text-sm">
                Secure access to the prediction system
              </span>

            </div>

          </div>

          {/* Footer */}
          <p className="text-blue-200 text-sm">
            Osteoporosis Treatment Adherence Prediction System
          </p>

        </div>
      </div>

      {/* Login section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10">

        <div className="w-full max-w-md">

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

          {/* Header */}
          <div className="mb-8">

            <h2 className="text-3xl font-bold text-slate-900">
              Welcome back
            </h2>

            <p className="mt-2 text-slate-500">
              Sign in to access your prediction dashboard.
            </p>

          </div>

          {/* Error message */}
          {error && (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Login form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

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
                  className="w-full rounded-lg border border-slate-300 bg-white py-3 pl-10 pr-4 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

              </div>

            </div>

            {/* Password */}
            <div>

              <div className="flex items-center justify-between mb-2">

                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-700"
                >
                  Password
                </label>

                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  Forgot password?
                </Link>

              </div>

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
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="w-full rounded-lg border border-slate-300 bg-white py-3 pl-10 pr-12 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((previous) => !previous)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >

                  {showPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}

                </button>

              </div>

            </div>

            {/* Remember me */}
            <div className="flex items-center">

              <input
                id="rememberMe"
                type="checkbox"
                checked={rememberMe}
                onChange={(event) =>
                  setRememberMe(event.target.checked)
                }
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />

              <label
                htmlFor="rememberMe"
                className="ml-2 text-sm text-slate-600"
              >
                Remember my email
              </label>

            </div>

            {/* Login button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 py-3.5 font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>

          </form>

          {/* Registration */}
          <p className="mt-7 text-center text-sm text-slate-600">

            Don't have an account?{" "}

            <Link
              to="/register"
              className="font-semibold text-blue-600 hover:text-blue-700"
            >
              Create an account
            </Link>

          </p>

          {/* Security notice */}
          <p className="mt-8 text-center text-xs text-slate-400">
            Authorized users only. Please keep your account
            credentials secure.
          </p>

        </div>
      </div>

    </div>
  );
}

export default Login;
