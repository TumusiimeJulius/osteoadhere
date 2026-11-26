
import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../services/api";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const response = await forgotPassword(email);
      setMessage(
        response.message || "Password reset code sent to your email."
      );
    } catch (err) {
      setError(
        err.response?.data?.detail || "Unable to send password reset code."
      );
    } finally {
      setLoading(false);
    }
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
            ✉
          </div>

          <h2
            style={{
              fontSize: "27px",
              fontWeight: "750",
              color: "#173b4b",
              margin: "0 0 12px",
            }}
          >
            Forgot Password?
          </h2>

          <p
            style={{
              color: "#718096",
              fontSize: "14px",
              lineHeight: "1.7",
              margin: 0,
            }}
          >
            Don't worry! Enter your registered email address and we'll send
            you a password reset code.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <label
            htmlFor="reset-email"
            style={{
              display: "block",
              color: "#344b59",
              fontWeight: "600",
              fontSize: "14px",
              marginBottom: "9px",
            }}
          >
            Email Address
          </label>

          <input
            id="reset-email"
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "14px 15px",
              border: "1px solid #dce5eb",
              borderRadius: "10px",
              fontSize: "14px",
              outline: "none",
              boxSizing: "border-box",
              marginBottom: "20px",
              background: "#fbfdfe",
            }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
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
            }}
          >
            {loading ? "Sending..." : "Send Reset Code"}
          </button>
        </form>

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
