import React, { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { Card } from "@ride/ui";

const Dashboard = () => {
  const { token } = useContext(AuthContext);
  const [stats, setStats] = useState({ users: 0, drivers: 0, rides: 0 });
  const [actionQueue, setActionQueue] = useState({
    pendingDrivers: 0,
    activeRides: 0,
    openDisputes: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const [usersRes, driversRes, ridesRes, queueRes] = await Promise.all([
        fetch(
          "https://ride-hailing-backend-coan.onrender.com/api/admin/users",
          config,
        ),
        fetch(
          "https://ride-hailing-backend-coan.onrender.com/api/admin/drivers",
          config,
        ),
        fetch(
          "https://ride-hailing-backend-coan.onrender.com/api/admin/rides",
          config,
        ),
        fetch(
          "https://ride-hailing-backend-coan.onrender.com/api/admin/action-queue",
          config,
        ),
      ]);

      const usersData = await usersRes.json();
      const driversData = await driversRes.json();
      const ridesData = await ridesRes.json();
      const queueData = await queueRes.json();

      setStats({
        users: usersData.count || 0,
        drivers:
          driversData.activeCount !== undefined
            ? driversData.activeCount
            : driversData.count || 0,
        rides: ridesData.count || 0,
      });

      if (queueData.success) {
        setActionQueue(queueData.data);
      }
    } catch (err) {
      console.error("Dashboard Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchDashboardStats();
  }, [token]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-brand-teal/10 dark:border-brand-mint/10 pb-6">
        <div>
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-linear-to-r from-brand-teal to-brand-dark dark:from-brand-mint dark:to-white">
            Command Center
          </h1>
          <p className="text-brand-dark/70 dark:text-brand-beige/70 font-medium mt-1">
            Live operations and platform health overview.
          </p>
        </div>
        <button
          onClick={fetchDashboardStats}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-brand-dark border border-brand-teal/20 dark:border-brand-mint/20 text-brand-teal dark:text-brand-mint rounded-xl font-bold shadow-sm hover:shadow-md transition-all active:scale-95 disabled:opacity-50"
        >
          <svg
            className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Sync Data
        </button>
      </div>

      {/* Action Queue Section */}
      <div>
        <h2 className="text-sm font-black text-brand-dark/60 dark:text-brand-beige/60 mb-4 uppercase tracking-widest">
          Action Items
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Pending Drivers Card */}
          <div
            className={`relative overflow-hidden p-6 rounded-2xl border-2 transition-all shadow-lg ${
              actionQueue.pendingDrivers > 0
                ? "bg-linear-to-r from-orange-50 to-white border-orange-500/40 dark:from-orange-900/20 dark:to-brand-dark dark:border-orange-500/40"
                : "bg-white border-brand-teal/10 dark:bg-brand-dark dark:border-brand-mint/10"
            }`}
          >
            <div className="relative z-10 flex flex-col h-full justify-between gap-4">
              <div className="flex justify-between items-start">
                <div className="p-3 bg-orange-100 dark:bg-orange-500/20 rounded-xl text-orange-600 dark:text-orange-400">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                {actionQueue.pendingDrivers > 0 && (
                  <span className="flex h-3 w-3 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
                  </span>
                )}
              </div>
              <div>
                <h3
                  className={`text-4xl font-black ${actionQueue.pendingDrivers > 0 ? "text-orange-600 dark:text-orange-400" : "text-brand-dark dark:text-brand-beige"}`}
                >
                  {loading ? "-" : actionQueue.pendingDrivers}
                </h3>
                <p className="text-sm font-bold uppercase tracking-wider text-brand-dark/50 dark:text-brand-beige/50 mt-1">
                  Pending Approvals
                </p>
              </div>
              {actionQueue.pendingDrivers > 0 && (
                <Link to="/approvals" className="mt-2 block w-full">
                  <button className="w-full py-2.5 bg-orange-500 text-white font-bold rounded-xl shadow-md hover:bg-orange-600 active:scale-95 transition-all">
                    Review Queue →
                  </button>
                </Link>
              )}
            </div>
          </div>

          {/* Live Active Trips */}
          <div className="p-6 rounded-2xl bg-linear-to-br from-brand-teal/10 to-white dark:from-brand-mint/10 dark:to-brand-dark border border-brand-teal/20 dark:border-brand-mint/20 shadow-lg flex flex-col justify-between">
            <div className="p-3 bg-brand-teal/20 dark:bg-brand-mint/20 rounded-xl text-brand-teal dark:text-brand-mint w-max mb-4">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-4xl font-black text-brand-dark dark:text-brand-beige">
                {loading ? "-" : actionQueue.activeRides}
              </h3>
              <p className="text-sm font-bold uppercase tracking-wider text-brand-teal dark:text-brand-mint mt-1">
                Live Active Trips
              </p>
            </div>
          </div>

          {/* Open Disputes */}
          <div className="p-6 rounded-2xl bg-linear-to-br from-red-50 to-white dark:from-red-900/20 dark:to-brand-dark border border-red-200 dark:border-red-500/20 shadow-lg flex flex-col justify-between">
            <div className="p-3 bg-red-100 dark:bg-red-500/20 rounded-xl text-red-600 dark:text-red-400 w-max mb-4">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-4xl font-black text-brand-dark dark:text-brand-beige">
                {loading ? "-" : actionQueue.openDisputes}
              </h3>
              <p className="text-sm font-bold uppercase tracking-wider text-red-600 dark:text-red-400 mt-1">
                Open Disputes
              </p>
            </div>
          </div>
        </div>
      </div>

      <hr className="border-brand-teal/10 dark:border-brand-mint/10" />

      {/* Analytics Grid */}
      <div>
        <h2 className="text-sm font-black text-brand-dark/60 dark:text-brand-beige/60 mb-4 uppercase tracking-widest">
          Platform Analytics
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <Card className="hover:-translate-y-1 transition-transform duration-300">
            <div className="flex justify-between items-start mb-4">
              <p className="text-xs font-bold uppercase tracking-wider text-brand-dark/50 dark:text-brand-beige/50">
                Total Riders
              </p>
              <span className="text-xs font-bold text-green-500 bg-green-50 dark:bg-green-500/10 px-2 py-1 rounded-md">
                +12%
              </span>
            </div>
            <h2 className="text-4xl font-black text-brand-dark dark:text-brand-beige">
              {loading ? "..." : stats.users.toLocaleString()}
            </h2>
            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 mt-4">
              <div
                className="bg-brand-teal dark:bg-brand-mint h-1.5 rounded-full"
                style={{ width: "75%" }}
              ></div>
            </div>
          </Card>

          <Card className="hover:-translate-y-1 transition-transform duration-300">
            <div className="flex justify-between items-start mb-4">
              <p className="text-xs font-bold uppercase tracking-wider text-brand-dark/50 dark:text-brand-beige/50">
                Approved Drivers
              </p>
              <span className="text-xs font-bold text-green-500 bg-green-50 dark:bg-green-500/10 px-2 py-1 rounded-md">
                +5%
              </span>
            </div>
            <h2 className="text-4xl font-black text-brand-dark dark:text-brand-beige">
              {loading ? "..." : stats.drivers.toLocaleString()}
            </h2>
            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 mt-4">
              <div
                className="bg-brand-teal dark:bg-brand-mint h-1.5 rounded-full"
                style={{ width: "45%" }}
              ></div>
            </div>
          </Card>

          <Card className="hover:-translate-y-1 transition-transform duration-300">
            <div className="flex justify-between items-start mb-4">
              <p className="text-xs font-bold uppercase tracking-wider text-brand-dark/50 dark:text-brand-beige/50">
                Completed Rides
              </p>
              <span className="text-xs font-bold text-green-500 bg-green-50 dark:bg-green-500/10 px-2 py-1 rounded-md">
                +28%
              </span>
            </div>
            <h2 className="text-4xl font-black text-brand-dark dark:text-brand-beige">
              {loading ? "..." : stats.rides.toLocaleString()}
            </h2>
            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 mt-4">
              <div
                className="bg-brand-teal dark:bg-brand-mint h-1.5 rounded-full"
                style={{ width: "90%" }}
              ></div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
