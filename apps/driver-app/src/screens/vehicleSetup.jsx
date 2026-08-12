import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import ScreenLoader from "../components/ScreenLoader";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const VehicleSetup = () => {
  const [vehicleData, setVehicleData] = useState({
    make: "",
    model: "",
    licensePlate: "",
    vehicleColor: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { token, updateDriver } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setVehicleData({ ...vehicleData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // NOTE: Ensure this URL matches your backend endpoint for updating vehicles
      const response = await axios.put(
        "https://ride-hailing-backend-coan.onrender.com/api/drivers/vehicle",
        vehicleData,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (response.data.success) {
        updateDriver({
          status: "pending_approval",
          vehicle: vehicleData,
        });
        navigate("/pending-approval", { replace: true });
      }
    } catch (error) {
      alert(error.response?.data?.message || "Failed to save vehicle details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-beige dark:bg-brand-dark flex flex-col justify-center p-6">
      <ScreenLoader>
        <div className="w-full max-w-md mx-auto">
          <h1 className="text-4xl font-bold text-brand-dark dark:text-brand-beige mb-2">
            Vehicle Details
          </h1>
          <p className="text-brand-dark/70 dark:text-brand-beige/70 mb-8">
            Add your vehicle information to start taking rides.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Make */}
            <div>
              <label className="block text-sm font-medium text-brand-dark dark:text-brand-beige mb-1">
                Make (e.g., Toyota)
              </label>
              <input
                type="text"
                name="make"
                value={vehicleData.make}
                onChange={handleChange}
                className="w-full p-4 rounded-xl bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 text-brand-dark dark:text-white focus:outline-none focus:border-brand-teal"
                required
              />
            </div>

            {/* Model */}
            <div>
              <label className="block text-sm font-medium text-brand-dark dark:text-brand-beige mb-1">
                Model (e.g., Camry)
              </label>
              <input
                type="text"
                name="model"
                value={vehicleData.model}
                onChange={handleChange}
                className="w-full p-4 rounded-xl bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 text-brand-dark dark:text-white focus:outline-none focus:border-brand-teal"
                required
              />
            </div>

            {/* License Plate */}
            <div>
              <label className="block text-sm font-medium text-brand-dark dark:text-brand-beige mb-1">
                License Plate
              </label>
              <input
                type="text"
                name="licensePlate"
                value={vehicleData.licensePlate}
                onChange={handleChange}
                className="w-full p-4 rounded-xl bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 text-brand-dark dark:text-white focus:outline-none focus:border-brand-teal uppercase"
                required
              />
            </div>

            {/* Color */}
            <div>
              <label className="block text-sm font-medium text-brand-dark dark:text-brand-beige mb-1">
                Color
              </label>
              <input
                type="text"
                name="vehicleColor"
                value={vehicleData.vehicleColor}
                onChange={handleChange}
                className="w-full p-4 rounded-xl bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 text-brand-dark dark:text-white focus:outline-none focus:border-brand-teal"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 mt-4 rounded-xl font-bold bg-brand-teal dark:bg-brand-mint text-brand-beige dark:text-brand-dark hover:opacity-90 transition-all disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Complete Setup"}
            </button>
          </form>
        </div>
      </ScreenLoader>
    </div>
  );
};

export default VehicleSetup;
