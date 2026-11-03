
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import Dashboard from "./pages/Dashboard";
import Prediction from "./pages/Prediction";
import Patients from "./pages/Patients";
import PatientDetails from "./pages/PatientDetails";
import Data from "./pages/Data";
import Models from "./pages/Models";
import Analytics from "./pages/Analytics";
import Learning from "./pages/Learning";
import Settings from "./pages/Settings";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* DEFAULT */}
        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        {/* AUTHENTICATION */}
        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/verify-email"
          element={<VerifyEmail />}
        />

        {/* MAIN APPLICATION */}
        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/prediction"
          element={<Prediction />}
        />

        {/* PATIENTS */}
        <Route
          path="/patients"
          element={<Patients />}
        />

        <Route
          path="/patients/:patientId"
          element={<PatientDetails />}
        />

        {/* DATA MANAGEMENT */}
        <Route
          path="/data"
          element={<Data />}
        />

        {/* MACHINE LEARNING MODELS */}
        <Route
          path="/models"
          element={<Models />}
        />

        {/* ANALYTICS */}
        <Route
          path="/analytics"
          element={<Analytics />}
        />

        {/* CONTINUOUS LEARNING */}
        <Route
          path="/learning"
          element={<Learning />}
        />

        {/* SETTINGS */}
        <Route
          path="/settings"
          element={<Settings />}
        />

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
