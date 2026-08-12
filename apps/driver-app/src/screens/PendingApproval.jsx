import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import Header from "../components/Header";
import ScreenLoader from "../components/ScreenLoader";
import { Card, Button } from "@ride/ui";
import AppLayout from "../layout/AppLayout";

const PendingApproval = () => {
  const { logout } = useContext(AuthContext);

  return (
    <AppLayout>
      <Header></Header>
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
        <ScreenLoader>
          <Card className="max-w-md w-full text-center space-y-6">
            {/* Animated Clock Icon */}
            <div className="flex justify-center">
              <svg
                className="w-20 h-20 text-brand-teal dark:text-brand-mint animate-pulse"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>

            {/* Status Text */}
            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-brand-dark dark:text-brand-beige">
                Under Review
              </h2>
              <p className="text-brand-dark/80 dark:text-brand-beige/80">
                Thank you for submitting your vehicle details. Our admin team is
                currently reviewing your account.
              </p>
              <p className="text-sm font-semibold text-brand-teal dark:text-brand-mint">
                Please check back later.
              </p>
            </div>

            {/* Actions */}
            <div className="pt-4 mt-6 border-t border-brand-teal/10 dark:border-brand-mint/20">
              <Button
                variant="secondary"
                onClick={logout}
                className="w-full mt-4"
              >
                Log Out
              </Button>
            </div>
          </Card>
        </ScreenLoader>
      </div>
    </AppLayout>
  );
};

export default PendingApproval;
