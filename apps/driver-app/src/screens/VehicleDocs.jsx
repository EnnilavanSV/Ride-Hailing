import React, { useState, useEffect } from "react";
import AppLayout from "../layout/AppLayout";
import Header from "../components/Header";
import { Card } from "@ride/ui";
import ScreenLoader from "../components/ScreenLoader";

function VehicleDocs() {
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDriverProfile = async () => {
      try {
        const token = localStorage.getItem("driverToken");

        // Assuming you have a route that returns the driver's own profile based on the JWT
        const response = await fetch(
          "https://ride-hailing-backend-coan.onrender.com/api/drivers/profile",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!response.ok) {
          throw new Error("Failed to fetch vehicle and document data");
        }

        const jsonResponse = await response.json();

        if (jsonResponse.success) {
          setDriver(jsonResponse.data);
        } else {
          throw new Error("Failed to load data");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDriverProfile();
  }, []);

  // Helper to render the appropriate status badge styling
  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return (
          <span className="px-4 py-1.5 text-sm font-bold rounded-full uppercase tracking-wider bg-brand-teal/20 text-brand-teal dark:bg-brand-mint/20 dark:text-brand-mint">
            Active & Verified
          </span>
        );
      case "pending_approval":
        return (
          <span className="px-4 py-1.5 text-sm font-bold rounded-full uppercase tracking-wider bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
            Pending Approval
          </span>
        );
      case "pending_documents":
      default:
        return (
          <span className="px-4 py-1.5 text-sm font-bold rounded-full uppercase tracking-wider bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
            Documents Required
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
                Vehicle & Documents
              </h2>
              <p className="text-brand-teal dark:text-brand-mint mt-1">
                Manage your vehicle details and account status.
              </p>
            </div>

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
            ) : (
              driver && (
                <>
                  {/* Account Status Card */}
                  <Card className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-brand-dark dark:text-brand-beige">
                        Account Status
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Current verification standing for {driver.name}
                      </p>
                    </div>
                    <div>{getStatusBadge(driver.status)}</div>
                  </Card>

                  {/* Vehicle Information Grid */}
                  <Card>
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-brand-dark dark:text-brand-beige">
                        Vehicle Details
                      </h3>
                      <button className="text-sm font-semibold text-brand-teal dark:text-brand-mint hover:underline">
                        Edit
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {/* Make */}
                      <div className="p-4 rounded-xl bg-gray-50 dark:bg-brand-dark/50 border border-gray-100 dark:border-gray-800">
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold mb-1">
                          Make
                        </p>
                        <p className="text-lg font-bold text-brand-dark dark:text-brand-beige">
                          {driver.vehicle?.make || "Not provided"}
                        </p>
                      </div>

                      {/* Model */}
                      <div className="p-4 rounded-xl bg-gray-50 dark:bg-brand-dark/50 border border-gray-100 dark:border-gray-800">
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold mb-1">
                          Model
                        </p>
                        <p className="text-lg font-bold text-brand-dark dark:text-brand-beige">
                          {driver.vehicle?.model || "Not provided"}
                        </p>
                      </div>

                      {/* License Plate */}
                      <div className="p-4 rounded-xl bg-gray-50 dark:bg-brand-dark/50 border border-gray-100 dark:border-gray-800">
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold mb-1">
                          License Plate
                        </p>
                        <p className="text-lg font-bold text-brand-dark dark:text-brand-beige">
                          {driver.vehicle?.licensePlate || "Not provided"}
                        </p>
                      </div>

                      {/* Color */}
                      <div className="p-4 rounded-xl bg-gray-50 dark:bg-brand-dark/50 border border-gray-100 dark:border-gray-800">
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold mb-1">
                          Vehicle Color
                        </p>
                        <div className="flex items-center gap-2">
                          {driver.vehicle?.vehicleColor && (
                            <div
                              className="w-4 h-4 rounded-full border border-gray-300 dark:border-gray-600 shadow-sm"
                              style={{
                                backgroundColor:
                                  driver.vehicle.vehicleColor.toLowerCase(),
                              }}
                            ></div>
                          )}
                          <p className="text-lg font-bold text-brand-dark dark:text-brand-beige capitalize">
                            {driver.vehicle?.vehicleColor || "Not provided"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Documents Section (UI Placeholder) */}
                  <Card>
                    <h3 className="text-xl font-bold text-brand-dark dark:text-brand-beige mb-4">
                      Required Documents
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                      Upload your driving license and vehicle registration for
                      further KYC verification.
                    </p>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 rounded-xl border border-dashed border-brand-teal/40 dark:border-brand-mint/40 bg-brand-teal/5 dark:bg-brand-mint/5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-brand-teal/20 dark:bg-brand-mint/20 flex items-center justify-center">
                            {/* Placeholder Icon */}
                            <span className="text-brand-teal dark:text-brand-mint font-bold text-xl">
                              📄
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-brand-dark dark:text-brand-beige">
                              Driving License
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              PDF, JPG or PNG (Max 5MB)
                            </p>
                          </div>
                        </div>
                        <button className="px-4 py-2 bg-brand-dark dark:bg-brand-beige text-white dark:text-brand-dark font-semibold rounded-lg text-sm hover:opacity-90 transition-opacity">
                          Upload
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-4 rounded-xl border border-dashed border-brand-teal/40 dark:border-brand-mint/40 bg-brand-teal/5 dark:bg-brand-mint/5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-brand-teal/20 dark:bg-brand-mint/20 flex items-center justify-center">
                            <span className="text-brand-teal dark:text-brand-mint font-bold text-xl">
                              📄
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-brand-dark dark:text-brand-beige">
                              Vehicle Registration (RC)
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              PDF, JPG or PNG (Max 5MB)
                            </p>
                          </div>
                        </div>
                        <button className="px-4 py-2 bg-brand-dark dark:bg-brand-beige text-white dark:text-brand-dark font-semibold rounded-lg text-sm hover:opacity-90 transition-opacity">
                          Upload
                        </button>
                      </div>
                    </div>
                  </Card>
                </>
              )
            )}
          </div>
        </div>
      </ScreenLoader>
    </AppLayout>
  );
}

export default VehicleDocs;
