import React, { useEffect, useState } from "react";

const SearchingDriverPanel = ({ onCancel }) => {
  const [loadingText, setLoadingText] = useState(
    "Connecting to nearby drivers",
  );

  // Simple effect to animate the loading dots
  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingText((prev) => {
        if (prev.endsWith("...")) return "Connecting to nearby drivers";
        return prev + ".";
      });
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute bottom-0 left-0 w-full z-30 p-4 md:p-6 pointer-events-none">
      <div className="max-w-md mx-auto w-full bg-brand-beige dark:bg-brand-dark rounded-2xl shadow-2xl p-6 border border-brand-teal/20 dark:border-brand-mint/20 pointer-events-auto transition-colors duration-300 flex flex-col items-center text-center">
        {/* Radar / Pulse Animation */}
        <div className="relative w-24 h-24 flex items-center justify-center mb-6 mt-4">
          {/* Pulsing rings */}
          <div className="absolute inset-0 rounded-full border-4 border-brand-teal/30 dark:border-brand-mint/30 animate-ping"></div>
          <div className="absolute inset-2 rounded-full border-4 border-brand-teal/50 dark:border-brand-mint/50 animate-pulse"></div>

          {/* Center Car Icon */}
          <div className="relative z-10 w-12 h-12 bg-brand-teal dark:bg-brand-mint rounded-full flex items-center justify-center text-brand-beige dark:text-brand-dark shadow-lg">
            <svg
              className="w-7 h-7"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 16H9m10 0h3v-3.15a1 1 0 00-.84-.99L16 11l-2.7-3.6a2 2 0 00-1.6-.8H9.3a2 2 0 00-1.6.8L5 11l-5.16.86a1 1 0 00-.84.99V16h3m10 0a2 2 0 11-4 0m4 0a2 2 0 10-4 0m-10 0a2 2 0 11-4 0m4 0a2 2 0 10-4 0" />
            </svg>
          </div>
        </div>

        <h2 className="text-xl font-bold text-brand-dark dark:text-brand-beige mb-2">
          Finding your ride
        </h2>

        <p className="text-brand-teal dark:text-brand-mint font-medium h-6 mb-8">
          {loadingText}
        </p>

        {/* Cancel Button */}
        <button
          onClick={onCancel}
          className="w-full py-3 rounded-lg font-bold tracking-wide text-brand-dark dark:text-brand-beige bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
        >
          Cancel Request
        </button>
      </div>
    </div>
  );
};

export default SearchingDriverPanel;
