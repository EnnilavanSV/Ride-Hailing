import React from "react";

const TripSummaryPanel = ({ rideData, setDriverState }) => {
  // Extract driver-relevant data safely
  const riderName =
    rideData?.rider?.fullname?.firstname ||
    rideData?.rider?.name ||
    "your rider";

  const earnings = rideData?.fare || 0;

  const handleFinish = () => {
    // Put the driver back on the map, ready for the next ping!
    setDriverState("online_idle");
  };

  return (
    <div className="absolute bottom-0 left-0 w-full z-40 flex flex-col justify-end pointer-events-none transition-all duration-300">
      {/* 
        Changed to rounded-t-3xl on mobile so it sits flush at the bottom.
        Removed the massive p-8 padding and replaced with tighter p-5.
      */}
      <div className="w-full max-w-md mx-auto bg-brand-beige dark:bg-brand-dark rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 sm:p-6 pointer-events-auto flex flex-col gap-4 sm:mb-4 border-t sm:border border-brand-teal/10 dark:border-brand-mint/10">
        {/* Success Header */}
        <div className="flex flex-col items-center text-center mt-2">
          <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center text-white mb-3 shadow-lg shadow-green-500/20">
            <svg
              className="w-7 h-7"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-brand-dark dark:text-brand-beige">
            Trip Completed!
          </h2>
          <p className="text-sm text-brand-dark/70 dark:text-brand-beige/70 font-medium mt-1">
            You successfully dropped off {riderName}
          </p>
        </div>

        {/* Earnings Highlight */}
        <div className="bg-brand-teal/10 dark:bg-brand-mint/10 rounded-2xl p-5 text-center border border-brand-teal/20 dark:border-brand-mint/20">
          <p className="text-[11px] sm:text-xs text-brand-dark/80 dark:text-brand-beige/80 font-bold uppercase tracking-wider mb-1">
            You Earned
          </p>
          <h3 className="text-4xl sm:text-5xl font-black text-brand-teal dark:text-brand-mint leading-none">
            ₹{Number(earnings).toFixed(2)}
          </h3>
        </div>

        {/* Done Button */}
        <button
          onClick={handleFinish}
          className="w-full py-3.5 mt-1 rounded-xl font-bold text-sm sm:text-base uppercase tracking-wider text-white bg-brand-teal hover:bg-brand-teal/90 dark:bg-brand-mint dark:text-brand-dark dark:hover:bg-brand-mint/90 transition-all shadow-md active:scale-[0.98]"
        >
          Find Next Ride
        </button>
      </div>
    </div>
  );
};

export default TripSummaryPanel;
