import React, { useState, useEffect } from "react";
import {
  calculateDistance,
  generateRideOptions,
  formatCurrency,
} from "@ride/utils";

const RideOptionsPanel = ({
  onBack,
  onConfirm,
  pickupLocation,
  dropoffLocation,
}) => {
  const [selectedRide, setSelectedRide] = useState(null);
  const [rideOptions, setRideOptions] = useState([]);

  useEffect(() => {
    // Ensure we have valid coordinates before calculating
    if (pickupLocation?.lat && dropoffLocation?.lat) {
      const distance = calculateDistance(
        pickupLocation.lat,
        pickupLocation.lng,
        dropoffLocation.lat,
        dropoffLocation.lng,
      );

      const dynamicOptions = generateRideOptions(distance);
      setRideOptions(dynamicOptions);
      setSelectedRide(dynamicOptions[0]); // Default to standard
    }
  }, [pickupLocation, dropoffLocation]);

  return (
    <div className="absolute bottom-0 left-0 w-full z-30 p-4 md:p-6 pointer-events-none">
      <div className="max-w-md mx-auto w-full bg-brand-beige dark:bg-brand-dark rounded-3xl shadow-2xl p-5 border border-brand-teal/20 dark:border-brand-mint/20 pointer-events-auto transition-colors duration-300">
        {/* Header with Back Button */}
        <div className="flex items-center mb-4">
          <button
            onClick={onBack}
            className="p-1 -ml-1 mr-2 text-brand-dark dark:text-brand-beige hover:text-brand-teal dark:hover:text-brand-mint transition-colors"
            aria-label="Go Back"
          >
            {/* Raw SVG Back Arrow */}
            <svg
              className="w-6 h-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          </button>
          <h2 className="text-xl font-bold text-brand-dark dark:text-brand-beige">
            Choose a ride
          </h2>
        </div>

        {/* Ride Options List */}
        <div className="flex flex-col gap-3 mb-4 max-h-[40vh] overflow-y-auto pr-1">
          {rideOptions.map((option) => (
            <div
              key={option.id}
              onClick={() => setSelectedRide(option)}
              className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer border-2 transition-all ${
                selectedRide?.id === option.id
                  ? "border-brand-teal bg-brand-teal/10 dark:border-brand-mint dark:bg-brand-mint/20 shadow-sm"
                  : "border-transparent bg-white/60 hover:bg-white dark:bg-[#0A2E3D]/60 dark:hover:bg-[#0A2E3D]"
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white dark:bg-[#06202B] shadow-sm dark:shadow-none rounded-full flex items-center justify-center text-xl">
                  🚗
                </div>
                <div>
                  <div className="font-bold text-lg text-brand-dark dark:text-brand-beige flex items-center gap-2">
                    {option.name}{" "}
                    <span className="text-sm font-normal text-brand-dark/50 dark:text-brand-beige/50">
                      👤 {option.capacity}
                    </span>
                  </div>
                  <div className="text-sm font-medium text-brand-teal dark:text-brand-mint">
                    {option.time}
                  </div>
                </div>
              </div>
              {/* Using your formatCurrency function to display rupees */}
              <div className="text-xl font-bold text-brand-dark dark:text-brand-beige">
                {formatCurrency(option.price)}
              </div>
            </div>
          ))}
        </div>

        {/* Confirm Button */}
        <button
          onClick={() => onConfirm(selectedRide)}
          className="w-full py-4 rounded-xl font-bold text-lg tracking-wide text-brand-beige dark:text-brand-dark bg-brand-teal dark:bg-brand-mint hover:opacity-90 active:scale-[0.98] transition-all shadow-md"
        >
          Confirm {selectedRide?.name}
        </button>
      </div>
    </div>
  );
};

export default RideOptionsPanel;
