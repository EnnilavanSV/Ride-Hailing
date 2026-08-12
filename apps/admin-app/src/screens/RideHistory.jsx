import React, { useEffect, useState, useContext } from "react";
import { useSearchParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { Table } from "@ride/ui";
import ScreenLoader from "../components/ScreenLoader";

const RideHistory = () => {
  const { token } = useContext(AuthContext);
  const [searchParams] = useSearchParams();

  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");

  // Extract IDs from the URL if we navigated from the Users or Drivers list
  const driverId = searchParams.get("driverId");
  const userId = searchParams.get("userId");

  useEffect(() => {
    fetchRides();
  }, [token, driverId, userId]);

  const fetchRides = async () => {
    setLoading(true);
    try {
      // Build the query string dynamically
      let query = "";
      if (driverId) query = `?driverId=${driverId}`;
      if (userId) query = `?userId=${userId}`;

      const response = await fetch(
        `https://ride-hailing-backend-coan.onrender.com/api/admin/rides${query}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await response.json();

      if (data.success) {
        setRides(data.data);
      } else {
        setError("Failed to fetch rides.");
      }
    } catch (err) {
      console.error("Fetch Rides Error:", err);
      setError("An error occurred while fetching ride history.");
    } finally {
      setLoading(false);
    }
  };

  // Filter rides based on search input (address or status)
  const filteredRides = rides.filter((ride) => {
    const search = searchTerm.toLowerCase();
    const pickup = ride.pickupLocation?.address?.toLowerCase() || "";
    const dropoff = ride.dropoffLocation?.address?.toLowerCase() || "";
    const status = ride.status?.toLowerCase() || "";

    const riderName = ride.rider?.name?.toLowerCase() || "";
    const driverName = ride.driver?.name?.toLowerCase() || "";

    //  Date filter
    const dateStr = new Date(ride.createdAt)
      .toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
      .toLowerCase();

    return (
      pickup.includes(search) ||
      dropoff.includes(search) ||
      status.includes(search) ||
      riderName.includes(search) ||
      driverName.includes(search) ||
      dateStr.includes(search)
    );
  });

  // Define the columns for the Table
  const rideColumns = [
    {
      header: "Date",
      accessor: "createdAt",
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-bold">
            {new Date(row.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
          <span className="text-xs text-brand-dark/50 dark:text-brand-beige/50 uppercase">
            {new Date(row.createdAt).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      ),
    },
    {
      header: "Rider",
      accessor: "rider",
      render: (row) => (
        <span className="font-medium text-brand-dark dark:text-brand-beige">
          {row.rider ? (
            row.rider.name
          ) : (
            <span className="text-gray-400 italic">Unknown</span>
          )}
        </span>
      ),
    },
    {
      header: "Driver",
      accessor: "driver",
      render: (row) => (
        <span className="font-medium text-brand-dark dark:text-brand-beige">
          {row.driver ? (
            row.driver.name
          ) : (
            <span className="text-gray-400 italic">Unassigned</span>
          )}
        </span>
      ),
    },
    {
      header: "Route",
      accessor: "route",
      render: (row) => (
        <div className="flex flex-col gap-1 max-w-xs">
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 rounded-full bg-brand-teal mt-1.5 flex-shrink-0"></div>
            <span
              className="text-xs truncate"
              title={row.pickupLocation?.address}
            >
              {row.pickupLocation?.address || "N/A"}
            </span>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 flex-shrink-0"></div>
            <span
              className="text-xs truncate"
              title={row.dropoffLocation?.address}
            >
              {row.dropoffLocation?.address || "N/A"}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: "Fare",
      accessor: "fare",
      render: (row) => (
        <span className="font-black text-brand-teal dark:text-brand-mint">
          ${row.fare ? row.fare.toFixed(2) : "0.00"}
        </span>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      render: (row) => {
        const status = row.status || "requested";
        let badgeClasses =
          "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";

        if (status === "completed") {
          badgeClasses =
            "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400";
        } else if (status === "in_progress" || status === "accepted") {
          badgeClasses =
            "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400";
        } else if (status === "cancelled") {
          badgeClasses =
            "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400";
        } else if (status === "requested") {
          badgeClasses =
            "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400";
        }

        return (
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${badgeClasses}`}
          >
            {status.replace("_", " ")}
          </span>
        );
      },
    },
  ];

  // Determine the dynamic title
  let headerTitle = "Master Ride Ledger";
  let headerSubtitle = "Complete platform trip history.";
  if (driverId) {
    headerTitle = "Driver Trip History";
    headerSubtitle = "Viewing completed trips for a specific driver.";
  } else if (userId) {
    headerTitle = "Rider Trip History";
    headerSubtitle = "Viewing trip history for a specific rider.";
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <ScreenLoader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-brand-teal/10 dark:border-brand-mint/10 pb-6">
          <div>
            <h1 className="text-3xl font-black text-brand-dark dark:text-brand-beige">
              {headerTitle}
            </h1>
            <p className="text-brand-dark/70 dark:text-brand-beige/70 font-medium mt-1">
              {headerSubtitle}
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="w-5 h-5 text-brand-dark/40 dark:text-brand-beige/40"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search name, address, status, or date..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-brand-teal/20 dark:border-brand-mint/20 bg-white dark:bg-[#081820] text-brand-dark dark:text-brand-beige focus:outline-none focus:border-brand-teal dark:focus:border-brand-mint transition-colors shadow-sm"
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-100 text-red-600 p-4 rounded-xl font-bold">
            {error}
          </div>
        )}

        {/* Reusable Table Component */}
        <Table
          columns={rideColumns}
          data={filteredRides}
          isLoading={loading}
          emptyMessage={
            searchTerm ? "No rides match your search." : "No rides found."
          }
        />
      </ScreenLoader>
      {/* Header & Search Bar */}
    </div>
  );
};

export default RideHistory;
