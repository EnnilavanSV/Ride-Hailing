import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Table } from "@ride/ui";
import ScreenLoader from "../components/ScreenLoader";

const DisputesList = () => {
  const { token } = useContext(AuthContext);
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDisputes();
  }, [token]);

  const fetchDisputes = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "https://ride-hailing-backend-coan.onrender.com/api/admin/disputes",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await response.json();

      if (data.success) {
        setDisputes(data.data);
      } else {
        setError("Failed to fetch disputes.");
      }
    } catch (err) {
      console.error("Fetch Disputes Error:", err);
      setError("An error occurred while fetching disputes.");
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (disputeId) => {
    if (
      !window.confirm("Are you sure you want to mark this dispute as resolved?")
    )
      return;

    setResolvingId(disputeId);
    try {
      const response = await fetch(
        `https://ride-hailing-backend-coan.onrender.com/api/admin/disputes/${disputeId}/resolve`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await response.json();

      if (data.success) {
        // Update the specific dispute's status in the local state so the UI reflects it instantly
        setDisputes((prev) =>
          prev.map((d) =>
            d._id === disputeId
              ? { ...d, status: "resolved", resolvedAt: new Date() }
              : d,
          ),
        );
      } else {
        alert(data.message || "Failed to resolve dispute");
      }
    } catch (err) {
      alert("An error occurred while resolving the dispute.");
    } finally {
      setResolvingId(null);
    }
  };

  // Filter disputes based on search input
  const filteredDisputes = disputes.filter((dispute) => {
    const search = searchTerm.toLowerCase();
    const name = dispute.raisedBy?.name?.toLowerCase() || "";
    const description = dispute.description?.toLowerCase() || "";
    const reason = dispute.reason?.replace("_", " ").toLowerCase() || "";

    return (
      name.includes(search) ||
      description.includes(search) ||
      reason.includes(search)
    );
  });

  // Helper to format the reason nicely
  const formatReason = (reason) => {
    if (!reason) return "Unknown";
    return reason
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Define the columns for the Table
  const disputeColumns = [
    {
      header: "Date",
      accessor: "createdAt",
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-bold">
            {new Date(row.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
          <span className="text-xs text-brand-dark/50 dark:text-brand-beige/50">
            {new Date(row.createdAt).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      ),
    },
    {
      header: "Raised By",
      accessor: "raisedBy",
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-bold text-brand-dark dark:text-brand-beige">
            {row.raisedBy ? row.raisedBy.name : "Unknown"}
          </span>
          <span className="text-[10px] uppercase tracking-widest font-bold text-brand-teal dark:text-brand-mint">
            {row.raisedByModel}
          </span>
        </div>
      ),
    },
    {
      header: "Issue Details",
      accessor: "reason",
      render: (row) => (
        <div className="flex flex-col max-w-xs">
          <span className="font-bold text-red-600 dark:text-red-400 text-sm mb-1">
            {formatReason(row.reason)}
          </span>
          <span
            className="text-xs text-brand-dark/70 dark:text-brand-beige/70 truncate"
            title={row.description}
          >
            {row.description}
          </span>
        </div>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      render: (row) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
            row.status === "resolved"
              ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400"
              : "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400"
          }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      header: "Actions",
      accessor: "actions",
      render: (row) => (
        <div>
          {row.status === "open" ? (
            <button
              onClick={() => handleResolve(row._id)}
              disabled={resolvingId === row._id}
              className="px-4 py-2 bg-brand-teal hover:bg-brand-teal/90 text-white dark:bg-brand-mint dark:hover:bg-brand-mint/90 dark:text-brand-dark text-xs font-bold rounded-lg transition-all shadow-sm active:scale-95 disabled:opacity-50"
            >
              {resolvingId === row._id ? "Resolving..." : "Resolve"}
            </button>
          ) : (
            <span className="text-xs font-bold text-brand-dark/40 dark:text-brand-beige/40">
              Resolved on {new Date(row.resolvedAt).toLocaleDateString()}
            </span>
          )}
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
              Resolution Center
            </h1>
            <p className="text-brand-dark/70 dark:text-brand-beige/70 font-medium mt-1">
              Manage and resolve platform tickets.
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
              placeholder="Search tickets..."
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
          columns={disputeColumns}
          data={filteredDisputes}
          isLoading={loading}
          emptyMessage={
            searchTerm
              ? "No disputes match your search."
              : "No open disputes! Everything is peaceful."
          }
        />
      </ScreenLoader>
      {/* Header & Search Bar */}
    </div>
  );
};

export default DisputesList;
