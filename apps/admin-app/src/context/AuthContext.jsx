import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

// Pointing to the USER API (Admins are just Users with the isAdmin flag)
const API_URL = "https://ride-hailing-backend-coan.onrender.com/api/users";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [adminUser, setAdminUser] = useState(
    JSON.parse(localStorage.getItem("adminUser")) || null,
  );
  const [token, setToken] = useState(
    localStorage.getItem("adminToken") || null,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setLoading(false);
    } else {
      delete axios.defaults.headers.common["Authorization"];
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/login`, {
        email,
        password,
      });

      const { token, ...userData } = response.data.data;

      if (!userData.isAdmin) {
        return {
          success: false,
          message: "Access Denied: Admin privileges required.",
        };
      }

      setToken(token);
      setAdminUser(userData);
      localStorage.setItem("adminToken", token);
      localStorage.setItem("adminUser", JSON.stringify(userData));

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
      };
    }
  };

  const register = async (name, email, phone, password) => {
    try {
      const response = await axios.post(`${API_URL}/register`, {
        name,
        email,
        phone,
        password,
      });

      // Note: We don't automatically log them in here because they need their
      // 'isAdmin' flag flipped in the DB before they can access the dashboard.
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Registration failed",
      };
    }
  };

  const logout = () => {
    setToken(null);
    setAdminUser(null);
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
  };

  return (
    <AuthContext.Provider
      value={{
        adminUser,
        token,
        isAuthenticated: !!token,
        login,
        register,
        logout,
        loading,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};
