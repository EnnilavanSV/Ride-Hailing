import React, { useState } from "react";

const RideCompletePanel = ({ onHome, rideData }) => {
  const [rating, setRating] = useState(0);

  // Dynamically pull data from your backend's activeRide state
  const driverName =
    rideData?.driver?.fullname?.firstname ||
    rideData?.driver?.name ||
    "your driver";

  const totalFare = rideData?.fare || 0;

  // Format today's date for the receipt
  const currentDate = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="absolute inset-0 w-full h-full z-40 bg-brand-beige/90 dark:bg-brand-dark/90 backdrop-blur-sm flex flex-col justify-end pointer-events-auto transition-all duration-300">
      <div className="w-full max-w-md mx-auto bg-brand-beige dark:bg-brand-dark rounded-t-3xl shadow-2xl p-6 md:p-8 border-t border-brand-teal/20 dark:border-brand-mint/20 h-auto max-h-[90vh] overflow-y-auto">
        {/* Success Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 bg-brand-teal dark:bg-brand-mint rounded-full flex items-center justify-center text-brand-beige dark:text-brand-dark mb-4 shadow-lg shadow-brand-teal/20">
            <svg
              className="w-8 h-8"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-brand-dark dark:text-brand-beige">
            You have arrived
          </h2>
          <p className="text-brand-dark/70 dark:text-brand-beige/70 font-medium mt-1">
            Hope you enjoyed your ride with {driverName}
          </p>
        </div>

        {/* Rating Stars */}
        <div className="flex justify-center gap-2 mb-8">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              className={`transition-colors duration-200 ${
                rating >= star
                  ? "text-yellow-400"
                  : "text-gray-300 dark:text-gray-600"
              } hover:text-yellow-400`}
            >
              <svg
                className="w-10 h-10"
                viewBox="0 0 24 24"
                fill="currentColor"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
            </button>
          ))}
        </div>

        {/* Receipt Details */}
        <div className="bg-black/5 dark:bg-white/5 rounded-2xl p-5 mb-6">
          <div className="flex justify-between items-center mb-4 pb-4 border-b border-black/10 dark:border-white/10">
            <span className="text-brand-dark/70 dark:text-brand-beige/70 font-medium">
              Total Fare
            </span>
            <span className="text-2xl font-bold text-brand-dark dark:text-brand-beige">
              ₹{Number(totalFare).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm font-medium text-brand-dark/80 dark:text-brand-beige/80 mb-2">
            <span>Date</span>
            <span>{currentDate}</span>
          </div>
          <div className="flex justify-between items-center text-sm font-medium text-brand-dark/80 dark:text-brand-beige/80">
            <span>Paid with</span>
            <span className="flex items-center gap-1">
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                <line x1="1" y1="10" x2="23" y2="10"></line>
              </svg>
              •••• 4242
            </span>
          </div>
        </div>

        {/* Done Button */}
        <button
          onClick={onHome}
          className="w-full py-4 rounded-xl font-bold tracking-wide text-brand-beige dark:text-brand-dark bg-brand-teal dark:bg-brand-mint hover:opacity-90 active:scale-[0.98] transition-all"
        >
          Done
        </button>
      </div>
    </div>
  );
};

export default RideCompletePanel;
