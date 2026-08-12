import React from "react";

const DriverAcceptedPanel = ({ rideData, onCancel }) => {
  //  Safely extract driver details from the populated backend payload
  const driverObj = rideData?.driver || {};
  const vehicleObj = driverObj.vehicle || {};
  const name = driverObj.name || "Arriving Driver";
  const rating = driverObj.rating || "5.0";
  const trips = driverObj.trips || "1,240"; // Fallback if trips aren't tracked yet
  const vehicle =
    vehicleObj.make && vehicleObj.model
      ? `${vehicleObj.make} ${vehicleObj.model}`
      : vehicleObj.model || "Toyota Prius";
  const plate = vehicleObj.licensePlate || "ABC-1234";
  const eta = "4 mins"; // Can be replaced with dynamic ETA calculations later

  // Handle Native Phone Dialer
  const handleCallDriver = () => {
    if (driverObj.phone) {
      window.open(`tel:${driverObj.phone}`, "_self");
    } else {
      alert("Driver phone number is not available.");
    }
  };

  return (
    <div className="absolute bottom-0 left-0 w-full z-30 p-4 md:p-6 pointer-events-none">
      <div className="max-w-md mx-auto w-full bg-brand-beige dark:bg-brand-dark rounded-2xl shadow-2xl p-5 border border-brand-teal/20 dark:border-brand-mint/20 pointer-events-auto transition-colors duration-300">
        {/* Status Header */}
        <div className="text-center mb-4 pb-4 border-b border-black/10 dark:border-white/10">
          <h2 className="text-lg font-bold text-brand-dark dark:text-brand-beige">
            Driver is on the way
          </h2>
          <p className="text-brand-teal dark:text-brand-mint font-medium">
            Arriving in {eta}
          </p>
        </div>

        {/* Driver & Vehicle Info */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {/* Dynamic Avatar Initials Badge */}
            <div className="w-14 h-14 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center overflow-hidden border-2 border-brand-teal dark:border-brand-mint font-extrabold text-xl text-brand-dark dark:text-brand-beige">
              {name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-bold text-brand-dark dark:text-brand-beige text-lg">
                {name}
              </h3>
              <div className="flex items-center text-sm font-medium text-gray-600 dark:text-gray-400">
                <svg
                  className="w-4 h-4 text-yellow-500 mr-1"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
                {rating} • {trips} trips
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-bold text-xl text-brand-dark dark:text-brand-beige tracking-wider">
              {plate}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 capitalize">
              {vehicle}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mb-4">
          <button
            onClick={handleCallDriver}
            className="flex-1 py-3 rounded-xl flex items-center justify-center gap-2 bg-brand-teal/10 dark:bg-brand-mint/10 text-brand-teal dark:text-brand-mint font-bold hover:bg-brand-teal/20 dark:hover:bg-brand-mint/20 transition-colors cursor-pointer"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            Call
          </button>
          <button
            onClick={() => console.log("Opening messaging with:", name)}
            className="flex-1 py-3 rounded-xl flex items-center justify-center gap-2 bg-brand-teal/10 dark:bg-brand-mint/10 text-brand-teal dark:text-brand-mint font-bold hover:bg-brand-teal/20 dark:hover:bg-brand-mint/20 transition-colors cursor-pointer"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            Message
          </button>
        </div>

        {/* Cancel Button */}
        <button
          onClick={onCancel}
          className="w-full py-2 text-sm font-bold text-red-500 hover:text-red-600 transition-colors mb-2 cursor-pointer"
        >
          Cancel Ride
        </button>
      </div>
    </div>
  );
};

export default DriverAcceptedPanel;
