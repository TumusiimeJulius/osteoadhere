
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  Outlet,
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import Dashboard from "./pages/Dashboard";
import Prediction from "./pages/Prediction";
import PredictionResults from "./pages/PredictionResults";
import Patients from "./pages/Patients";
import PatientDetails from "./pages/PatientDetails";
import Models from "./pages/Models";
import Analytics from "./pages/Analytics";
import Learning from "./pages/Learning";
import Settings from "./pages/Settings";
import SubscriptionNotice from "./pages/SubscriptionNotice";

/* PROTECTED ROUTES */

function ProtectedRoute() {
  const token = localStorage.getItem("access_token");

  return token ? <Outlet /> : <Navigate to="/login" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* DEFAULT ROUTE */}
        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        {/* PUBLIC AUTHENTICATION ROUTES */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />

        {/* PROTECTED APPLICATION ROUTES */}
        <Route element={<ProtectedRoute />}>

          {/* SUBSCRIPTION NOTIFICATION */}
          <Route
            path="/subscription-notice"
            element={<SubscriptionNotice />}
          />

          {/* DASHBOARD */}
          <Route path="/dashboard" element={<Dashboard />} />

          {/* PREDICTIONS */}
          <Route path="/prediction" element={<Prediction />} />

          <Route
            path="/prediction-results"
            element={<PredictionResults />}
          />

          {/* PATIENTS */}
          <Route path="/patients" element={<Patients />} />

          <Route
            path="/patients/:patientId"
            element={<PatientDetails />}
          />

          {/* MACHINE LEARNING MODELS */}
          <Route path="/models" element={<Models />} />

          {/* ANALYTICS */}
          <Route path="/analytics" element={<Analytics />} />

          {/* CONTINUOUS LEARNING */}
          <Route path="/learning" element={<Learning />} />

          {/* SETTINGS */}
          <Route path="/settings" element={<Settings />} />

        </Route>

        {/* UNKNOWN ROUTES */}
        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
