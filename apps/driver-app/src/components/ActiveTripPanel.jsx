import React, { useState } from "react";
import { Card, Button } from "@ride/ui"; // Adjust if your imports differ

const ActiveTripPanel = ({ rideData, setDriverState }) => {
  const [showDetails, setShowDetails] = useState(false);

  //  Extract necessary details
  const riderName = rideData?.rider?.name || "Rider";
  const dropoffLocation = rideData?.dropoffLocation || {
    address: "Dropoff location on map",
  };
  const fare = rideData?.fare || 0;

  const token = localStorage.getItem("driverToken");

  // --- Action Handlers ---
  const handleCompleteTrip = async () => {
    try {
      // Hit your existing completeRide controller
      const response = await fetch(
        `https://ride-hailing-backend-coan.onrender.com/api/rides/${rideData._id}/complete`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      const result = await response.json();
      if (!response.ok)
        throw new Error(result.message || "Failed to complete trip");

      console.log("✅ Trip officially completed!");

      // Transition the driver UI to the summary screen
      setDriverState("trip_complete");
    } catch (error) {
      console.error("Error completing the trip:", error);
      alert(error.message);
    }
  };

  const openNavigation = () => {
    const query = encodeURIComponent(
      dropoffLocation?.address || dropoffLocation?.name || "Dropoff",
    );
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${query}`,
      "_blank",
    );
  };

  return (
    <div className="bg-brand-beige dark:bg-brand-dark shadow-2xl rounded-t-3xl sm:rounded-3xl p-4 w-full flex flex-col gap-3 transition-all duration-300 pointer-events-auto">
      {/* --- Drag Handle (Mobile visual cue) --- */}
      <div
        className="w-full flex justify-center py-1 cursor-pointer"
        onClick={() => setShowDetails(!showDetails)}
      >
        <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
      </div>

      {/* --- Top Bar: Status Banner & Fare --- */}
      <div className="flex items-start justify-between border-b border-brand-teal/10 dark:border-brand-mint/10 pb-3">
        <div>
          <span className="inline-block px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wider uppercase bg-green-500/20 text-green-700 dark:bg-green-400/20 dark:text-green-400 mb-1.5">
            Trip in Progress
          </span>
          <p className="text-sm font-bold text-brand-dark dark:text-brand-beige">
            Driving {riderName} to destination
          </p>
        </div>

        <div className="text-right flex flex-col items-end">
          <span className="text-2xl font-black text-brand-dark dark:text-brand-beige leading-none">
            <span className="text-lg">₹</span>
            {fare}
          </span>
          <p className="text-[10px] font-bold uppercase tracking-wider text-brand-dark/50 dark:text-brand-beige/50 mt-1">
            Est. Fare
          </p>
        </div>
      </div>

      {/* --- Expand/Collapse Toggle --- */}
      <div className="text-center -my-1">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-[10px] font-bold uppercase tracking-wider text-brand-teal dark:text-brand-mint py-1 px-4 rounded-full hover:bg-brand-teal/5 dark:hover:bg-brand-mint/5 transition-colors"
        >
          {showDetails ? "▲ Hide Details" : "▼ Show Details"}
        </button>
      </div>

      {/* --- Dropoff Address (HIDDEN BY DEFAULT) --- */}
      {showDetails && (
        <div className="flex items-start space-x-4 bg-white/60 dark:bg-white/5 p-3 rounded-2xl shadow-sm border border-brand-teal/10 dark:border-brand-mint/10 animate-in fade-in duration-200 mt-1">
          {/* Dropoff Square Icon */}
          <div className="w-3.5 h-3.5 mt-0.5 rounded-sm border-2 border-brand-dark dark:border-brand-beige bg-transparent shrink-0 ring-4 ring-brand-beige dark:ring-brand-dark"></div>

          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-brand-dark/50 dark:text-brand-beige/50 leading-none mb-1">
              Dropoff Point
            </p>
            <p className="text-sm font-bold text-brand-dark dark:text-brand-beige break-words">
              {dropoffLocation?.address ||
                dropoffLocation?.name ||
                "Dropoff location on map"}
            </p>
          </div>
        </div>
      )}

      {/* --- Primary Actions (Forced Side-by-Side) --- */}
      <div className="flex flex-row gap-2 pt-1">
        {/* Secondary Button: Navigate */}
        <button
          onClick={openNavigation}
          className="w-[35%] py-3 rounded-xl font-bold text-[11px] sm:text-xs tracking-wide uppercase border-2 border-brand-teal text-brand-teal hover:bg-brand-teal/10 dark:border-brand-mint dark:text-brand-mint dark:hover:bg-brand-mint/10 transition-all active:scale-[0.98]"
        >
          🧭 Navigate
        </button>

        {/* Primary Button: Complete Trip */}
        <button
          onClick={handleCompleteTrip}
          className="w-[65%] py-3 rounded-xl font-bold text-[11px] sm:text-xs tracking-wide uppercase text-white bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 transition-all shadow-md active:scale-[0.98]"
        >
          Complete Trip
        </button>
      </div>
    </div>
  );
};

export default ActiveTripPanel;
