import React from "react";
import Header from "../components/Header";
import AppLayout from "./AppLayout";

const AdminLayout = ({ children }) => {
  return (
    <AppLayout>
      <Header />

      <div className="flex-1 w-full overflow-y-auto">
        <main className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8">{children}</main>
      </div>
    </AppLayout>
  );
};

export default AdminLayout;
