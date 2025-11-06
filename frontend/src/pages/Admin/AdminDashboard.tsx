import React, { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import Sidebar from "../../components/Sidebar";
import { Users, BarChart2, CheckCircle } from "lucide-react";

const AdminDashboard: React.FC = () => {
  const { logout, role } = useContext(AuthContext)!;

  const stats = [
    { title: "Total Users", value: 120, color: "from-blue-500 to-indigo-500", icon: <Users className="w-6 h-6" /> },
    { title: "Active Sessions", value: 45, color: "from-green-500 to-teal-500", icon: <BarChart2 className="w-6 h-6" /> },
    { title: "Pending Requests", value: 7, color: "from-yellow-400 to-orange-500", icon: <CheckCircle className="w-6 h-6" /> },
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full opacity-20 animate-pulse"></div>
        <div
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500 rounded-full opacity-15 animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/4 w-64 h-64 bg-purple-500 rounded-full opacity-10 animate-pulse"
          style={{ animationDelay: "4s" }}
        ></div>
      </div>

      <Sidebar role={role} onLogout={logout} />

      <main className="flex-1 p-8 overflow-auto relative z-10">
        <h1 className="text-4xl font-extrabold text-white mb-2">Welcome, {role}</h1>
        <p className="text-gray-300 mb-6">Manage users, view reports, and configure settings with style.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className={`relative overflow-hidden rounded-3xl p-6 shadow-2xl border border-white/10 bg-gradient-to-r ${stat.color} text-white hover:scale-[1.03] transform transition-all duration-300`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl font-bold">{stat.value}</span>
                <div className="bg-white/20 p-3 rounded-full">{stat.icon}</div>
              </div>
              <p className="text-sm font-semibold">{stat.title}</p>
              <div className="absolute -top-6 -right-6 w-28 h-28 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
