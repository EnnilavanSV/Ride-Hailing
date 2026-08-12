import React from "react";

const AppLayout = ({ children }) => {
  return (
    <div className="min-h-screen w-full flex flex-col transition-colors duration-300 bg-brand-beige text-brand-dark dark:bg-brand-dark dark:text-brand-beige">
      {/* Subsequent components like the Header, Map, and Bottom Navigation will be rendered inside this wrapper */}
      {children}
    </div>
  );
};

export default AppLayout;
