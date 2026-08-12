import React, { useState } from "react";
import AppLayout from "../layouts/AppLayout";
import Header from "../components/Header";
import { Card, Button } from "@ride/ui"; // Adjust import based on your monorepo setup
import ScreenLoader from "../components/ScreenLoader";

function Payments() {
  const [selectedMethod, setSelectedMethod] = useState("card-8924");

  // Mock data for payment options
  const paymentMethods = [
    {
      id: "card-8924",
      type: "card",
      title: "•••• •••• •••• 8924",
      subtitle: "Expires 12/28",
    },
    {
      id: "upi",
      type: "upi",
      title: "Google Pay / PhonePe",
      subtitle: "user@upi",
    },
    {
      id: "cash",
      type: "cash",
      title: "Cash",
      subtitle: "Pay driver directly",
    },
  ];

  // Helper function to render the correct icon based on payment type
  const renderIcon = (type) => {
    const baseClasses = "w-6 h-6 text-brand-teal dark:text-brand-mint";
    switch (type) {
      case "card":
        return (
          <svg
            className={baseClasses}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
            />
          </svg>
        );
      case "upi":
        return (
          <svg
            className={baseClasses}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
        );
      case "cash":
        return (
          <svg
            className={baseClasses}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <AppLayout>
      <Header />

      <ScreenLoader>
        {/* Main Content Container matching your exact structure */}
        <div className="relative flex-1 w-full flex flex-col p-6 overflow-y-auto">
          <div className="max-w-3xl mx-auto w-full space-y-6">
            {/* Page Headers */}
            <div>
              <h2 className="text-3xl font-bold text-brand-dark dark:text-brand-beige">
                Payments
              </h2>
              <p className="text-brand-teal dark:text-brand-mint mt-1">
                Manage your payment methods and wallet.
              </p>
            </div>

            {/* OmniWallet Balance Card */}
            <Card className="bg-brand-teal! dark:bg-brand-mint! border-none! relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 dark:bg-black/10 rounded-full blur-2xl pointer-events-none"></div>

              <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <p className="text-brand-beige/80 dark:text-brand-dark/80 text-sm font-semibold uppercase tracking-wider mb-1">
                    OmniWallet Balance
                  </p>
                  <h2 className="text-4xl font-black text-brand-beige dark:text-brand-dark">
                    ₹850.00
                  </h2>
                </div>
                <Button
                  variant="secondary"
                  className="border-brand-beige! text-brand-beige! hover:bg-brand-beige/20! dark:border-brand-dark! dark:text-brand-dark! dark:hover:bg-brand-dark/10! w-full sm:w-auto"
                >
                  Top Up
                </Button>
              </div>
            </Card>

            {/* Payment Methods Section */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-brand-dark dark:text-brand-beige pt-4">
                Saved Methods
              </h3>

              <div className="grid gap-4">
                {paymentMethods.map((method) => (
                  <Card
                    key={method.id}
                    className={`cursor-pointer transition-all duration-200 border-2 ${
                      selectedMethod === method.id
                        ? "border-brand-teal dark:border-brand-mint shadow-md"
                        : "border-transparent hover:border-brand-teal/30 dark:hover:border-brand-mint/30 shadow-sm"
                    }`}
                  >
                    <div
                      className="flex items-center gap-4"
                      onClick={() => setSelectedMethod(method.id)}
                    >
                      <div className="p-3 rounded-full bg-brand-teal/10 dark:bg-brand-mint/10">
                        {renderIcon(method.type)}
                      </div>

                      <div className="flex-1">
                        <h4 className="font-bold text-brand-dark dark:text-brand-beige">
                          {method.title}
                        </h4>
                        <p className="text-sm text-brand-teal dark:text-brand-mint/80">
                          {method.subtitle}
                        </p>
                      </div>

                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                          selectedMethod === method.id
                            ? "border-brand-teal dark:border-brand-mint"
                            : "border-brand-teal/30 dark:border-brand-mint/30"
                        }`}
                      >
                        {selectedMethod === method.id && (
                          <div className="w-3 h-3 rounded-full bg-brand-teal dark:bg-brand-mint"></div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Add New Method Button */}
            <div className="pt-2 pb-10">
              <Button
                variant="ghost"
                className="w-full border-2 border-dashed border-brand-teal/30 dark:border-brand-mint/30 py-6"
              >
                <span className="flex items-center gap-2">
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
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Add New Payment Method
                </span>
              </Button>
            </div>
          </div>
        </div>
      </ScreenLoader>
    </AppLayout>
  );
}

export default Payments;
