import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { CheckSquare, FileText, User, LogOut, ClipboardList, CheckCircle2, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { getAllEmployeeDashboardStats, EmployeeDashboardStats } from "../../api/employeeDashboard";

/**
 * EmployeeDashboard — GearSync (dark / glass / neon)
 * - Matches Admin/Customer neon-glass aesthetic
 * - Pure UI refactor; original logic intact
 */

const ACCENT_GRADIENT = "bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400";
const CARD =
  "rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_10px_40px_-12px_rgba(0,0,0,0.6)]";
const BTN =
  "inline-flex items-center gap-2 rounded-xl px-4 py-2 ring-1 ring-white/10 bg-white/5 hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70";

const EmployeeDashboard: React.FC = () => {
  const { logout, role } = useContext(AuthContext)!;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<EmployeeDashboardStats | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const dashboardStats = await getAllEmployeeDashboardStats();
        setStats(dashboardStats);
      } catch (error) {
        console.error("Error fetching employee dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const statCards = stats
    ? [
        { title: "Assigned Appointments", value: stats.assignedAppointments, icon: ClipboardList, tone: "text-cyan-300" },
        { title: "Completed Appointments", value: stats.completedAppointments, icon: CheckCircle2, tone: "text-emerald-300" },
        { title: "Ongoing Appointments", value: stats.ongoingAppointments, icon: Clock, tone: "text-amber-300" },
      ]
    : [];

  if (loading) {
    return (
      <div className="relative min-h-screen text-white flex items-center justify-center">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />
        </div>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto"></div>
          <p className="mt-4 text-slate-300">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen text-white">
      {/* Backdrop */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />
        <div
          className="pointer-events-none absolute -top-40 left-1/2 h-[60rem] w-[60rem] -translate-x-1/2 rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(closest-side, rgba(34,211,238,0.35), transparent 70%)" }}
        />
        <div
          className="pointer-events-none absolute top-1/3 right-[-20%] h-[40rem] w-[40rem] rounded-full opacity-15 blur-3xl"
          style={{ background: "radial-gradient(closest-side, rgba(99,102,241,0.35), transparent 70%)" }}
        />
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <main className="mx-auto max-w-6xl px-6 py-10 space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${ACCENT_GRADIENT} text-slate-950 ring-1 ring-white/10`}>
              <User className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">Welcome, {role}</h1>
              <p className="text-slate-300/90 mt-1">
                Manage your tasks, view reports, and update your profile efficiently.
              </p>
            </div>
          </div>
          <button onClick={handleLogout} className={BTN}>
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {statCards.map(({ title, value, icon: Icon, tone }) => (
            <motion.div
              key={title}
              className={`${CARD} p-5`}
              whileHover={{ y: -2 }}
              transition={{ type: "spring", stiffness: 250, damping: 20 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-300/90 text-sm">{title}</p>
                  <p className="text-3xl font-extrabold tracking-tight text-cyan-300">{value}</p>
                </div>
                <div className={`w-10 h-10 grid place-items-center rounded-xl ring-1 ring-white/10 bg-white/5 ${tone}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <section className={`${CARD} p-6`}>
            <div className="flex items-center gap-2 mb-2">
              <ClipboardList className="w-5 h-5 text-cyan-300" />
              <h2 className="text-lg font-semibold">Assignment Overview</h2>
            </div>
            <p className="text-sm text-slate-300/90">
              View your assigned appointments, their progress, and pending work.
            </p>
            {stats && (
              <div className="mt-4 space-y-2">
                <div className="border border-white/10 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-300">Total Assigned</span>
                    <span className="text-lg font-bold text-cyan-300">{stats.assignedAppointments}</span>
                  </div>
                </div>
                <div className="border border-white/10 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-300">In Progress</span>
                    <span className="text-lg font-bold text-amber-300">{stats.ongoingAppointments}</span>
                  </div>
                </div>
              </div>
            )}
          </section>

          <section className={`${CARD} p-6`}>
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-300" />
              <h2 className="text-lg font-semibold">Performance Summary</h2>
            </div>
            <p className="text-sm text-slate-300/90">
              Track your completed work and performance metrics.
            </p>
            {stats && (
              <div className="mt-4 space-y-2">
                <div className="border border-white/10 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-300">Completed</span>
                    <span className="text-lg font-bold text-emerald-300">{stats.completedAppointments}</span>
                  </div>
                </div>
                <div className="border border-white/10 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-300">Completion Rate</span>
                    <span className="text-lg font-bold text-cyan-300">
                      {stats.assignedAppointments > 0 
                        ? `${((stats.completedAppointments / stats.assignedAppointments) * 100).toFixed(1)}%`
                        : "0%"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default EmployeeDashboard;