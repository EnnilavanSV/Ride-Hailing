import React, { useState, useEffect } from "react";
import axios from "axios";
import AppLayout from "../layouts/AppLayout";
import Header from "../components/Header";
import { Card, Button } from "@ride/ui";
import ScreenLoader from "../components/ScreenLoader";

function SavedAddresses() {
  const [addresses, setAddresses] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newAddress, setNewAddress] = useState({ title: "", address: "" });

  const API_URL = "https://ride-hailing-backend-coan.onrender.com/api/users";

  // Fetch saved addresses when component mounts
  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const token = localStorage.getItem("token");
      // Fetching the user profile to get the savedAddresses array
      const response = await axios.get(`${API_URL}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Update state if addresses exist
      if (response.data.data && response.data.data.savedAddresses) {
        setAddresses(response.data.data.savedAddresses);
      }
    } catch (error) {
      console.error("Failed to fetch addresses:", error);
    }
  };

  //  Handle Adding a New Address
  const handleSaveNewAddress = async (e) => {
    e.preventDefault();
    if (!newAddress.title || !newAddress.address) return; // Basic validation

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_URL}/saved-addresses`,
        newAddress,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.data.success) {
        // Our backend returns the updated array, so we just set it!
        setAddresses(response.data.data);
        // Reset form and close it
        setNewAddress({ title: "", address: "" });
        setIsAdding(false);
      }
    } catch (error) {
      console.error("Failed to add address:", error);
    }
  };

  //  Handle Deleting an Address
  const handleDelete = async (addressId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(
        `${API_URL}/saved-addresses/${addressId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.data.success) {
        // Update UI with the newly returned array from the backend
        setAddresses(response.data.data);
      }
    } catch (error) {
      console.error("Failed to delete address:", error);
    }
  };

  return (
    <AppLayout>
      <Header />
      <ScreenLoader>
        <div className="relative flex-1 w-full flex flex-col p-4 sm:p-6 overflow-y-auto bg-brand-beige/30 dark:bg-brand-dark/90 transition-colors duration-300">
          <div className="max-w-3xl mx-auto w-full space-y-6 pb-10">
            {/* UPDATED PAGE HEADER FOR MOBILE RESPONSIVENESS */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-2">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-brand-dark dark:text-brand-beige leading-tight">
                  Saved Addresses
                </h2>
                <p className="text-sm sm:text-base text-brand-teal dark:text-brand-mint mt-1">
                  Manage your favorite locations for quicker booking.
                </p>
              </div>

              <Button
                onClick={() => setIsAdding(!isAdding)}
                className="w-full sm:w-auto bg-brand-teal! dark:bg-brand-mint! text-white! dark:text-brand-dark! hover:opacity-90 font-bold px-6 py-3 rounded-lg transition-opacity flex justify-center items-center"
              >
                {isAdding ? "Cancel" : "+ Add New"}
              </Button>
            </div>

            {/* Add New Address Form (Conditional Rendering) */}
            {isAdding && (
              <Card className="bg-white dark:bg-brand-dark p-4 border-l-4 border-brand-teal dark:border-brand-mint shadow-md">
                <form onSubmit={handleSaveNewAddress} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-brand-teal dark:text-brand-mint mb-1">
                      Title (e.g., Gym, Mom's House)
                    </label>
                    <input
                      type="text"
                      value={newAddress.title}
                      onChange={(e) =>
                        setNewAddress({ ...newAddress, title: e.target.value })
                      }
                      className="w-full bg-transparent border border-brand-teal/20 rounded-lg p-3 text-brand-dark dark:text-brand-beige focus:outline-none focus:ring-2 focus:ring-brand-teal/50"
                      placeholder="Enter title"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-brand-teal dark:text-brand-mint mb-1">
                      Full Address
                    </label>
                    <input
                      type="text"
                      value={newAddress.address}
                      onChange={(e) =>
                        setNewAddress({
                          ...newAddress,
                          address: e.target.value,
                        })
                      }
                      className="w-full bg-transparent border border-brand-teal/20 rounded-lg p-3 text-brand-dark dark:text-brand-beige focus:outline-none focus:ring-2 focus:ring-brand-teal/50"
                      placeholder="Enter full address"
                      required
                    />
                  </div>
                  <div className="flex justify-end pt-2">
                    <Button
                      type="submit"
                      className="w-full sm:w-auto bg-brand-teal! dark:bg-brand-mint! text-white! dark:text-brand-dark! px-6 py-3 rounded-lg font-bold"
                    >
                      Save Address
                    </Button>
                  </div>
                </form>
              </Card>
            )}

            {/* Address List */}
            <div className="space-y-3">
              {addresses.length === 0 && !isAdding && (
                <p className="text-center text-brand-dark/60 dark:text-brand-beige/60 py-10 bg-white/50 dark:bg-brand-dark/50 rounded-xl border border-dashed border-brand-teal/30">
                  No saved addresses yet. Add one to get started!
                </p>
              )}

              {addresses.map((loc) => (
                <Card
                  key={loc._id}
                  className="hover:shadow-md transition-shadow duration-200 bg-white dark:bg-brand-dark"
                >
                  <div className="flex items-center justify-between p-2">
                    <div className="flex items-center space-x-4 overflow-hidden pr-2">
                      {/* Dynamic Icon Wrapper */}
                      <div className="p-3 rounded-full bg-brand-teal/10 dark:bg-brand-mint/10 text-brand-teal dark:text-brand-mint shrink-0">
                        {loc.title.toLowerCase() === "home" ? (
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
                              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                            />
                          </svg>
                        ) : (
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
                              d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                          </svg>
                        )}
                      </div>

                      {/* Address Text */}
                      <div className="truncate">
                        <h3 className="text-lg font-bold text-brand-dark dark:text-brand-beige truncate">
                          {loc.title}
                        </h3>
                        <p className="text-sm text-brand-teal dark:text-brand-mint/80 truncate">
                          {loc.address}
                        </p>
                      </div>
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDelete(loc._id)}
                      className="p-2 shrink-0 text-brand-dark/40 hover:text-red-500 dark:text-brand-beige/40 dark:hover:text-red-400 transition-colors rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
                      aria-label="Delete address"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </ScreenLoader>
    </AppLayout>
  );
}

export default SavedAddresses;
