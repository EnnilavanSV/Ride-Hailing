import React, { useContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./screens/Login";
import Register from "./screens/Register";
import RideFlow from "./screens/RideFlow";
import Payments from "./screens/Payments";
import RideHistory from "./screens/RideHistory";
import Settings from "./screens/Settings";
import Support from "./screens/Support";
import SavedAddresses from "./screens/SavedAddresses";
import { AuthContext } from "./context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  // We'll replace this with real Auth Context state in the next step
  const { isAuthenticated } = useContext(AuthContext);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Route - Redirects to login if not authenticated */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <RideFlow />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payment"
          element={
            <ProtectedRoute>
              <Payments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <RideHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/support"
          element={
            <ProtectedRoute>
              <Support />
            </ProtectedRoute>
          }
        />
        <Route
          path="/saved-addresses"
          element={
            <ProtectedRoute>
              <SavedAddresses />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
