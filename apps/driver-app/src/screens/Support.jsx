import React, { useState } from "react";
import AppLayout from "../layout/AppLayout";
import Header from "../components/Header";
import { Card, Button } from "@ride/ui";
import ScreenLoader from "../components/ScreenLoader";

function DriverSupport() {
  // Mock state for expanding/collapsing FAQs
  const [expandedFaq, setExpandedFaq] = useState(null);

  const [disputeForm, setDisputeForm] = useState({
    rideId: "",
    reason: "other", // Default to one of your schema Enums
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitDispute = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("driverToken"); // Use "userToken" in the Rider app

      const response = await fetch(
        "https://ride-hailing-backend-coan.onrender.com/api/drivers/disputes",
        {
          // Use /api/users/disputes for Rider
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(disputeForm),
        },
      );

      const data = await response.json();

      if (data.success) {
        alert(data.message);
        // Clear the form on success
        setDisputeForm({ rideId: "", reason: "other", description: "" });
      } else {
        alert(data.message || "Failed to submit dispute.");
      }
    } catch (err) {
      console.error("Submit Dispute Error:", err);
      alert("Network error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Updated FAQs tailored specifically for Drivers
  const faqs = [
    {
      id: 1,
      question: "A rider left an item in my vehicle. What should I do?",
      answer:
        "You can report a found item securely through the Trip History page by selecting the specific trip and tapping 'I found an item'. We will facilitate communication with the rider to arrange a return.",
    },
    {
      id: 2,
      question: "How do I dispute a missing cancellation fee?",
      answer:
        "Cancellation fees apply if a rider cancels 5 minutes after you accept, or if you cancel after waiting 5 minutes at the pickup location. To dispute a missing fee, go to Trip History, select the ride, and tap 'Help with this trip'.",
    },
    {
      id: 3,
      question: "How and when do I get paid?",
      answer:
        "Your earnings are automatically deposited into your linked bank account every week. Alternatively, you can navigate to your Earnings tab to use Instant Payout and access your funds immediately.",
    },
  ];

  const toggleFaq = (id) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  return (
    <AppLayout>
      <Header />
      <ScreenLoader>
        <div className="relative flex-1 w-full flex flex-col p-4 sm:p-6 overflow-y-auto bg-brand-beige/30 dark:bg-brand-dark/90 transition-colors duration-300">
          <div className="max-w-3xl mx-auto w-full space-y-6 pb-10">
            {/* Page Header */}
            <div>
              <h2 className="text-3xl font-bold text-brand-dark dark:text-brand-beige">
                Driver Support
              </h2>
              <p className="text-brand-teal dark:text-brand-mint mt-1">
                How can we help you on the road today?
              </p>
            </div>

            {/* Quick Contact Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card className="flex flex-col items-center justify-center text-center p-6 hover:shadow-md transition-shadow cursor-pointer group">
                <div className="w-12 h-12 rounded-full bg-brand-teal/10 dark:bg-brand-mint/10 text-brand-teal dark:text-brand-mint flex items-center justify-center mb-3 group-hover:bg-brand-teal group-hover:text-white dark:group-hover:bg-brand-mint dark:group-hover:text-brand-dark transition-colors">
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
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-brand-dark dark:text-brand-beige">
                  Email Support
                </h3>
                <p className="text-sm text-brand-teal dark:text-brand-mint/80 mt-1">
                  driversupport@omnitrack.com
                </p>
              </Card>

              <Card className="flex flex-col items-center justify-center text-center p-6 hover:shadow-md transition-shadow cursor-pointer group">
                <div className="w-12 h-12 rounded-full bg-brand-teal/10 dark:bg-brand-mint/10 text-brand-teal dark:text-brand-mint flex items-center justify-center mb-3 group-hover:bg-brand-teal group-hover:text-white dark:group-hover:bg-brand-mint dark:group-hover:text-brand-dark transition-colors">
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
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-brand-dark dark:text-brand-beige">
                  Call Us
                </h3>
                <p className="text-sm text-brand-teal dark:text-brand-mint/80 mt-1">
                  Available 24/7 for driver emergencies
                </p>
              </Card>
            </div>

            {/* FAQ Section */}
            <Card className="space-y-2">
              <h3 className="text-xl font-bold text-brand-dark dark:text-brand-beige border-b border-brand-teal/20 dark:border-brand-mint/20 pb-3 mb-4">
                Frequently Asked Questions
              </h3>

              <div className="space-y-3">
                {faqs.map((faq) => (
                  <div
                    key={faq.id}
                    className="border border-brand-teal/10 dark:border-brand-mint/10 rounded-lg overflow-hidden"
                  >
                    <button
                      onClick={() => toggleFaq(faq.id)}
                      className="w-full flex items-center justify-between p-4 text-left bg-transparent hover:bg-brand-teal/5 dark:hover:bg-brand-mint/5 transition-colors focus:outline-none"
                    >
                      <span className="font-semibold text-brand-dark dark:text-brand-beige">
                        {faq.question}
                      </span>
                      <svg
                        className={`w-5 h-5 text-brand-teal dark:text-brand-mint transform transition-transform duration-200 ${
                          expandedFaq === faq.id ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>

                    {/* Expandable Answer */}
                    {expandedFaq === faq.id && (
                      <div className="p-4 pt-0 text-sm text-brand-teal dark:text-brand-mint/90 bg-transparent">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>

            {/* Form Section */}
            <Card className="space-y-4">
              <h3 className="text-xl font-bold text-brand-dark dark:text-brand-beige border-b border-brand-teal/20 dark:border-brand-mint/20 pb-2">
                Send us a Message
              </h3>
              <form className="space-y-4 pt-2" onSubmit={handleSubmitDispute}>
                <div>
                  <label className="block text-sm font-semibold text-brand-dark dark:text-brand-beige mb-1">
                    Ride ID
                  </label>
                  <input
                    type="text"
                    required
                    value={disputeForm.rideId}
                    onChange={(e) =>
                      setDisputeForm({ ...disputeForm, rideId: e.target.value })
                    }
                    placeholder="Paste the Ride ID from your history..."
                    className="w-full p-2.5 rounded-lg border border-brand-teal/30 dark:border-brand-mint/30 bg-transparent text-brand-dark dark:text-brand-beige focus:outline-none focus:border-brand-teal dark:focus:border-brand-mint transition-colors"
                  />
                </div>

                <div className="relative">
                  <label className="block text-sm font-semibold text-brand-dark dark:text-brand-beige mb-1">
                    Reason
                  </label>
                  <select
                    required
                    value={disputeForm.reason}
                    onChange={(e) =>
                      setDisputeForm({ ...disputeForm, reason: e.target.value })
                    }
                    className="w-full p-2.5 rounded-lg border border-brand-teal/30 dark:border-brand-mint/30 bg-transparent text-brand-dark dark:text-brand-beige focus:outline-none focus:border-brand-teal dark:focus:border-brand-mint transition-colors appearance-none cursor-pointer"
                  >
                    {/* Explicitly styling every option so the OS can't override the dark mode colors */}
                    <option
                      value="fare_issue"
                      className="bg-brand-beige dark:bg-brand-dark text-brand-dark dark:text-brand-beige"
                    >
                      Fare Issue
                    </option>
                    <option
                      value="driver_behavior"
                      className="bg-brand-beige dark:bg-brand-dark text-brand-dark dark:text-brand-beige"
                    >
                      Driver Behavior
                    </option>
                    <option
                      value="rider_behavior"
                      className="bg-brand-beige dark:bg-brand-dark text-brand-dark dark:text-brand-beige"
                    >
                      Rider Behavior
                    </option>
                    <option
                      value="safety_concern"
                      className="bg-brand-beige dark:bg-brand-dark text-brand-dark dark:text-brand-beige"
                    >
                      Safety Concern
                    </option>
                    <option
                      value="lost_item"
                      className="bg-brand-beige dark:bg-brand-dark text-brand-dark dark:text-brand-beige"
                    >
                      Lost Item
                    </option>
                    <option
                      value="other"
                      className="bg-brand-beige dark:bg-brand-dark text-brand-dark dark:text-brand-beige"
                    >
                      Other
                    </option>
                  </select>

                  {/* Custom dropdown arrow to replace the ugly default browser one */}
                  <div className="absolute inset-y-0 right-0 top-6 flex items-center px-3 pointer-events-none text-brand-teal dark:text-brand-mint">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-brand-dark dark:text-brand-beige mb-1">
                    Message
                  </label>
                  <textarea
                    required
                    rows="4"
                    value={disputeForm.description}
                    onChange={(e) =>
                      setDisputeForm({
                        ...disputeForm,
                        description: e.target.value,
                      })
                    }
                    placeholder="Describe your issue in detail..."
                    className="w-full p-2.5 rounded-lg border border-brand-teal/30 dark:border-brand-mint/30 bg-transparent text-brand-dark dark:text-brand-beige focus:outline-none focus:border-brand-teal dark:focus:border-brand-mint transition-colors resize-none"
                  ></textarea>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-brand-teal! dark:bg-brand-mint! text-white! dark:text-brand-dark! hover:opacity-90 font-bold py-3 rounded-lg transition-opacity disabled:opacity-50"
                >
                  {isSubmitting ? "Submitting..." : "Submit Request"}
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </ScreenLoader>
    </AppLayout>
  );
}

export default DriverSupport;
