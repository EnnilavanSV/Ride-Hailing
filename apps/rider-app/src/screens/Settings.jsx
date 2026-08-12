import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AppLayout from "../layouts/AppLayout";
import Header from "../components/Header";
import { Card, Button } from "@ride/ui";
import ScreenLoader from "../components/ScreenLoader";

function Settings() {
  const navigate = useNavigate();
  const [user, setUser] = useState({ name: "", phone: "", email: "" });

  const [notifications, setNotifications] = useState({
    push: true,
    email: false,
    sms: true,
  });
  const API_URL = "https://ride-hailing-backend-coan.onrender.com/api/users";
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", email: "", phone: "" });

  // Fetch logged-in user data when component mounts
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        // Fetch fresh data from the backend (This triggers Redis/MongoDB!)
        const response = await axios.get(`${API_URL}/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.success) {
          setUser(response.data.data);
          // Keep local storage synced
          localStorage.setItem("user", JSON.stringify(response.data.data));
        }
      } catch (error) {
        console.error("Failed to fetch profile from backend:", error);
      }
    };

    // OPTIONAL: Keep this here so the UI loads instantly from local storage...
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // ...but then IMMEDIATELY ask the backend for the true, updated data
    fetchProfile();
  }, []);

  const handleEditClick = () => {
    setEditForm({ name: user.name, email: user.email, phone: user.phone });
    setIsEditing(true);
  };

  const handleSaveProfile = async () => {
    try {
      const token = localStorage.getItem("token");

      // Adjust the URL to match your actual backend route setup
      const response = await axios.put(
        `${API_URL}/profile`, // <-- Make sure this matches your route structure!
        editForm,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (response.data.success) {
        const updatedUser = { ...user, ...response.data.data };

        // 1. Update React state to reflect UI instantly
        setUser(updatedUser);

        // 2. Update localStorage so changes persist on refresh
        localStorage.setItem("user", JSON.stringify(updatedUser));

        // 3. Exit edit mode
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
      // You can add a toast notification here to alert the user of failure
    }
  };

  const toggleNotification = (key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSignOut = () => {
    // Clear auth data
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    // Redirect to login page
    navigate("/login");
  };

  return (
    <AppLayout>
      <Header />
      <ScreenLoader>
        <div className="relative flex-1 w-full flex flex-col p-4 sm:p-6 overflow-y-auto bg-brand-beige/30 dark:bg-brand-dark/90 transition-colors duration-300">
          <div className="max-w-3xl mx-auto w-full space-y-6 pb-10">
            {/* UPDATED PAGE HEADER */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-brand-dark dark:text-brand-beige leading-tight">
                Settings
              </h2>
              <p className="text-sm sm:text-base text-brand-teal dark:text-brand-mint mt-1">
                Manage your profile, preferences, and account details.
              </p>
            </div>

            {/* Profile Section */}
            <Card className="space-y-4 shadow-sm bg-white dark:bg-brand-dark">
              <h3 className="text-lg sm:text-xl font-bold text-brand-dark dark:text-brand-beige border-b border-brand-teal/20 dark:border-brand-mint/20 pb-2">
                Profile Information
              </h3>

              {/* UPDATED FLEX WRAPPER: Stacks on mobile, side-by-side on desktop */}
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
                        <p className="text-lg font-bold text-brand-dark dark:text-brand-beige truncate">
                          {user.name || "Loading..."}
                        </p>
                        <p className="text-sm text-brand-teal dark:text-brand-mint/80 truncate">
                          {user.email || "No email provided"}
                        </p>
                        <p className="text-sm text-brand-teal dark:text-brand-mint/80 truncate">
                          {user.phone || "No phone provided"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* UPDATED BUTTON WRAPPER: Full width on mobile */}
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
                Preferences
              </h3>
              <div className="space-y-5 pt-2">
                {/* Push Notifications Toggle */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-semibold text-brand-dark dark:text-brand-beige">
                      Push Notifications
                    </p>
                    <p className="text-xs sm:text-sm text-brand-teal dark:text-brand-mint/80">
                      Receive ride status updates on your device.
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

                {/* SMS Notifications Toggle */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-semibold text-brand-dark dark:text-brand-beige">
                      SMS Alerts
                    </p>
                    <p className="text-xs sm:text-sm text-brand-teal dark:text-brand-mint/80">
                      Get driver details and OTPs via text.
                    </p>
                  </div>
                  <button
                    onClick={() => toggleNotification("sms")}
                    className={`shrink-0 w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none ${notifications.sms ? "bg-brand-teal dark:bg-brand-mint" : "bg-gray-300 dark:bg-gray-600"}`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transform transition-transform duration-300 mt-1 ml-1 ${notifications.sms ? "translate-x-6" : "translate-x-0"}`}
                    />
                  </button>
                </div>
              </div>
            </Card>

            {/* Account Management Section */}
            <Card className="space-y-4 shadow-sm bg-white dark:bg-brand-dark">
              <h3 className="text-lg sm:text-xl font-bold text-red-600 dark:text-red-400 border-b border-red-200 dark:border-red-900/30 pb-2">
                Account
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
                  <span className="font-semibold">Sign Out</span>
                </button>
              </div>
            </Card>
          </div>
        </div>
      </ScreenLoader>
    </AppLayout>
  );
}

export default Settings;
