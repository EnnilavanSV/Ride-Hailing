import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Card, Button } from "@ride/ui";
import ScreenLoader from "../components/ScreenLoader";

const PendingApprovals = () => {
  const { token, logout } = useContext(AuthContext);
  const [pendingDrivers, setPendingDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPendingDrivers();
  }, [token]);

  const fetchPendingDrivers = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "https://ride-hailing-backend-coan.onrender.com/api/admin/drivers/pending",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await response.json();
      if (data.success) {
        setPendingDrivers(data.data);
      }
    } catch (err) {
      setError("Failed to load pending approvals.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (driverId) => {
    setProcessingId(driverId);
    try {
      const response = await fetch(
        `https://ride-hailing-backend-coan.onrender.com/api/admin/drivers/${driverId}/approve`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await response.json();

      if (data.success) {
        // Instantly remove the approved driver from the UI list
        setPendingDrivers((prev) =>
          prev.filter((driver) => driver._id !== driverId),
        );
      } else {
        alert(data.message || "Failed to approve driver");
      }
    } catch (err) {
      alert("An error occurred while approving.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (driverId) => {
    // Quick safety check
    if (
      !window.confirm(
        "Are you sure you want to reject this driver's application?",
      )
    )
      return;

    setRejectingId(driverId);
    try {
      const response = await fetch(
        `https://ride-hailing-backend-coan.onrender.com/api/admin/drivers/${driverId}/reject`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await response.json();

      if (data.success) {
        // Remove the rejected driver from the UI list
        setPendingDrivers((prev) =>
          prev.filter((driver) => driver._id !== driverId),
        );
      } else {
        alert(data.message || "Failed to reject driver");
      }
    } catch (err) {
      alert("An error occurred while rejecting.");
    } finally {
      setRejectingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <ScreenLoader>
        <div>
          <h1 className="text-3xl font-black text-brand-dark dark:text-brand-beige">
            Action Queue
          </h1>
          <p className="text-brand-dark/70 dark:text-brand-beige/70 font-medium mt-1">
            Review and approve driver vehicle submissions.
          </p>
        </div>

        {error && (
          <div className="bg-red-100 text-red-600 p-4 rounded-xl font-bold">
            {error}
          </div>
        )}

        {loading ? (
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-4 py-1">
              <div className="h-24 bg-brand-teal/20 dark:bg-brand-mint/20 rounded-xl"></div>
              <div className="h-24 bg-brand-teal/20 dark:bg-brand-mint/20 rounded-xl"></div>
            </div>
          </div>
        ) : pendingDrivers.length === 0 ? (
          <Card className="text-center py-12">
            <div className="w-16 h-16 mx-auto bg-brand-teal/10 dark:bg-brand-mint/10 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-brand-teal dark:text-brand-mint"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-xl font-black text-brand-dark dark:text-brand-beige">
              All caught up!
            </h2>
            <p className="text-brand-dark/70 dark:text-brand-beige/70 mt-2">
              There are no drivers waiting for approval right now.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {pendingDrivers.map((driver) => (
              <Card key={driver._id} className="flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-black text-brand-dark dark:text-brand-beige">
                        {driver.name}
                      </h3>
                      <p className="text-brand-dark/70 dark:text-brand-beige/70 text-sm font-medium">
                        {driver.email} • {driver.phone}
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400 text-xs font-bold uppercase tracking-wider rounded-full">
                      Pending
                    </span>
                  </div>

                  <div className="bg-brand-teal/5 dark:bg-brand-mint/5 p-4 rounded-xl border border-brand-teal/10 dark:border-brand-mint/10 mb-6">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-brand-teal dark:text-brand-mint mb-3">
                      Vehicle Details
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] uppercase font-bold text-brand-dark/50 dark:text-brand-beige/50">
                          Make / Model
                        </p>
                        <p className="font-bold text-brand-dark dark:text-brand-beige">
                          {driver.vehicle?.make} {driver.vehicle?.model}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-brand-dark/50 dark:text-brand-beige/50">
                          Color
                        </p>
                        <p className="font-bold text-brand-dark dark:text-brand-beige">
                          {driver.vehicle?.vehicleColor}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-[10px] uppercase font-bold text-brand-dark/50 dark:text-brand-beige/50">
                          License Plate
                        </p>
                        <div className="inline-block mt-1 px-3 py-1 bg-yellow-100 border border-yellow-400 text-yellow-800 font-mono font-bold rounded shadow-sm text-sm">
                          {driver.vehicle?.licensePlate || "N/A"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    className="!w-1/3"
                    onClick={() => handleReject(driver._id)}
                    disabled={
                      rejectingId === driver._id || processingId === driver._id
                    }
                  >
                    {rejectingId === driver._id ? "..." : "Reject"}
                  </Button>
                  <Button
                    variant="primary"
                    className="!w-2/3"
                    onClick={() => handleApprove(driver._id)}
                    disabled={processingId === driver._id}
                  >
                    {processingId === driver._id
                      ? "Approving..."
                      : "Approve Driver"}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </ScreenLoader>
    </div>
  );
};

export default PendingApprovals;
