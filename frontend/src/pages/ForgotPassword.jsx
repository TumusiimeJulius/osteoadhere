
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  forgotPassword,
  verifyResetOtp,
  resetPassword,
} from "../services/api";

function ForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const clearMessages = () => {
    setMessage("");
    setError("");
  };

  // STEP 1: Send reset code
  const handleSendCode = async (e) => {
    e.preventDefault();
    clearMessages();
    setLoading(true);

    try {
      const response = await forgotPassword(email);

      setMessage(
        response.message || "Password reset code sent to your email."
      );

      setStep(2);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to send password reset code."
      );
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Verify reset code
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    clearMessages();
    setLoading(true);

    try {
      const response = await verifyResetOtp(email, otp);

      setMessage(
        response.message || "Code verified successfully."
      );

      setStep(3);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Invalid or expired reset code."
      );
    } finally {
      setLoading(false);
    }
  };

  // STEP 3: Reset password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    clearMessages();

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      const response = await resetPassword(
        email,
        otp,
        newPassword,
        confirmPassword
      );

      setMessage(
        response.message || "Password reset successfully."
      );

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to reset password."
      );
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "14px 15px",
    border: "1px solid #dce5eb",
    borderRadius: "10px",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
    marginBottom: "20px",
    background: "#fbfdfe",
  };

  const labelStyle = {
    display: "block",
    color: "#344b59",
    fontWeight: "600",
    fontSize: "14px",
    marginBottom: "9px",
  };

  const buttonStyle = {
    width: "100%",
    padding: "15px",
    border: "none",
    borderRadius: "10px",
    background: loading ? "#75b8aa" : "#087f6b",
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: "700",
    cursor: loading ? "not-allowed" : "pointer",
    boxShadow: "0 5px 14px rgba(8, 127, 107, 0.2)",
  };

  const stepTitles = {
    1: "Forgot Password?",
    2: "Verify Reset Code",
    3: "Create New Password",
  };

  const stepDescriptions = {
    1: "Enter your registered email address and we'll send you a password reset code.",
    2: "Enter the six-digit reset code sent to your email address.",
    3: "Your code has been verified. Create a new password for your account.",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        background:
          "linear-gradient(135deg, #e8f5f2 0%, #f4f8fc 50%, #e8efff 100%)",
        fontFamily: "Inter, Arial, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "440px",
          background: "#ffffff",
          borderRadius: "20px",
          padding: "42px 36px",
          boxShadow: "0 15px 45px rgba(15, 50, 70, 0.10)",
          border: "1px solid #e8eef2",
          boxSizing: "border-box",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <div
            style={{
              width: "68px",
              height: "68px",
              borderRadius: "20px",
              background: "#e6f5f1",
              color: "#087f6b",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
              fontSize: "32px",
            }}
          >
            {step === 1 ? "✉" : step === 2 ? "🔐" : "🔑"}
          </div>

          <h2
            style={{
              fontSize: "27px",
              fontWeight: "750",
              color: "#173b4b",
              margin: "0 0 12px",
            }}
          >
            {stepTitles[step]}
          </h2>

          <p
            style={{
              color: "#718096",
              fontSize: "14px",
              lineHeight: "1.7",
              margin: 0,
            }}
          >
            {stepDescriptions[step]}
          </p>
        </div>

        {/* Progress indicator */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            marginBottom: "28px",
          }}
        >
          {[1, 2, 3].map((number) => (
            <div
              key={number}
              style={{
                width: "32px",
                height: "6px",
                borderRadius: "10px",
                background: step >= number ? "#087f6b" : "#e4ebef",
              }}
            />
          ))}
        </div>

        {/* STEP 1: Email */}
        {step === 1 && (
          <form onSubmit={handleSendCode}>
            <label htmlFor="reset-email" style={labelStyle}>
              Email Address
            </label>

            <input
              id="reset-email"
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={inputStyle}
            />

            <button
              type="submit"
              disabled={loading}
              style={buttonStyle}
            >
              {loading ? "Sending..." : "Send Reset Code"}
            </button>
          </form>
        )}

        {/* STEP 2: OTP */}
        {step === 2 && (
          <form onSubmit={handleVerifyCode}>
            <label htmlFor="reset-otp" style={labelStyle}>
              Six-Digit Reset Code
            </label>

            <input
              id="reset-otp"
              type="text"
              inputMode="numeric"
              maxLength="6"
              placeholder="Enter your six-digit code"
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              required
              style={{
                ...inputStyle,
                textAlign: "center",
                letterSpacing: "8px",
                fontSize: "20px",
                fontWeight: "700",
              }}
            />

            <p
              style={{
                color: "#718096",
                fontSize: "12px",
                marginTop: "-10px",
                marginBottom: "20px",
              }}
            >
              Code sent to {email}
            </p>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              style={buttonStyle}
            >
              {loading ? "Verifying..." : "Verify Code"}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep(1);
                setOtp("");
                clearMessages();
              }}
              style={{
                width: "100%",
                marginTop: "12px",
                padding: "12px",
                border: "1px solid #dce5eb",
                borderRadius: "10px",
                background: "#ffffff",
                color: "#526777",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Change Email Address
            </button>
          </form>
        )}

        {/* STEP 3: New Password */}
        {step === 3 && (
          <form onSubmit={handleResetPassword}>
            <label htmlFor="new-password" style={labelStyle}>
              New Password
            </label>

            <input
              id="new-password"
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              minLength="8"
              required
              style={inputStyle}
            />

            <label htmlFor="confirm-password" style={labelStyle}>
              Confirm New Password
            </label>

            <input
              id="confirm-password"
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength="8"
              required
              style={inputStyle}
            />

            <button
              type="submit"
              disabled={loading}
              style={buttonStyle}
            >
              {loading ? "Resetting Password..." : "Reset Password"}
            </button>
          </form>
        )}

        {/* Messages */}
        {message && (
          <p
            style={{
              marginTop: "18px",
              padding: "12px",
              background: "#eaf8f0",
              color: "#187647",
              borderRadius: "9px",
              fontSize: "13px",
              lineHeight: "1.5",
            }}
          >
            {message}
          </p>
        )}

        {error && (
          <p
            style={{
              marginTop: "18px",
              padding: "12px",
              background: "#fff0f0",
              color: "#c0392b",
              borderRadius: "9px",
              fontSize: "13px",
              lineHeight: "1.5",
            }}
          >
            {error}
          </p>
        )}

        <div
          style={{
            textAlign: "center",
            marginTop: "27px",
            paddingTop: "22px",
            borderTop: "1px solid #edf1f4",
          }}
        >
          <Link
            to="/login"
            style={{
              color: "#087f6b",
              fontSize: "14px",
              fontWeight: "650",
              textDecoration: "none",
            }}
          >
            ← Back to Login
          </Link>
        </div>

        <p
          style={{
            textAlign: "center",
            color: "#a0acb5",
            fontSize: "11px",
            margin: "25px 0 0",
          }}
        >
          OsteoAdhere | Secure Account Recovery
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;
