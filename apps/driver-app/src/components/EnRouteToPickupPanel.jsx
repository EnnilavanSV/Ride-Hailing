import React, { useState } from "react";
import { Card, Button } from "@ride/ui";
import { AuthContext } from "../context/AuthContext";

const EnRouteToPickupPanel = ({
  rideData,
  setDriverState,
  setCurrentRideData,
}) => {
  const [showDetails, setShowDetails] = useState(false);

  const rider = rideData?.rider || {};
  const riderName = rider.name || rideData?.riderName || "Rider";
  const riderPhone = rider.phone || rideData?.riderPhone || "";
  const riderRating = rider.rating || "5.0";

  const {
    pickupLocation = { address: "Pickup location on map" },
    dropoffLocation = { address: "Dropoff location on map" },
    vehicleType = "Ride Standard",
    fare = 0,
  } = rideData || {};

  const estMinutes = 6;
  const estKm = 2.4;
  const token = localStorage.getItem("driverToken");

  const handleArrived = async () => {
    try {
      const response = await fetch(
        `https://ride-hailing-backend-coan.onrender.com/api/rides/${rideData._id}/start`,
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
        throw new Error(result.message || "Failed to start ride");

      console.log("✅ Driver arrived, ride officially started!", result.data);

      if (setCurrentRideData) setCurrentRideData(result.data);
      setDriverState("active_trip");
    } catch (error) {
      console.error("Error starting the ride:", error);
      alert(error.message);
    }
  };

  const handleDriverCancel = async () => {
    try {
      const response = await fetch(
        `https://ride-hailing-backend-coan.onrender.com/api/rides/${rideData._id}/driver-cancel`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Failed to cancel");

      console.log("✅ Driver cancelled successfully");

      if (setCurrentRideData) setCurrentRideData(null);
      setDriverState("online_idle");
    } catch (error) {
      console.error("Cancel failed:", error);
      alert(error.message);
    }
  };

  const openNavigation = () => {
    const query = encodeURIComponent(
      pickupLocation?.address || pickupLocation?.name || "Coimbatore",
    );
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${query}`,
      "_blank",
    );
  };

  const handleCallRider = () => {
    if (riderPhone) {
      window.open(`tel:${riderPhone}`, "_self");
    } else {
      alert("Rider phone number is not available.");
    }
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

      {/* --- Top Bar: Status Banner & ETA --- */}
      <div className="flex items-start justify-between border-b border-brand-teal/10 dark:border-brand-mint/10 pb-3">
        <div>
          <span className="inline-block px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wider uppercase bg-brand-teal/20 text-brand-teal dark:bg-brand-mint/20 dark:text-brand-mint mb-1.5">
            En Route to Pickup
          </span>
          <p className="text-sm font-bold text-brand-dark dark:text-brand-beige">
            {vehicleType} •{" "}
            <span className="text-brand-teal dark:text-brand-mint">
              ₹{fare}
            </span>
          </p>
        </div>

        <div className="text-right flex flex-col items-end">
          <span className="text-2xl font-black text-brand-dark dark:text-brand-beige leading-none">
            {estMinutes} <span className="text-lg">min</span>
          </span>
          <p className="text-[10px] font-bold uppercase tracking-wider text-brand-dark/50 dark:text-brand-beige/50 mt-1">
            {estKm} km away
          </p>
        </div>
      </div>

      {/* --- Rider Info & Communication --- */}
      <div className="flex items-center justify-between bg-white/60 dark:bg-white/5 p-3 rounded-2xl shadow-sm border border-brand-teal/10 dark:border-brand-mint/10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-brand-teal dark:bg-brand-mint text-white dark:text-brand-dark flex items-center justify-center font-black text-lg shadow-sm">
            {riderName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-bold text-brand-dark dark:text-brand-beige leading-tight">
              {riderName}
            </p>
            <p className="text-[10px] text-brand-dark/50 dark:text-brand-beige/50 font-bold mt-0.5">
              ⭐ {riderRating} Rating
            </p>
          </div>
        </div>

        <div className="flex space-x-2">
          <button
            type="button"
            onClick={handleCallRider}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-brand-teal/10 text-brand-teal dark:bg-brand-mint/10 dark:text-brand-mint hover:bg-brand-teal/20 dark:hover:bg-brand-mint/20 transition-colors active:scale-95"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => console.log("Opening chat with:", riderName)}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-brand-teal/10 text-brand-teal dark:bg-brand-mint/10 dark:text-brand-mint hover:bg-brand-teal/20 dark:hover:bg-brand-mint/20 transition-colors active:scale-95"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
          </button>
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

      {/* --- Route Addresses & Cancel (HIDDEN BY DEFAULT) --- */}
      {showDetails && (
        <div className="relative pl-3 space-y-4 py-2 border-t border-brand-teal/10 dark:border-brand-mint/10 mt-1 animate-in fade-in duration-200">
          <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-brand-dark/20 dark:bg-brand-beige/20"></div>

          <div className="flex items-start space-x-4 relative">
            <div className="w-3.5 h-3.5 mt-0.5 rounded-full bg-brand-teal dark:bg-brand-mint z-10 ring-4 ring-brand-beige dark:ring-brand-dark"></div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-brand-dark/50 dark:text-brand-beige/50 leading-none mb-1">
                Pickup
              </p>
              <p className="text-sm font-bold text-brand-dark dark:text-brand-beige truncate">
                {pickupLocation?.address ||
                  pickupLocation?.name ||
                  "Pickup location on map"}
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4 relative opacity-75">
            <div className="w-3.5 h-3.5 mt-0.5 rounded-sm border-2 border-brand-dark dark:border-brand-beige bg-transparent z-10 ring-4 ring-brand-beige dark:ring-brand-dark"></div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-brand-dark/50 dark:text-brand-beige/50 leading-none mb-1">
                Dropoff Preview
              </p>
              <p className="text-xs font-medium text-brand-dark/70 dark:text-brand-beige/70 truncate">
                {dropoffLocation?.address ||
                  dropoffLocation?.name ||
                  "Dropoff location on map"}
              </p>
            </div>
          </div>

          <div className="text-center pt-3 border-t border-brand-teal/10 dark:border-brand-mint/10">
            <button
              type="button"
              onClick={handleDriverCancel}
              className="text-[10px] font-bold text-red-500 hover:text-red-600 dark:text-red-400 transition-colors uppercase tracking-wider p-2"
            >
              Cancel Pickup
            </button>
          </div>
        </div>
      )}

      {/* --- Primary Actions (Forced Side-by-Side) --- */}
      <div className="flex flex-row gap-2 pt-1">
        <button
          onClick={openNavigation}
          className="w-[35%] py-3 rounded-xl font-bold text-[11px] sm:text-xs tracking-wide uppercase border-2 border-brand-teal text-brand-teal hover:bg-brand-teal/10 dark:border-brand-mint dark:text-brand-mint dark:hover:bg-brand-mint/10 transition-all active:scale-[0.98]"
        >
          🧭 Navigate
        </button>

        <button
          onClick={handleArrived}
          className="w-[65%] py-3 rounded-xl font-bold text-[11px] sm:text-xs tracking-wide uppercase text-white bg-brand-teal hover:bg-brand-teal/90 dark:bg-brand-mint dark:text-brand-dark dark:hover:bg-brand-mint/90 transition-all shadow-md active:scale-[0.98]"
        >
          Arrived at Pickup
        </button>
      </div>
    </div>
  );
};

export default EnRouteToPickupPanel;
