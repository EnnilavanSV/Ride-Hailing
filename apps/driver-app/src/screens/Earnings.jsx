import React, { useState, useEffect } from "react";
import AppLayout from "../layout/AppLayout";
import Header from "../components/Header";
import { Card, Button } from "@ride/ui";
import ScreenLoader from "../components/ScreenLoader";

function Earnings() {
  const [rides, setRides] = useState([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for handling withdrawals
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawMessage, setWithdrawMessage] = useState(null);

  // Mock state for transaction history
  const [transactions, setTransactions] = useState([
    {
      id: "tx-1",
      amount: 1250.0,
      date: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
      status: "Completed",
    },
    {
      id: "tx-2",
      amount: 800.5,
      date: new Date(Date.now() - 86400000 * 7).toISOString(), // 7 days ago
      status: "Completed",
    },
  ]);

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const token = localStorage.getItem("driverToken");

        const response = await fetch(
          "https://ride-hailing-backend-coan.onrender.com/api/drivers/earnings",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!response.ok) {
          throw new Error("Failed to fetch earnings data");
        }

        const jsonResponse = await response.json();

        if (jsonResponse.success) {
          setTotalEarnings(jsonResponse.data.totalEarnings);
          setRides(jsonResponse.data.rides);
        } else {
          throw new Error("Failed to load data");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEarnings();
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

  // Mock withdrawal function
  const handleWithdraw = () => {
    if (totalEarnings <= 0) return;

    setIsWithdrawing(true);
    setWithdrawMessage(null);

    // Save the amount to push to the history log
    const amountToWithdraw = totalEarnings;

    // Simulate an API call delay of 1.5 seconds
    setTimeout(() => {
      setTotalEarnings(0); // Reset balance to 0
      setIsWithdrawing(false);
      setWithdrawMessage({
        type: "success",
        text: "Withdrawal successful! Funds are on their way to your bank.",
      });

      // Add the new withdrawal to the transaction history sidebar
      const newTransaction = {
        id: `tx-${Date.now()}`,
        amount: amountToWithdraw,
        date: new Date().toISOString(),
        status: "Processing",
      };

      setTransactions((prev) => [newTransaction, ...prev]);

      // Clear the success message after 5 seconds
      setTimeout(() => {
        setWithdrawMessage(null);
      }, 5000);
    }, 1500);
  };

  return (
    <AppLayout>
      <Header />
      <ScreenLoader isLoading={loading}>
        <div className="relative flex-1 w-full p-4 sm:p-6 overflow-y-auto bg-brand-beige/30 dark:bg-brand-dark/90 transition-colors duration-300">
          {/* Main Layout Container: Splits into 2 columns on lg screens */}
          <div className="max-w-6xl mx-auto w-full flex flex-col lg:flex-row gap-6 lg:gap-8 pb-10">
            {/* Left Column: Earnings & Completed Trips */}
            <div className="flex-1 space-y-6">
              {/* Header Section */}
              <div>
                <h2 className="text-3xl font-bold text-brand-dark dark:text-brand-beige">
                  Earnings
                </h2>
                <p className="text-brand-teal dark:text-brand-mint mt-1">
                  Track your completed trips and total payouts.
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
                <>
                  {/* Total Earnings Highlight Card */}
                  <Card className="bg-white dark:bg-brand-dark shadow-md flex flex-col items-center">
                    <div className="text-center py-4">
                      <p className="text-brand-teal/80 dark:text-brand-mint text-sm font-semibold uppercase tracking-widest mb-2">
                        Available Balance
                      </p>
                      <h3 className="text-brand-dark dark:text-brand-beige text-5xl font-black">
                        ₹{totalEarnings.toFixed(2)}
                      </h3>
                    </div>

                    {/* Withdrawal Section */}
                    <div className="w-full flex flex-col items-center border-t border-brand-teal/10 dark:border-brand-mint/10 pt-4 mt-2">
                      <Button
                        onClick={handleWithdraw}
                        disabled={isWithdrawing || totalEarnings <= 0}
                        className="bg-brand-teal! dark:bg-brand-mint! text-white! dark:text-brand-dark! hover:opacity-90 font-bold py-2.5 px-8 rounded-lg transition-opacity disabled:opacity-50 disabled:cursor-not-allowed w-full max-w-xs"
                      >
                        {isWithdrawing ? "Processing..." : "Withdraw Funds"}
                      </Button>

                      {/* Mock Status Message */}
                      {withdrawMessage && (
                        <p
                          className={`mt-3 text-sm font-semibold text-center animate-fade-in ${
                            withdrawMessage.type === "success"
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          {withdrawMessage.text}
                        </p>
                      )}
                    </div>
                  </Card>

                  {rides.length === 0 ? (
                    <div className="bg-white dark:bg-brand-dark/50 border border-brand-teal/20 dark:border-brand-mint/20 rounded-2xl p-10 text-center shadow-sm">
                      <p className="text-lg font-bold text-brand-dark dark:text-brand-beige">
                        No earnings yet
                      </p>
                      <p className="text-brand-teal dark:text-brand-mint">
                        You haven't completed any trips.
                      </p>
                    </div>
                  ) : (
                    /* Ride List */
                    <div className="space-y-4 mt-6">
                      <h4 className="text-xl font-bold text-brand-dark dark:text-brand-beige mb-4">
                        Completed Trips
                      </h4>
                      {rides.map((ride) => (
                        <Card
                          key={ride._id}
                          className="hover:shadow-lg transition-shadow duration-200"
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <p className="text-sm text-brand-teal dark:text-brand-mint/80 font-medium mb-1">
                                {formatDate(ride.createdAt)}
                              </p>
                              <span className="px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider bg-brand-teal/20 text-brand-teal dark:bg-brand-mint/20 dark:text-brand-mint">
                                Completed
                              </span>
                            </div>
                            <div className="text-right">
                              <p className="text-xl font-black text-brand-dark dark:text-brand-beige">
                                + ₹{ride.fare.toFixed(2)}
                              </p>
                            </div>
                          </div>

                          <div className="relative pl-6 space-y-4 pt-2">
                            <div className="absolute left-2.75 top-2 bottom-2 w-0.5 bg-brand-teal/20 dark:bg-brand-mint/20"></div>

                            {/* Pickup */}
                            <div className="relative">
                              <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-brand-teal dark:bg-brand-mint ring-4 ring-white dark:ring-brand-dark"></div>
                              <p className="text-brand-dark dark:text-brand-beige font-medium leading-tight">
                                {ride.pickupLocation.address}
                              </p>
                            </div>

                            {/* Dropoff */}
                            <div className="relative">
                              <div className="absolute -left-6 top-1 w-3 h-3 rounded-none bg-brand-dark dark:bg-brand-beige ring-4 ring-white dark:ring-brand-dark"></div>
                              <p className="text-brand-dark dark:text-brand-beige font-medium leading-tight">
                                {ride.dropoffLocation.address}
                              </p>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Right Column: Transaction History Sidebar */}
            <div className="w-full lg:w-80 xl:w-96 flex flex-col space-y-6">
              {/* Spacer on desktop to align with the cards on the left */}
              <div className="hidden lg:block h-[72px]"></div>

              <Card className="flex-1 bg-white dark:bg-brand-dark shadow-sm">
                <h3 className="text-lg font-bold text-brand-dark dark:text-brand-beige border-b border-brand-teal/20 dark:border-brand-mint/20 pb-3 mb-4">
                  Recent Transactions
                </h3>

                {transactions.length === 0 ? (
                  <p className="text-brand-teal/80 dark:text-brand-mint/80 text-sm text-center py-4">
                    No recent transactions.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {transactions.map((tx) => (
                      <div
                        key={tx.id}
                        className="flex justify-between items-center p-3 rounded-lg border border-brand-teal/10 dark:border-brand-mint/10 bg-brand-beige/10 dark:bg-brand-dark/50"
                      >
                        <div>
                          <p className="text-sm font-bold text-brand-dark dark:text-brand-beige">
                            Withdrawal
                          </p>
                          <p className="text-xs text-brand-teal/80 dark:text-brand-mint/80 mt-0.5">
                            {formatDate(tx.date)}
                          </p>
                          <p
                            className={`text-xs font-semibold mt-1 ${tx.status === "Processing" ? "text-amber-500" : "text-green-500"}`}
                          >
                            {tx.status}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-brand-dark dark:text-brand-beige font-black">
                            - ₹{tx.amount.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      </ScreenLoader>
    </AppLayout>
  );
}

export default Earnings;
