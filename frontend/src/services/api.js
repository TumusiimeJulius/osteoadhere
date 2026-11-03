
const API_BASE_URL = "http://127.0.0.1:8000";

async function apiRequest(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    body: options.body
      ? JSON.stringify(options.body)
      : undefined,
  });

  let data;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    let message = "Something went wrong.";

    if (typeof data?.detail === "string") {
      message = data.detail;
    } else if (data?.detail?.message) {
      message = data.detail.message;
    } else if (data?.message) {
      message = data.message;
    }

    throw new Error(message);
  }

  return data;
}

/* ---------------- AUTHENTICATION ---------------- */

export async function registerUser(userData) {
  return apiRequest("/auth/register", {
    method: "POST",
    body: userData,
  });
}

export async function verifyEmail(email, otp) {
  return apiRequest("/auth/verify-email", {
    method: "POST",
    body: {
      email,
      otp,
    },
  });
}

export async function resendVerification(email) {
  return apiRequest("/auth/resend-verification", {
    method: "POST",
    body: {
      email,
    },
  });
}

export async function loginUser(email, password) {
  return apiRequest("/auth/login", {
    method: "POST",
    body: {
      email,
      password,
    },
  });
}

export async function forgotPassword(email) {
  return apiRequest("/auth/forgot-password", {
    method: "POST",
    body: {
      email,
    },
  });
}

export async function verifyResetOtp(email, otp) {
  return apiRequest("/auth/verify-reset-otp", {
    method: "POST",
    body: {
      email,
      otp,
    },
  });
}

export async function resetPassword(
  email,
  otp,
  newPassword,
  confirmPassword
) {
  return apiRequest("/auth/reset-password", {
    method: "POST",
    body: {
      email,
      otp,
      new_password: newPassword,
      confirm_password: confirmPassword,
    },
  });
}

/* ---------------- GENERAL ---------------- */

export async function getHealth() {
  return apiRequest("/health");
}

export async function getModels() {
  return apiRequest("/models");
}

/* ---------------- PREDICTION ---------------- */

export async function predictAllModels(inputData) {
  return apiRequest("/predict/all", {
    method: "POST",
    body: inputData,
  });
}

/* ---------------- API CONFIGURATION ---------------- */

export { API_BASE_URL };
/* ---------------- PATIENTS ---------------- */

export async function getPatients() {
  return apiRequest("/patients");
}

export async function getPatient(patientId) {
  return apiRequest(`/patients/${patientId}`);
}

export async function createPatient(patientData) {
  return apiRequest("/patients", {
    method: "POST",
    body: patientData,
  });
}