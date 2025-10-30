import React, { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Users, FileText, Settings, LogOut, BarChart2, Calendar, CheckCircle } from "lucide-react";

const AdminDashboard: React.FC = () => {
  const { logout, role } = useContext(AuthContext)!;
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

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
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500 rounded-full opacity-15 animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-purple-500 rounded-full opacity-10 animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>

      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-blue-700 to-indigo-700 text-white flex flex-col shadow-2xl z-10">
        <div className="p-6 text-2xl font-bold border-b border-blue-500">
          Admin Panel
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button
            className="w-full flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-blue-500 transition-all"
            onClick={() => navigate("/admin/users")}
          >
            <Users className="w-5 h-5" />
            User Management
          </button>
          <button
            className="w-full flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-blue-500 transition-all"
            onClick={() => navigate("/admin/reports")}
          >
            <FileText className="w-5 h-5" />
            Reports
          </button>
          <button
            className="w-full flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-blue-500 transition-all"
            onClick={() => navigate("/admin/settings")}
          >
            <Settings className="w-5 h-5" />
            Settings
          </button>
        </nav>
        <div className="p-4 border-t border-blue-500">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded-lg transition-all"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto relative z-10">
        <h1 className="text-4xl font-extrabold text-white mb-2">Welcome, {role}</h1>
        <p className="text-gray-300 mb-6">Manage users, view reports, and configure settings with style.</p>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className={`relative overflow-hidden rounded-3xl p-6 shadow-2xl border border-white/10 bg-gradient-to-r ${stat.color} text-white hover:scale-[1.03] transform transition-all duration-300`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl font-bold">{stat.value}</span>
                <div className="bg-white/20 p-3 rounded-full">
                  {stat.icon}
                </div>
              </div>
              <p className="text-sm font-semibold">{stat.title}</p>
              <div className="absolute -top-6 -right-6 w-28 h-28 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
            </div>
          ))}
        </div>

        {/* Dashboard Sections */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl text-white hover:shadow-white/20 transition-all duration-300">
            <h2 className="font-bold text-xl mb-2">Recent Activity</h2>
            <p className="text-gray-300 text-sm">View latest actions performed by users and system events.</p>
          </div>
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl text-white hover:shadow-white/20 transition-all duration-300">
            <h2 className="font-bold text-xl mb-2">Quick Links</h2>
            <p className="text-gray-300 text-sm">Access important sections of the dashboard quickly and efficiently.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;