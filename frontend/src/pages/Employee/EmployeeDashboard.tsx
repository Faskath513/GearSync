import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { CheckSquare, FileText } from "lucide-react";
import { listAssignedAppointments, listAssignedProjects } from "../../api/employee";

const EmployeeDashboard: React.FC = () => {
  const { logout, role } = useContext(AuthContext)!;
  const navigate = useNavigate();

  const [assignedAppointments, setAssignedAppointments] = useState<any[]>([]);
  const [assignedProjects, setAssignedProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  useEffect(() => {
    (async () => {
      try {
        const [apps, projs] = await Promise.all([
          listAssignedAppointments().catch(() => []),
          listAssignedProjects().catch(() => []),
        ]);
        setAssignedAppointments(apps || []);
        setAssignedProjects(projs || []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const totalAssigned = assignedAppointments.length + assignedProjects.length;
  const completedCount = [...assignedAppointments, ...assignedProjects].filter((x: any) => (x?.status || "").toLowerCase() === "completed").length;
  const pendingCount = [...assignedAppointments, ...assignedProjects].filter((x: any) => (x?.status || "").toLowerCase() === "pending").length;
  const stats = [
    { title: "Assigned Items", value: totalAssigned, color: "from-purple-400 to-indigo-500", icon: <CheckSquare className="w-6 h-6" /> },
    { title: "Completed", value: completedCount, color: "from-green-400 to-teal-500", icon: <CheckSquare className="w-6 h-6" /> },
    { title: "Pending", value: pendingCount, color: "from-yellow-400 to-orange-400", icon: <FileText className="w-6 h-6" /> },
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
          {(loading ? [
            { title: "Assigned Items", value: "-", color: "from-purple-400 to-indigo-500", icon: <CheckSquare className="w-6 h-6" /> },
            { title: "Completed", value: "-", color: "from-green-400 to-teal-500", icon: <CheckSquare className="w-6 h-6" /> },
            { title: "Pending", value: "-", color: "from-yellow-400 to-orange-400", icon: <FileText className="w-6 h-6" /> },
          ] : stats).map((stat, idx) => (
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

        {/* Quick Lists */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl text-white">
            <h2 className="font-bold text-xl mb-4">Assigned Appointments</h2>
            {loading ? (
              <p className="text-gray-300 text-sm">Loading...</p>
            ) : assignedAppointments.length === 0 ? (
              <p className="text-gray-300 text-sm">No appointments assigned.</p>
            ) : (
              <ul className="space-y-2">
                {assignedAppointments.slice(0, 5).map((a: any) => (
                  <li key={a.id} className="flex items-center justify-between">
                    <span className="text-sm">#{a.id} • {(a.status || "").toString()}</span>
                    <button onClick={() => navigate(`/employee/appointments/${a.id}`)} className="text-indigo-200 hover:text-white text-sm">View</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl text-white">
            <h2 className="font-bold text-xl mb-4">Assigned Projects</h2>
            {loading ? (
              <p className="text-gray-300 text-sm">Loading...</p>
            ) : assignedProjects.length === 0 ? (
              <p className="text-gray-300 text-sm">No projects assigned.</p>
            ) : (
              <ul className="space-y-2">
                {assignedProjects.slice(0, 5).map((p: any) => (
                  <li key={p.id} className="flex items-center justify-between">
                    <span className="text-sm">#{p.id} • {(p.status || "").toString()}</span>
                    <button onClick={() => navigate(`/employee/projects/${p.id}`)} className="text-indigo-200 hover:text-white text-sm">View</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default EmployeeDashboard;