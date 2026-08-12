import React from "react";
import { Link, useLocation } from "react-router-dom";

const FloatingSidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  // Updated navigation links tailored for the Admin App
  const navLinks = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Fleet Map", path: "/map" },
    { name: "Riders", path: "/users" },
    { name: "Drivers", path: "/drivers" },
    { name: "Rides & History", path: "/rides" },
    { name: "Disputes", path: "/disputes" },
    { name: "Settings", path: "/settings" },
  ];

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay backdrop */}
      <div
        className="fixed inset-0 bg-brand-dark/20 dark:bg-brand-dark/60 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      ></div>

      {/* Responsive Sidebar Panel */}
      <div className="fixed top-0 left-0 h-full w-64 p-4 z-50 bg-brand-beige dark:bg-brand-dark border-r sm:border border-brand-teal/20 dark:border-brand-mint/20 shadow-xl overflow-y-auto sm:top-20 sm:left-4 sm:h-auto sm:rounded-2xl transition-all duration-300">
        {/* Mobile Header & Close Button */}
        <div className="flex justify-between items-center mb-6 sm:hidden">
          <h2 className="text-xl font-bold text-brand-teal dark:text-brand-mint">
            Admin Menu
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-brand-dark dark:text-brand-beige hover:bg-brand-teal/10 dark:hover:bg-brand-mint/10 transition-colors"
            aria-label="Close Menu"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex flex-col gap-2">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                onClick={onClose}
                className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-brand-teal text-white dark:bg-brand-mint dark:text-brand-dark shadow-md"
                    : "text-brand-dark dark:text-brand-beige hover:bg-brand-teal/10 dark:hover:bg-brand-mint/10 hover:text-brand-teal dark:hover:text-brand-mint"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default FloatingSidebar;
