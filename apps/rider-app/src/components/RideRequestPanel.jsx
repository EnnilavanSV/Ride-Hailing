import React, { useState } from "react";

const RideRequestPanel = ({ onFindRide, isLoading }) => {
  const [pickup, setPickup] = useState("Current Location");
  const [dropoff, setDropoff] = useState("");

  const handleRequestRide = (e) => {
    e.preventDefault();
    if (dropoff.trim() === "") return;
    if (isLoading) return; // Simple validation

    // Call the function passed from App.jsx instead of just console.logging
    if (onFindRide) {
      onFindRide(pickup, dropoff);
    }
  };

  return (
    <div className="absolute bottom-0 left-0 w-full z-30 p-4 md:p-6 pointer-events-none">
      <div className="max-w-md mx-auto w-full bg-brand-beige dark:bg-brand-dark rounded-2xl shadow-2xl p-5 border border-brand-teal/20 dark:border-brand-mint/20 pointer-events-auto transition-colors duration-300">
        <h2 className="text-xl font-bold text-brand-dark dark:text-brand-beige mb-4">
          Where to?
        </h2>

        <form onSubmit={handleRequestRide} className="flex flex-col gap-4">
          {/* Pickup Input Container */}
          <div className="relative flex items-center">
            <div className="absolute left-3 text-brand-teal dark:text-brand-mint">
              {/* Target / Current Location SVG */}
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </div>
            <input
              type="text"
              value={pickup}
              onChange={(e) => setPickup(e.target.value)}
              placeholder="Enter pickup location"
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/50 dark:bg-black/20 border border-transparent focus:border-brand-teal dark:focus:border-brand-mint focus:outline-none text-brand-dark dark:text-brand-beige placeholder-gray-500 transition-colors"
            />
          </div>

          {/* Vertical Connecting Line (Visual Detail) */}
          <div className="absolute left-7 top-25 bottom-[115px] w-[2px] bg-brand-teal/30 dark:bg-brand-mint/30 hidden sm:block"></div>

          {/* Dropoff Input Container */}
          <div className="relative flex items-center">
            <div className="absolute left-3 text-brand-dark dark:text-brand-beige">
              {/* Map Pin / Destination SVG */}
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <input
              type="text"
              value={dropoff}
              onChange={(e) => setDropoff(e.target.value)}
              placeholder="Search destination"
              required
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/50 dark:bg-black/20 border border-transparent focus:border-brand-teal dark:focus:border-brand-mint focus:outline-none text-brand-dark dark:text-brand-beige placeholder-gray-500 transition-colors"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full mt-2 py-3 rounded-lg font-bold tracking-wide text-brand-beige dark:text-brand-dark bg-brand-teal dark:bg-brand-mint transition-all ${
              isLoading
                ? "opacity-70 cursor-not-allowed"
                : "hover:opacity-90 active:scale-[0.98]"
            }`}
          >
            {isLoading ? "Locating..." : "Find Ride"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RideRequestPanel;
