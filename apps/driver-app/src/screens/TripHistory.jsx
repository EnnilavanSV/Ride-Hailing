import React, { useState, useEffect } from "react";
import AppLayout from "../layout/AppLayout";
import Header from "../components/Header";
import { Card } from "@ride/ui";
import ScreenLoader from "../components/ScreenLoader";

function TripHistory() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem("driverToken");

        const response = await fetch(
          "https://ride-hailing-backend-coan.onrender.com/api/rides/driver/history",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!response.ok) {
          throw new Error("Failed to fetch trip history");
        }

        const jsonResponse = await response.json();

        if (jsonResponse.success) {
          setTrips(jsonResponse.data);
        } else {
          throw new Error("Failed to load data");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Helper for status badge styling (Matched to RideHistory)
  const getStatusBadge = (status) => {
    const baseClasses =
      "px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider inline-block mt-1";

    // Default to 'completed' if status is missing
    const currentStatus = status ? status.toLowerCase() : "completed";

    switch (currentStatus) {
      case "completed":
        return (
          <span
            className={`${baseClasses} bg-brand-teal/20 text-brand-teal dark:bg-brand-mint/20 dark:text-brand-mint`}
          >
            Completed
          </span>
        );
      case "cancelled":
        return (
          <span
            className={`${baseClasses} bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400`}
          >
            Cancelled
          </span>
        );
      case "in_progress":
        return (
          <span
            className={`${baseClasses} bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400`}
          >
            In Progress
          </span>
        );
      default:
        return (
          <span
            className={`${baseClasses} bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300`}
          >
            {currentStatus}
          </span>
        );
    }
  };

  return (
    <AppLayout>
      <Header />
      <ScreenLoader>
        <div className="relative flex-1 w-full flex flex-col p-4 sm:p-6 overflow-y-auto bg-brand-beige/30 dark:bg-brand-dark/90 transition-colors duration-300">
          <div className="max-w-3xl mx-auto w-full space-y-6 pb-10">
            {/* Header Section */}
            <div>
              <h2 className="text-3xl font-bold text-brand-dark dark:text-brand-beige">
                Trip History
              </h2>
              <p className="text-brand-teal dark:text-brand-mint mt-1">
                Review your completed rides and passenger details.
              </p>
            </div>

            {/* Conditional Rendering for Loading/Error/Empty States */}
            {loading ? (
              <div className="flex justify-center items-center py-10">
                <div className="w-8 h-8 border-4 border-brand-teal dark:border-brand-mint border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : error ? (
              <Card className="bg-red-50! border-red-200! dark:bg-red-900/10! dark:border-red-900/30!">
                <p className="text-red-600 dark:text-red-400 text-center font-medium">
                  {error}
                </p>
              </Card>
            ) : trips.length === 0 ? (
              <div className="bg-white dark:bg-brand-dark/50 border border-brand-teal/20 dark:border-brand-mint/20 rounded-2xl p-10 text-center shadow-sm">
                <svg
                  className="w-16 h-16 mx-auto text-brand-teal/30 dark:text-brand-mint/30 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-lg font-bold text-brand-dark dark:text-brand-beige">
                  No trips yet
                </p>
                <p className="text-brand-teal dark:text-brand-mint">
                  You haven't completed any rides.
                </p>
              </div>
            ) : (
              /* Trip List */
              <div className="space-y-4">
                {trips.map((trip) => (
                  <Card
                    key={trip._id}
                    className="hover:shadow-lg transition-shadow duration-200"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-sm text-brand-teal dark:text-brand-mint/80 font-medium mb-1">
                          {formatDate(trip.createdAt)}
                        </p>
                        {getStatusBadge(trip.status)}
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-black text-brand-dark dark:text-brand-beige">
                          ₹{trip.fare?.toFixed(2) || "0.00"}
                        </p>
                      </div>
                    </div>

                    <div className="relative pl-6 space-y-4 pt-2">
                      <div className="absolute left-2.75 top-2 bottom-2 w-0.5 bg-brand-teal/20 dark:bg-brand-mint/20"></div>

                      {/* Pickup */}
                      <div className="relative">
                        <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-brand-teal dark:bg-brand-mint ring-4 ring-white dark:ring-brand-dark"></div>
                        <p className="text-brand-dark dark:text-brand-beige font-medium leading-tight">
                          {trip.pickupLocation?.address || trip.pickupLocation}
                        </p>
                      </div>

                      {/* Dropoff */}
                      <div className="relative">
                        <div className="absolute -left-6 top-1 w-3 h-3 rounded-none bg-brand-dark dark:bg-brand-beige ring-4 ring-white dark:ring-brand-dark"></div>
                        <p className="text-brand-dark dark:text-brand-beige font-medium leading-tight">
                          {trip.dropoffLocation?.address ||
                            trip.dropoffLocation}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-brand-teal/10 dark:border-brand-mint/20 flex flex-col gap-2">
                      {/* Passenger Row */}
                      {trip.rider && (
                        <div className="flex justify-between items-center">
                          <p className="text-sm text-brand-teal dark:text-brand-mint/80 font-medium">
                            Passenger
                          </p>
                          <p className="text-sm font-bold text-brand-dark dark:text-brand-beige">
                            {trip.rider.name}
                          </p>
                        </div>
                      )}

                      <div className="flex justify-between items-center">
                        <p className="text-sm text-brand-teal dark:text-brand-mint/80 font-medium">
                          Ride ID
                        </p>
                        <p className="text-xs font-mono font-bold text-brand-dark/60 dark:text-brand-beige/60">
                          {trip._id}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </ScreenLoader>
    </AppLayout>
  );
}

export default TripHistory;
