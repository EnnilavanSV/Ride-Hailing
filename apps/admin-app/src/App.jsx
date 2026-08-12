import React, { useContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// Context
import { AuthProvider, AuthContext } from "./context/AuthContext";

// Layouts & Components
import AdminLayout from "./layout/AdminLayout";
import FloatingSidebar from "./components/FloatingSidebar";
import Header from "./components/Header";

// Screens
import Login from "./screens/Login";
import Register from "./screens/Register";
import Dashboard from "./screens/Dashboard";
import PendingApproval from "./screens/PendingApproval";
import RidersList from "./screens/RidersList";
import DriversList from "./screens/DriversList";
import RideHistory from "./screens/RideHistory";
import DisputesList from "./screens/DisputesList";
import LiveMap from "./screens/LiveMap";
import Settings from "./screens/Settings";

if (process.env.NODE_ENV === "production") {
  console.log = () => {};
  console.info = () => {};
  console.error = () => {};
  console.warn = () => {};
}

// --- Protected Route Wrapper ---
// This acts as a bouncer. If you aren't authenticated, you go back to login!
// --- Protected Route Wrapper ---
const ProtectedRoute = ({ children }) => {
  // Grab adminUser from context too
  const { isAuthenticated, adminUser, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-brand-beige dark:bg-brand-dark text-brand-teal dark:text-brand-mint">
        <span className="animate-pulse font-bold text-xl">Loading...</span>
      </div>
    );
  }

  // Strictly check BOTH authentication AND admin status
  if (isAuthenticated && adminUser?.isAdmin) {
    return children;
  }

  // If they fail either check, boot them to the login screen
  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* --- Public Auth Routes --- */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* --- Protected Admin Routes --- */}
          {/* Redirect root to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <Dashboard></Dashboard>
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/approvals"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <PendingApproval></PendingApproval>
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <RidersList></RidersList>
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/drivers"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <DriversList></DriversList>
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/rides"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <RideHistory />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/disputes"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <DisputesList />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/map"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <LiveMap />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <Settings />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
