import React, { useContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthContext } from "./context/AuthContext";

import AppLayout from "./layout/AppLayout";
// --- Auth Screens ---
import Login from "./screens/Login";
import Register from "./screens/Register";
import VehicleSetup from "./screens/VehicleSetup";
import PendingApproval from "./screens/PendingApproval";
import DriverFlow from "./screens/DriverFlow";
import Earnings from "./screens/Earnings";
import TripHistory from "./screens/TripHistory";
import VehicleDocs from "./screens/VehicleDocs";
import Settings from "./screens/Settings";
import Support from "./screens/Support";

// Protected Route Wrapper
const ProtectedRoute = ({ children, allowedStatuses }) => {
  const { driver, loading } = useContext(AuthContext);

  // Show nothing or a global loader while checking auth state
  if (loading) return null;

  // Not logged in? Send to login screen
  if (!driver) return <Navigate to="/login" replace />;

  // NEW LOGIC: If the driver's current status is NOT in the allowed list...
  if (allowedStatuses && !allowedStatuses.includes(driver.status)) {
    // ...we send them exactly where they belong based on their actual status:
    if (driver.status === "pending_documents") {
      return <Navigate to="/vehicle-setup" replace />;
    }
    if (driver.status === "pending_approval") {
      return <Navigate to="/pending-approval" replace />;
    }
    if (driver.status === "active") {
      return <Navigate to="/" replace />;
    }
  }

  // If they are allowed, show them the screen!
  return children;
};

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Onboarding Route */}
        <Route
          path="/vehicle-setup"
          element={
            <ProtectedRoute allowedStatuses={["pending_documents"]}>
              <VehicleSetup />
            </ProtectedRoute>
          }
        />
        {/* Protected Main Dashboard */}
        <Route
          path="/pending-approval"
          element={
            <ProtectedRoute allowedStatuses={["pending_approval"]}>
              <PendingApproval />
            </ProtectedRoute>
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute allowedStatuses={["active"]}>
              <DriverFlow />
            </ProtectedRoute>
          }
        />

        <Route
          path="/earnings"
          element={
            <ProtectedRoute allowedStatuses={["active"]}>
              <Earnings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute allowedStatuses={["active"]}>
              <TripHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vehicle"
          element={
            <ProtectedRoute allowedStatuses={["active"]}>
              <VehicleDocs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute allowedStatuses={["active"]}>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/support"
          element={
            <ProtectedRoute allowedStatuses={["active"]}>
              <Support />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
