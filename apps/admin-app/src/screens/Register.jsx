import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import ScreenLoader from "../components/ScreenLoader";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Added a loading state so the user can't spam the submit button
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { register } = useContext(AuthContext);

  //  THE BOUNCER: Strict Frontend Validation Interceptor
  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;

    if (name === "name") {
      // Instantly strips out any numbers or special characters. Only letters and spaces allowed.
      newValue = value.replace(/[^a-zA-Z\s]/g, "");
    } else if (name === "phone") {
      // Instantly strips out letters. Only keeps numbers (digits).
      newValue = value.replace(/\D/g, "");

      // If they try to type more than 10 digits, stop updating the state completely
      if (newValue.length > 10) return;
    }

    setFormData({ ...formData, [name]: newValue });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setLoading(true);

    const response = await register(
      formData.name,
      formData.email,
      formData.phone,
      formData.password,
    );

    if (response.success) {
      setSuccessMsg("Account created! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } else {
      setError(response.message);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-brand-beige dark:bg-brand-dark flex flex-col justify-center p-6 transition-colors duration-300">
      {/* Passed the loading state to your ScreenLoader */}
      <ScreenLoader isLoading={loading}>
        <div className="w-full max-w-md mx-auto">
          <h1 className="text-4xl font-bold text-brand-dark dark:text-brand-beige mb-2">
            Create Account
          </h1>
          <p className="text-brand-dark/70 dark:text-brand-beige/70 mb-8">
            Register for administrative access to the platform.
          </p>

          {error && (
            <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-6 text-sm font-bold">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="bg-green-100 text-green-700 p-3 rounded-lg mb-6 text-sm font-bold">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-brand-dark dark:text-brand-beige mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-4 rounded-xl bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 text-brand-dark dark:text-white focus:outline-none focus:border-brand-teal"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-dark dark:text-brand-beige mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-4 rounded-xl bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 text-brand-dark dark:text-white focus:outline-none focus:border-brand-teal"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-dark dark:text-brand-beige mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full p-4 rounded-xl bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 text-brand-dark dark:text-white focus:outline-none focus:border-brand-teal"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-dark dark:text-brand-beige mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                minLength="6"
                value={formData.password}
                onChange={handleChange}
                className="w-full p-4 rounded-xl bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 text-brand-dark dark:text-white focus:outline-none focus:border-brand-teal"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 mt-4 rounded-xl font-bold transition-all ${
                loading
                  ? "bg-gray-400 cursor-not-allowed text-white"
                  : "bg-brand-teal dark:bg-brand-mint text-brand-beige dark:text-brand-dark hover:opacity-90"
              }`}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <p className="mt-6 text-center text-brand-dark/70 dark:text-brand-beige/70">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-brand-teal dark:text-brand-mint font-bold hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </ScreenLoader>
    </div>
  );
};

export default Register;
