import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

// IMPORTANT: Replace this with your actual backend URL and port
const API_URL = "https://ride-hailing-backend-coan.onrender.com/api/users";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true);

  // Set the default axios header so your backend's 'protect' middleware works
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setLoading(false);
      // Optional: You could fetch the user profile here using the token
    } else {
      delete axios.defaults.headers.common["Authorization"];
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    try {
      // Sends data to your Node.js loginUser controller
      const response = await axios.post(`${API_URL}/login`, {
        email,
        password,
      });

      const { token, ...userData } = response.data.data; // Assumes your backend returns the token and user info

      setToken(token);
      setUser(userData);
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
      console.log("Login Succes");
      return { success: true };
    } catch (error) {
      console.error(
        "Login failed:",
        error.response?.data?.message || error.message,
      );
      return { success: false, message: error.response?.data?.message };
    }
  };

  const register = async (name, email, phone, password) => {
    try {
      // Sends data to your Node.js registerUser controller
      const response = await axios.post(`${API_URL}/register`, {
        name,
        email,
        phone,
        password,
      });

      const { token, ...userData } = response.data.data;

      setToken(token);
      setUser(userData);
      localStorage.setItem("token", token);

      return { success: true };
    } catch (error) {
      console.error(
        "Registration failed:",
        error.response?.data?.message || error.message,
      );
      return { success: false, message: error.response?.data?.message };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
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
