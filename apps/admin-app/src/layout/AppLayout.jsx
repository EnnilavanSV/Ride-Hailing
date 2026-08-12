import React from "react";

const AppLayout = ({ children }) => {
  return (
    <div className="h-screen w-full overflow-hidden flex flex-col transition-colors duration-300 bg-brand-beige text-brand-dark dark:bg-brand-dark dark:text-brand-beige">
      {/* Subsequent components like the Header, Sidebar, and Dashboard will be rendered inside this wrapper */}
      {children}
    </div>
  );
};

export default AppLayout;
