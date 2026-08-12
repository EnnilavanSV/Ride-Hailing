import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { Card, Button } from "@ride/ui";
import ScreenLoader from "../components/ScreenLoader";

function AdminSettings() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState({ name: "", phone: "", email: "" });
  const [loading, setLoading] = useState(true);

  const [notifications, setNotifications] = useState({
    push: true,
    emailAlerts: true,
  });

  const API_URL = "https://ride-hailing-backend-coan.onrender.com/api/admin";

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", email: "", phone: "" });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        if (!token) {
          setLoading(false);
          return;
        }

        const response = await axios.get(`${API_URL}/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.success) {
          setAdmin(response.data.data);
          localStorage.setItem(
            "adminProfile",
            JSON.stringify(response.data.data),
          );
        }
      } catch (error) {
        console.error("Failed to fetch admin profile:", error);
      } finally {
        setLoading(false);
      }
    };

    const storedAdmin = localStorage.getItem("adminProfile");
    if (storedAdmin) {
      setAdmin(JSON.parse(storedAdmin));
    }

    fetchProfile();
  }, []);

  const handleEditClick = () => {
    setEditForm({
      name: admin.name,
      email: admin.email,
      phone: admin.phone,
    });
    setIsEditing(true);
  };

  const handleSaveProfile = async () => {
    try {
      const token = localStorage.getItem("adminToken");

      const response = await axios.put(`${API_URL}/profile`, editForm, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        const updatedAdmin = { ...admin, ...response.data.data };
        setAdmin(updatedAdmin);
        localStorage.setItem("adminProfile", JSON.stringify(updatedAdmin));
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  const toggleNotification = (key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSignOut = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminProfile");
    navigate("/login");
  };

  return (
    <div className="relative w-full flex flex-col bg-transparent transition-colors duration-300">
      <ScreenLoader>
        <div className="max-w-3xl mx-auto w-full space-y-6 pb-10">
          {/* PAGE HEADER */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-brand-dark dark:text-brand-beige leading-tight">
              Admin Settings
            </h2>
            <p className="text-sm sm:text-base text-brand-teal dark:text-brand-mint mt-1">
              Manage your system preferences and administrator profile.
            </p>
          </div>

          {/* Profile Section */}
          <Card className="space-y-4 shadow-sm bg-white dark:bg-brand-dark">
            <h3 className="text-lg sm:text-xl font-bold text-brand-dark dark:text-brand-beige border-b border-brand-teal/20 dark:border-brand-mint/20 pb-2">
              Profile Information
            </h3>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
              <div className="flex items-start sm:items-center space-x-4 w-full">
                {/* Avatar Placeholder */}
                <div className="w-16 h-16 shrink-0 rounded-full bg-brand-teal/20 dark:bg-brand-mint/20 flex items-center justify-center text-brand-teal dark:text-brand-mint">
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>

                <div className="flex-1 min-w-0">
                  {isEditing ? (
                    <div className="space-y-3 w-full">
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) =>
                          setEditForm({ ...editForm, name: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-lg bg-transparent border border-brand-teal/30 text-brand-dark dark:text-brand-beige focus:outline-none focus:ring-2 focus:ring-brand-teal/50"
                        placeholder="Name"
                      />
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) =>
                          setEditForm({ ...editForm, email: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-lg bg-transparent border border-brand-teal/30 text-brand-dark dark:text-brand-beige focus:outline-none focus:ring-2 focus:ring-brand-teal/50"
                        placeholder="Email"
                      />
                      <input
                        type="tel"
                        value={editForm.phone}
                        onChange={(e) =>
                          setEditForm({ ...editForm, phone: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-lg bg-transparent border border-brand-teal/30 text-brand-dark dark:text-brand-beige focus:outline-none focus:ring-2 focus:ring-brand-teal/50"
                        placeholder="Phone Number"
                      />
                    </div>
                  ) : (
                    <div className="overflow-hidden">
                      <p className="text-lg font-bold text-brand-dark dark:text-brand-beige truncate flex items-center gap-2">
                        {admin.name || "Loading..."}
                        <span className="bg-brand-teal/10 text-brand-teal dark:bg-brand-mint/10 dark:text-brand-mint text-[10px] uppercase px-2 py-0.5 rounded-full font-bold shrink-0">
                          Root
                        </span>
                      </p>
                      <p className="text-sm text-brand-teal dark:text-brand-mint/80 truncate">
                        {admin.email || "No email provided"}
                      </p>
                      <p className="text-sm text-brand-teal dark:text-brand-mint/80 truncate">
                        {admin.phone || "No phone provided"}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-row space-x-2 w-full sm:w-auto pt-2 sm:pt-0">
                {isEditing ? (
                  <>
                    <Button
                      onClick={() => setIsEditing(false)}
                      className="w-1/2 sm:w-auto bg-transparent! border-2! border-gray-400! text-gray-500! hover:bg-gray-400/10! font-semibold px-4 py-2 rounded-lg transition-colors flex justify-center items-center"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSaveProfile}
                      className="w-1/2 sm:w-auto bg-brand-teal! dark:bg-brand-mint! text-white! dark:text-brand-dark! font-semibold px-4 py-2 rounded-lg transition-colors flex justify-center items-center"
                    >
                      Save
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={handleEditClick}
                    className="w-full sm:w-auto bg-transparent! border-2! border-brand-teal! dark:border-brand-mint! text-brand-teal! dark:text-brand-mint! hover:bg-brand-teal/10! dark:hover:bg-brand-mint/10! font-semibold px-6 py-2 rounded-lg transition-colors flex justify-center items-center"
                  >
                    Edit
                  </Button>
                )}
              </div>
            </div>
          </Card>

          {/* Preferences Section */}
          <Card className="space-y-4 shadow-sm bg-white dark:bg-brand-dark">
            <h3 className="text-lg sm:text-xl font-bold text-brand-dark dark:text-brand-beige border-b border-brand-teal/20 dark:border-brand-mint/20 pb-2">
              System Preferences
            </h3>
            <div className="space-y-5 pt-2">
              {/* Push Notifications Toggle */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <p className="font-semibold text-brand-dark dark:text-brand-beige">
                    Critical Alerts
                  </p>
                  <p className="text-xs sm:text-sm text-brand-teal dark:text-brand-mint/80">
                    Receive push notifications for system downtime or high
                    dispute volumes.
                  </p>
                </div>
                <button
                  onClick={() => toggleNotification("push")}
                  className={`shrink-0 w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none ${notifications.push ? "bg-brand-teal dark:bg-brand-mint" : "bg-gray-300 dark:bg-gray-600"}`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transform transition-transform duration-300 mt-1 ml-1 ${notifications.push ? "translate-x-6" : "translate-x-0"}`}
                  />
                </button>
              </div>

              {/* Email Notifications Toggle */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <p className="font-semibold text-brand-dark dark:text-brand-beige">
                    Daily Email Reports
                  </p>
                  <p className="text-xs sm:text-sm text-brand-teal dark:text-brand-mint/80">
                    Get a summary of daily revenue and new driver registrations.
                  </p>
                </div>
                <button
                  onClick={() => toggleNotification("emailAlerts")}
                  className={`shrink-0 w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none ${notifications.emailAlerts ? "bg-brand-teal dark:bg-brand-mint" : "bg-gray-300 dark:bg-gray-600"}`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transform transition-transform duration-300 mt-1 ml-1 ${notifications.emailAlerts ? "translate-x-6" : "translate-x-0"}`}
                  />
                </button>
              </div>
            </div>
          </Card>

          {/* Account Management Section */}
          <Card className="space-y-4 shadow-sm bg-white dark:bg-brand-dark">
            <h3 className="text-lg sm:text-xl font-bold text-red-600 dark:text-red-400 border-b border-red-200 dark:border-red-900/30 pb-2">
              Account Security
            </h3>
            <div className="flex flex-col space-y-3 pt-2">
              <button
                onClick={handleSignOut}
                className="flex items-center justify-center sm:justify-start space-x-2 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-colors w-full text-center sm:text-left p-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 border border-red-100 dark:border-red-900/30 sm:border-none"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                <span className="font-semibold">Secure Sign Out</span>
              </button>
            </div>
          </Card>
        </div>
      </ScreenLoader>
    </div>
  );
}

export default AdminSettings;
