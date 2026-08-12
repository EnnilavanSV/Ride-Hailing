import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { Table } from "@ride/ui";
import ScreenLoader from "../components/ScreenLoader";

const DriversList = () => {
  const { token } = useContext(AuthContext);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDrivers();
  }, [token]);

  const fetchDrivers = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "https://ride-hailing-backend-coan.onrender.com/api/admin/drivers",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await response.json();

      if (data.success) {
        setDrivers(data.data);
      } else {
        setError("Failed to fetch drivers.");
      }
    } catch (err) {
      console.error("Fetch Drivers Error:", err);
      setError("An error occurred while fetching drivers.");
    } finally {
      setLoading(false);
    }
  };

  // Function to toggle suspension status instantly
  const handleToggleStatus = async (driverId, currentStatus) => {
    const newStatus = currentStatus === "suspended" ? "active" : "suspended";

    const confirmMsg =
      newStatus === "suspended"
        ? "Are you sure you want to suspend this driver? They will be forced offline immediately."
        : "Are you sure you want to reactivate this driver's account?";

    if (!window.confirm(confirmMsg)) return;

    try {
      const response = await fetch(
        `https://ride-hailing-backend-coan.onrender.com/api/admin/drivers/${driverId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        },
      );

      const data = await response.json();

      if (data.success) {
        // Instantly update the React state so the UI changes without a refresh
        setDrivers(
          drivers.map((d) =>
            d._id === driverId ? { ...d, status: newStatus } : d,
          ),
        );
      } else {
        alert(data.message || "Failed to update driver status.");
      }
    } catch (err) {
      console.error("Status Update Error:", err);
      alert("Network error occurred.");
    }
  };

  const filteredDrivers = drivers.filter(
    (driver) =>
      driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.phone.toString().includes(searchTerm),
  );

  const driverColumns = [
    { header: "Name", accessor: "name" },
    { header: "Email", accessor: "email" },
    { header: "Phone", accessor: "phone" },
    {
      header: "Vehicle Details",
      accessor: "vehicle",
      render: (row) => {
        if (!row.vehicle || !row.vehicle.licensePlate) {
          return <span className="text-gray-400 italic">Not updated</span>;
        }
        return (
          <div className="flex flex-col">
            <span className="font-bold">
              {row.vehicle.make} {row.vehicle.model}
            </span>
            <span className="text-xs text-brand-dark/60 dark:text-brand-beige/60 uppercase tracking-wider">
              {row.vehicle.licensePlate}
            </span>
          </div>
        );
      },
    },
    {
      header: "Account Status",
      accessor: "status",
      render: (row) => {
        const currentStatus = row.status || "unknown";
        let badgeClasses =
          "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";

        if (currentStatus === "active") {
          badgeClasses =
            "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400";
        } else if (currentStatus === "pending_approval") {
          badgeClasses =
            "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400";
        } else if (
          currentStatus === "rejected" ||
          currentStatus === "suspended"
        ) {
          badgeClasses =
            "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400";
        }

        return (
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${badgeClasses}`}
          >
            {currentStatus.replace("_", " ")}
          </span>
        );
      },
    },
    {
      header: "Actions",
      accessor: "actions",
      render: (row) => (
        <div className="flex items-center gap-2">
          <Link to={`/rides?driverId=${row._id}`}>
            <button className="px-4 py-2 bg-brand-teal/10 hover:bg-brand-teal/20 text-brand-teal dark:bg-brand-mint/10 dark:hover:bg-brand-mint/20 dark:text-brand-mint text-xs font-bold rounded-lg transition-colors shadow-sm active:scale-95">
              View Rides
            </button>
          </Link>

          {/*  Dynamic Suspend / Reactivate Button */}
          <button
            onClick={() => handleToggleStatus(row._id, row.status)}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors shadow-sm active:scale-95 ${
              row.status === "suspended"
                ? "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-500/20 dark:text-green-400 dark:hover:bg-green-500/30"
                : "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-500/20 dark:text-red-400 dark:hover:bg-red-500/30"
            }`}
          >
            {row.status === "suspended" ? "Reactivate" : "Suspend"}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <ScreenLoader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-brand-teal/10 dark:border-brand-mint/10 pb-6">
          <div>
            <h1 className="text-3xl font-black text-brand-dark dark:text-brand-beige">
              Fleet Directory
            </h1>
            <p className="text-brand-dark/70 dark:text-brand-beige/70 font-medium mt-1">
              Manage all drivers and their vehicle statuses.
            </p>
          </div>

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
              placeholder="Search drivers..."
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

        <Table
          columns={driverColumns}
          data={filteredDrivers}
          isLoading={loading}
          emptyMessage={
            searchTerm
              ? "No drivers match your search."
              : "No drivers registered yet."
          }
        />
      </ScreenLoader>
    </div>
  );
};

export default DriversList;
