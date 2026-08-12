import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import ScreenLoader from "../components/ScreenLoader";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useContext(AuthContext);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    const result = await login(email, password);

    if (result.success) {
      navigate("/");
    } else {
      // Optional: You could add a state here to show an error message on the UI
      alert(result.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen bg-brand-beige dark:bg-brand-dark flex flex-col justify-center p-6">
      <ScreenLoader>
        <div className="w-full max-w-md mx-auto">
          <h1 className="text-4xl font-bold text-brand-dark dark:text-brand-beige mb-2">
            Welcome Back
          </h1>
          <p className="text-brand-dark/70 dark:text-brand-beige/70 mb-8">
            Sign in to book your next ride.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-brand-dark dark:text-brand-beige mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-4 rounded-xl bg-white dark:bg-white/5 border border-black/10 dark:border-white/10 text-brand-dark dark:text-white focus:outline-none focus:border-brand-teal"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-4 mt-4 rounded-xl font-bold bg-brand-teal dark:bg-brand-mint text-brand-beige dark:text-brand-dark hover:opacity-90 transition-all"
            >
              Sign In
            </button>
          </form>

          <p className="mt-6 text-center text-brand-dark/70 dark:text-brand-beige/70">
            New here?{" "}
            <Link
              to="/register"
              className="text-brand-teal dark:text-brand-mint font-bold hover:underline"
            >
              Create an account
            </Link>
          </p>
        </div>
      </ScreenLoader>
    </div>
  );
};

export default Login;
