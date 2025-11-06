import React from "react";
import { Outlet } from "react-router-dom";
import CustomerSidebar from "../shared/CustomerSidebar";
import Header from "../shared/Header";

const CustomerLayout: React.FC = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <CustomerSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default CustomerLayout;
