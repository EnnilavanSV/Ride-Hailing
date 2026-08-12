import React, { useState } from "react";

const OnlineTogglePanel = ({ currentState, setDriverState }) => {
  const isOnline = currentState === "online_idle";
  const [loading, setLoading] = useState(false); // To prevent spam-clicking

  const handleToggle = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const token = localStorage.getItem("driverToken");

      const response = await fetch(
        "https://ride-hailing-backend-coan.onrender.com/api/drivers/duty-status",
        {
          method: "PUT", // Or POST, depending on your route
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (data.success) {
        //  Check the dutyStatus string returned from the backend
        if (data.dutyStatus === "online") {
          setDriverState("online_idle");
        } else {
          setDriverState("offline");
        }
      } else {
        alert(data.message || "Failed to update status.");
      }
    } catch (error) {
      console.error("Error toggling status:", error);
      alert("Network error while updating status.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-brand-beige dark:bg-brand-dark shadow-lg rounded-3xl p-6 w-full flex flex-col items-center gap-4 transition-colors duration-300">
      {/* Status Indicator Text */}
      <h2 className="text-2xl font-extrabold text-brand-dark dark:text-brand-beige text-center">
        {isOnline ? "You're Online" : "You're Offline"}
      </h2>

      <p className="text-sm font-medium text-brand-dark/70 dark:text-brand-beige/70 text-center mb-2">
        {isOnline
          ? "Waiting for ride requests..."
          : "Go online to start receiving rides."}
      </p>

      {/* Massive Toggle Button for Mobile Accessibility */}
      <button
        onClick={handleToggle}
        disabled={loading} // Disable button while loading
        className={`w-full py-4 rounded-xl font-bold text-lg uppercase tracking-wider transition-all duration-300 shadow-md flex justify-center items-center ${
          isOnline
            ? "bg-red-500 hover:bg-red-600 text-white"
            : "bg-brand-teal hover:bg-brand-teal/90 dark:bg-brand-mint dark:hover:bg-brand-mint/90 text-white dark:text-brand-dark"
        } ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
      >
        {loading ? (
          <span className="animate-pulse">UPDATING...</span>
        ) : isOnline ? (
          "GO OFFLINE"
        ) : (
          "GO ONLINE"
        )}
      </button>
    </div>
  );
};

export default OnlineTogglePanel;
