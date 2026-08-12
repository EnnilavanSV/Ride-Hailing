import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import ScreenLoader from "../components/ScreenLoader";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  // UI Feedback States
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  // STRICT FRONTEND RULES (Interceptors)
  const handleNameChange = (e) => {
    // Instantly strips out any numbers or special characters.
    setName(e.target.value.replace(/[^a-zA-Z\s]/g, ""));
  };

  const handlePhoneChange = (e) => {
    // Instantly strips out letters. Only keeps numbers.
    const onlyNumbers = e.target.value.replace(/\D/g, "");

    // Stops them from typing more than 10 digits
    if (onlyNumbers.length <= 10) {
      setPhone(onlyNumbers);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setLoading(true);

    // Call the context function which talks to your backend
    const result = await register(name, email, phone, password);

    // On success, redirect to the main ride flow/map screen
    if (result.success) {
      setSuccessMsg("Account created! Redirecting...");
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } else {
      setError(result.message || "Registration failed. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-brand-beige dark:bg-brand-dark flex flex-col justify-center p-6 transition-colors duration-300">
      <ScreenLoader isLoading={loading}>
        <div className="w-full max-w-md mx-auto">
          <h1 className="text-4xl font-bold text-brand-dark dark:text-brand-beige mb-2">
            Join Us
          </h1>
          <p className="text-brand-dark/70 dark:text-brand-beige/70 mb-8">
            Create an account to start riding.
          </p>

          {/* Error Banner */}
          {error && (
            <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-6 text-sm font-bold">
              {error}
            </div>
          )}

          {/* Success Banner */}
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
                value={name} // Required for the interceptor to work
                onChange={handleNameChange} // 🛡️ Applied interceptor
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
                value={email} // Required for controlled input
                onChange={(e) => setEmail(e.target.value)}
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
                value={phone} // Required for the interceptor to work
                onChange={handlePhoneChange} // 🛡️ Applied interceptor
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
                value={password} // Required for controlled input
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-4 rounded-xl bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 text-brand-dark dark:text-white focus:outline-none focus:border-brand-teal"
                required
                minLength="6"
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
              Log in
            </Link>
          </p>
        </div>
      </ScreenLoader>
    </div>
  );
};

export default Register;
