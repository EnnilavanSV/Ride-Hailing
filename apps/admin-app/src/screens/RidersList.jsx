import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { Card, Table } from "@ride/ui";
import ScreenLoader from "../components/ScreenLoader";

const RidersList = () => {
  const { token } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "https://ride-hailing-backend-coan.onrender.com/api/admin/users",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await response.json();

      if (data.success) {
        setUsers(data.data);
      } else {
        setError("Failed to fetch users.");
      }
    } catch (err) {
      console.error("Fetch Users Error:", err);
      setError("An error occurred while fetching users.");
    } finally {
      setLoading(false);
    }
  };

  // Filter users based on search input (checks name and email)
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Define the columns for our reusable Table component
  const userColumns = [
    { header: "Name", accessor: "name" },
    { header: "Email", accessor: "email" },
    { header: "Phone", accessor: "phone" },
    {
      header: "Joined Date",
      accessor: "createdAt",
      // Custom render to make the date look nice
      render: (row) => {
        const date = new Date(row.createdAt);
        return date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
      },
    },
    {
      header: "Admin Status",
      accessor: "isAdmin",
      // Custom render for a badge
      render: (row) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
            row.isAdmin
              ? "bg-brand-teal/20 text-brand-teal dark:bg-brand-mint/20 dark:text-brand-mint"
              : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
          }`}
        >
          {row.isAdmin ? "Admin" : "Rider"}
        </span>
      ),
    },
    {
      header: "Actions",
      accessor: "actions",
      render: (row) => (
        <Link to={`/rides?userId=${row._id}`}>
          <button className="px-4 py-2 bg-brand-teal/10 hover:bg-brand-teal/20 text-brand-teal dark:bg-brand-mint/10 dark:hover:bg-brand-mint/20 dark:text-brand-mint text-xs font-bold rounded-lg transition-colors shadow-sm active:scale-95">
            View Rides
          </button>
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <ScreenLoader>
        {/* Header & Search Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-brand-teal/10 dark:border-brand-mint/10 pb-6">
          <div>
            <h1 className="text-3xl font-black text-brand-dark dark:text-brand-beige">
              Riders Directory
            </h1>
            <p className="text-brand-dark/70 dark:text-brand-beige/70 font-medium mt-1">
              Manage all registered users on the platform.
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
              placeholder="Search name or email..."
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
          columns={userColumns}
          data={filteredUsers}
          isLoading={loading}
          emptyMessage={
            searchTerm
              ? "No riders match your search."
              : "No riders found on the platform."
          }
        />
      </ScreenLoader>
    </div>
  );
};

export default RidersList;
