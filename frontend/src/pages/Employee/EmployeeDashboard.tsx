import React, { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { CheckSquare, FileText, User, LogOut } from "lucide-react";

const EmployeeDashboard: React.FC = () => {
  const { logout, role } = useContext(AuthContext)!;
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const stats = [
    { title: "Assigned Tasks", value: 12, color: "from-purple-400 to-indigo-500", icon: <CheckSquare className="w-6 h-6" /> },
    { title: "Completed Tasks", value: 8, color: "from-green-400 to-teal-500", icon: <CheckSquare className="w-6 h-6" /> },
    { title: "Pending Reviews", value: 3, color: "from-yellow-400 to-orange-400", icon: <FileText className="w-6 h-6" /> },
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 relative overflow-hidden">

      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500 rounded-full opacity-15 animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-pink-500 rounded-full opacity-10 animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>


      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto relative z-10">
        <h1 className="text-4xl font-extrabold text-white mb-2">Welcome, {role}</h1>
        <p className="text-gray-300 mb-6">Manage your tasks, view reports, and update your profile efficiently.</p>

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

        {/* Quick Actions */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl text-white hover:shadow-white/20 transition-all duration-300">
            <h2 className="font-bold text-xl mb-2">Task Overview</h2>
            <p className="text-gray-300 text-sm">View your current tasks, their progress, and pending assignments.</p>
          </div>
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl text-white hover:shadow-white/20 transition-all duration-300">
            <h2 className="font-bold text-xl mb-2">Reports</h2>
            <p className="text-gray-300 text-sm">Check detailed reports of your work and team performance.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EmployeeDashboard;