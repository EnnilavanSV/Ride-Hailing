import React from "react";

const RideInProgressPanel = ({ rideData }) => {
  //  Get the raw address
  const rawAddress =
    rideData?.dropoffLocation?.address ||
    rideData?.dropoffLocation?.name ||
    "your destination";

  // Clean it up: Split by commas and take only the first two parts (e.g. "Kovaipudur, Ward 91")
  // This makes the UI much more legible for the rider.
  const shortAddress = rawAddress.includes(",")
    ? rawAddress.split(",").slice(0, 2).join(",")
    : rawAddress;

  return (
    <div className="absolute bottom-0 left-0 w-full z-30 p-4 md:p-6 pointer-events-none">
      <div className="max-w-md mx-auto w-full bg-brand-beige dark:bg-brand-dark rounded-2xl shadow-2xl p-5 border border-brand-teal/20 dark:border-brand-mint/20 pointer-events-auto transition-colors duration-300">
        {/* Status Header */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-black/10 dark:border-white/10">
          <div className="pr-4 flex-1 min-w-0">
            <h2
              className="text-xl font-bold text-brand-dark dark:text-brand-beige mb-1 truncate block w-full"
              title={rawAddress} // Shows the full address if the user hovers over it
            >
              Heading to {shortAddress}
            </h2>
            <p className="text-brand-teal dark:text-brand-mint font-bold text-xl sm:text-2xl">
              Fare : ₹{rideData?.fare || "N/A"}
            </p>
            <p className="text-brand-teal dark:text-brand-mint font-bold text-xl sm:text-2xl">
              Enjoy your ride
            </p>
          </div>

          <div className="w-12 h-12 rounded-full bg-brand-teal/10 dark:bg-brand-mint/10 flex items-center justify-center text-brand-teal dark:text-brand-mint shrink-0">
            {/* Map Pin SVG */}
            <svg
              className="w-6 h-6"
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
        </div>

        {/* Action Buttons (Share & Safety) */}
        <div className="flex gap-3">
          <button className="flex-1 py-3 rounded-xl flex flex-col items-center justify-center gap-2 bg-black/5 dark:bg-white/5 text-brand-dark dark:text-brand-beige font-semibold hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
            <svg
              className="w-6 h-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="18" cy="5" r="3"></circle>
              <circle cx="6" cy="12" r="3"></circle>
              <circle cx="18" cy="19" r="3"></circle>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
            </svg>
            <span className="text-xs tracking-wide">Share Trip</span>
          </button>

          <button className="flex-1 py-3 rounded-xl flex flex-col items-center justify-center gap-2 bg-red-500/10 text-red-500 font-semibold hover:bg-red-500/20 transition-colors">
            <svg
              className="w-6 h-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            <span className="text-xs tracking-wide">SOS / Safety</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RideInProgressPanel;
