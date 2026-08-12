import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import FloatingSidebar from "./FloatingSidebar";

const Header = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = () => {
    logout(); //  Clear token and state
    navigate("/login"); //  Kick them back to the login screen
  };

  return (
    <>
      <header
        className="sticky top-0 z-49 flex items-center justify-between px-4 py-3 md:px-8 
                       bg-brand-beige/80 dark:bg-brand-dark/80 backdrop-blur-md 
                       border-b border-brand-teal/20 dark:border-brand-mint/20
                       transition-colors duration-300"
      >
        {/* Menu / Hamburger Icon */}
        <button
          onClick={toggleSidebar}
          className="p-2 -ml-2 text-brand-dark dark:text-brand-beige hover:text-brand-teal dark:hover:text-brand-mint transition-colors focus:outline-none"
          aria-label="Toggle Menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        {/* App Logo / Title */}
        <h1 className="text-2xl font-black tracking-wider text-brand-teal dark:text-brand-mint uppercase">
          ADMIN
        </h1>

        {/* User Profile Icon & Logout */}
        <div className="flex gap-2 items-center justify-between">
          <button
            onClick={() => navigate("/settings")}
            className="p-2 -mr-2 text-brand-dark dark:text-brand-beige hover:text-brand-teal dark:hover:text-brand-mint transition-colors focus:outline-none hidden sm:block"
            aria-label="User Profile"
          >
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
                d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>
          <button
            onClick={handleLogout}
            className="
            bg-brand-teal text-brand-beige 
            dark:bg-brand-mint dark:text-brand-dark 
            hover:opacity-90 
            font-semibold py-2 px-4 rounded 
            transition-all duration-200
          "
          >
            Logout
          </button>
        </div>
      </header>

      <FloatingSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
    </>
  );
};

export default Header;
