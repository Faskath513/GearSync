import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC = () => {
    const { role, logout } = useContext(AuthContext)!;

    return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
        <Sidebar role={role as "employee" | "customer" | "admin"} handleLogout={logout} />
        <main className="flex-1 p-8 overflow-auto relative z-10">
        <Outlet />
        </main>
    </div>
    );
};

export default Layout;
