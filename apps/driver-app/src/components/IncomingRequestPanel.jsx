import React, { useState, useEffect } from "react";

const IncomingRequestPanel = ({ rideData, setDriverState }) => {
  const TIMEOUT_SECONDS = 15;
  const [timeLeft, setTimeLeft] = useState(TIMEOUT_SECONDS);
  const [isAccepting, setIsAccepting] = useState(false); // To prevent double-clicks

  // ---  Countdown Timer & Auto-Decline ---
  useEffect(() => {
    if (timeLeft <= 0) {
      handleDecline();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Calculate width percentage for the animated progress bar
  const progressPercentage = (timeLeft / TIMEOUT_SECONDS) * 100;

  // --- Action Handlers ---
  const handleAccept = async () => {
    if (!rideData?._id || isAccepting) return;
    setIsAccepting(true);

    try {
      const token = localStorage.getItem("driverToken");

      // Call your backend acceptRide controller
      const response = await fetch(
        `https://ride-hailing-backend-coan.onrender.com/api/rides/${rideData._id}/accept`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to accept ride");
      }

      console.log("✅ Ride Accepted Successfully:", result.data);

      // Move driver UI to the next screen
      setDriverState("en_route_pickup");
    } catch (error) {
      console.error("❌ Accept Ride Error:", error.message);
      alert(
        error.message ||
          "This ride was cancelled by the rider or is no longer available.",
      );
      setDriverState("online_idle");
    } finally {
      setIsAccepting(false);
    }
  };

  const handleDecline = () => {
    console.log("❌ Ride Declined / Timed Out");
    // Return driver to idle state so they can receive the next broadcast
    setDriverState("online_idle");
  };

  // Fallback if rendered without payload
  if (!rideData) return null;

  // Safe destructuring with fallback defaults
  const {
    vehicleType = "Ride Standard",
    fare = 0,
    pickupLocation,
    dropoffLocation,
  } = rideData;

  return (
    <div className="bg-brand-beige dark:bg-brand-dark shadow-[0_-10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.3)] rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 w-full flex flex-col gap-2 transition-colors duration-300 pointer-events-auto relative overflow-hidden">
      {/* --- Top Edge Countdown Progress Bar --- */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-brand-dark/10 dark:bg-brand-beige/10">
        <div
          className="h-full bg-brand-teal dark:bg-brand-mint transition-all duration-1000 ease-linear"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* --- Header: Vehicle Type, Timer Badge & Fare --- */}
      <div className="flex items-start justify-between border-b border-brand-teal/10 dark:border-brand-mint/10 pb-4 pt-2 mt-1">
        <div>
          <span className="inline-block px-3 py-1 rounded-full text-[10px] sm:text-xs font-extrabold tracking-wider uppercase bg-brand-teal/20 text-brand-teal dark:bg-brand-mint/20 dark:text-brand-mint mb-1.5">
            {vehicleType}
          </span>
          <p className="text-xs font-bold text-brand-dark/70 dark:text-brand-beige/70">
            New Request •{" "}
            <span className="font-bold text-red-500 dark:text-red-400">
              {timeLeft}s left
            </span>
          </p>
        </div>

        <div className="text-right flex flex-col items-end">
          <span className="text-3xl font-black text-brand-dark dark:text-brand-beige leading-none">
            <span className="text-xl">₹</span>
            {fare}
          </span>
          <p className="text-[10px] font-bold uppercase tracking-wider text-brand-dark/50 dark:text-brand-beige/50 mt-1">
            Est. Earnings
          </p>
        </div>
      </div>

      {/* --- Route Info: Pickup & Dropoff (Matching EnRoute styling) --- */}
      <div className="relative pl-3 space-y-5 py-3">
        {/* Connecting Vertical Line */}
        <div className="absolute left-[19px] top-5 bottom-5 w-0.5 bg-brand-dark/20 dark:bg-brand-beige/20"></div>

        {/* Pickup Address */}
        <div className="flex items-start space-x-4 relative">
          <div className="w-4 h-4 mt-0.5 rounded-full bg-brand-teal dark:bg-brand-mint z-10 shadow-sm ring-4 ring-brand-beige dark:ring-brand-dark"></div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-brand-dark/50 dark:text-brand-beige/50 leading-none mb-1">
              Pickup
            </p>
            <p className="text-sm sm:text-base font-bold text-brand-dark dark:text-brand-beige truncate">
              {pickupLocation?.address ||
                pickupLocation?.name ||
                "Pickup location on map"}
            </p>
          </div>
        </div>

        {/* Dropoff Address */}
        <div className="flex items-start space-x-4 relative">
          <div className="w-4 h-4 mt-0.5 rounded-sm border-2 border-brand-dark dark:border-brand-beige bg-transparent z-10 ring-4 ring-brand-beige dark:ring-brand-dark"></div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-brand-dark/50 dark:text-brand-beige/50 leading-none mb-1">
              Dropoff
            </p>
            <p className="text-sm sm:text-base font-bold text-brand-dark dark:text-brand-beige truncate">
              {dropoffLocation?.address ||
                dropoffLocation?.name ||
                "Dropoff location on map"}
            </p>
          </div>
        </div>
      </div>

      {/* --- Action Buttons (Forced Side-by-Side) --- */}
      <div className="flex flex-row gap-3 pt-2">
        {/* Secondary Button: Decline */}
        <button
          type="button"
          onClick={handleDecline}
          className="w-[35%] py-3.5 rounded-xl font-bold text-[11px] sm:text-xs tracking-wide uppercase border-2 border-red-500/80 text-red-600 hover:bg-red-500/10 dark:border-red-400 dark:text-red-400 dark:hover:bg-red-400/10 transition-all active:scale-[0.98] flex justify-center items-center"
        >
          Decline
        </button>

        {/* Primary Button: Accept */}
        <button
          onClick={handleAccept}
          disabled={isAccepting}
          className="w-[65%] py-3.5 rounded-xl font-bold text-[11px] sm:text-xs tracking-wide uppercase text-white bg-brand-teal hover:bg-brand-teal/90 dark:bg-brand-mint dark:text-brand-dark dark:hover:bg-brand-mint/90 transition-all shadow-md active:scale-[0.98] flex justify-center items-center disabled:opacity-70"
        >
          {isAccepting ? "Accepting..." : `Accept Ride (${timeLeft}s)`}
        </button>
      </div>
    </div>
  );
};

export default IncomingRequestPanel;
