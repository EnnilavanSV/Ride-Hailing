import React from "react";

// --- Shared Button Component ---
export const Button = ({
  children,
  onClick,
  variant = "primary",
  className = "",
  type = "button",
}) => {
  const baseStyles =
    "px-6 py-3 rounded-xl font-bold transition-all duration-200 active:scale-95 w-full sm:w-auto flex justify-center items-center";

  const variants = {
    // Light mode: Teal background, Beige text | Dark mode: Mint background, Dark text
    primary:
      "bg-brand-teal text-brand-beige hover:opacity-90 dark:bg-brand-mint dark:text-brand-dark shadow-lg shadow-brand-teal/20 dark:shadow-brand-mint/20",

    // Light mode: Transparent with Teal border/text | Dark mode: Transparent with Mint border/text
    secondary:
      "border-2 border-brand-teal text-brand-teal hover:bg-brand-teal/10 dark:border-brand-mint dark:text-brand-mint dark:hover:bg-brand-mint/10",

    // Subtle ghost button for tertiary actions
    ghost:
      "text-brand-dark hover:bg-brand-teal/10 dark:text-brand-beige dark:hover:bg-brand-mint/10",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

// --- Shared Card Component ---
export const Card = ({ children, className = "" }) => {
  return (
    <div
      className={`
      p-5 sm:p-6 rounded-2xl shadow-md 
      bg-white border border-brand-teal/10
      dark:bg-brand-dark dark:border-brand-mint/20
      transition-colors duration-300
      ${className}
    `}
    >
      {children}
    </div>
  );
};

export const Table = ({
  columns,
  data,
  isLoading,
  emptyMessage = "No data available.",
}) => {
  // --- Loading State ---
  if (isLoading) {
    return (
      <div className="w-full h-48 flex items-center justify-center border border-brand-teal/10 dark:border-brand-mint/10 rounded-2xl bg-white dark:bg-brand-dark/50">
        <span className="animate-pulse font-bold text-brand-teal dark:text-brand-mint">
          Loading data...
        </span>
      </div>
    );
  }

  // --- Main Table Render ---
  return (
    <div className="w-full overflow-x-auto bg-white dark:bg-[#081820] rounded-2xl border border-brand-teal/10 dark:border-brand-mint/20 shadow-sm">
      <table className="w-full text-left border-collapse">
        {/* Table Head */}
        <thead>
          <tr className="bg-brand-teal/5 dark:bg-brand-mint/5 border-b border-brand-teal/10 dark:border-brand-mint/20">
            {columns.map((col, index) => (
              <th
                key={index}
                className="p-4 text-xs font-black uppercase tracking-widest text-brand-dark/70 dark:text-brand-beige/70 whitespace-nowrap"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>

        {/* Table Body */}
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="p-8 text-center text-brand-dark/50 dark:text-brand-beige/50 font-bold"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="border-b border-brand-teal/5 dark:border-brand-mint/10 hover:bg-brand-teal/5 dark:hover:bg-brand-mint/5 transition-colors last:border-0"
              >
                {columns.map((col, colIndex) => (
                  <td
                    key={colIndex}
                    className="p-4 text-sm font-medium text-brand-dark dark:text-brand-beige whitespace-nowrap"
                  >
                    {/* 
                      If the column has a custom 'render' function (like formatting a date or adding a button), use it. 
                      Otherwise, just display the raw text using the accessor key. 
                    */}
                    {col.render ? col.render(row) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
