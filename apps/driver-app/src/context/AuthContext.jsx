import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

// Pointing to the DRIVER API
const API_URL = "https://ride-hailing-backend-coan.onrender.com/api/drivers";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [driver, setDriver] = useState(
    JSON.parse(localStorage.getItem("driver")) || null,
  );
  const [token, setToken] = useState(
    localStorage.getItem("driverToken") || null,
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

      const { token, ...driverData } = response.data.data;

      setToken(token);
      setDriver(driverData);
      localStorage.setItem("driverToken", token);
      localStorage.setItem("driver", JSON.stringify(driverData));

      return { success: true, status: driverData.status };
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

      const { token, ...driverData } = response.data.data;

      setToken(token);
      setDriver(driverData);
      localStorage.setItem("driverToken", token);
      localStorage.setItem("driver", JSON.stringify(driverData));

      return { success: true, status: driverData.status }; // Passes back the 'pending_documents' status
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Registration failed",
      };
    }
  };

  const logout = () => {
    setToken(null);
    setDriver(null);
    localStorage.removeItem("driverToken");
    localStorage.removeItem("driver");
  };

  const updateDriver = (updatedFields) => {
    setDriver((prevDriver) => {
      const newDriverData = { ...prevDriver, ...updatedFields };
      // Overwrite the old localStorage data with the new merged data
      localStorage.setItem("driver", JSON.stringify(newDriverData));
      return newDriverData;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        driver,
        token,
        isAuthenticated: !!token,
        login,
        register,
        logout,
        updateDriver,
        loading,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};
