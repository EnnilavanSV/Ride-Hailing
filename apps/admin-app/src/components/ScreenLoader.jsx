import React, { useState, useEffect } from "react";

const ScreenLoader = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set a 1-second (1000ms) delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    // Cleanup the timer if the component unmounts early
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center flex-1 h-full min-h-[50vh] w-full">
        {/* Tailwind Spinner */}
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-brand-teal dark:border-brand-mint"></div>
      </div>
    );
  }

  // Once loading is false, render the actual page content
  return <>{children}</>;
};

export default ScreenLoader;
