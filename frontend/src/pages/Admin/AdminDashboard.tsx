import React, { useContext, useEffect, useMemo, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Calendar,
  Car,
  CheckCircle,
  DollarSign,
  BarChart2,
  Shield,
  Loader2,
} from "lucide-react";
import {
  getDashboardUserCount,
  getDashboardAppointmentCount,
  getDashboardVehicleCount,
  getDashboardTotalEarnings,
  getDashboardActiveServiceCount,
  getDashboardConfirmedAppointments,
  getDashboardTodayAppointments,
} from "../../api/admin";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
} from "recharts";

// ---- Theme tokens (align with Home) ----
const ACCENT_GRADIENT = "bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400";
const CARD =
  "rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_10px_40px_-12px_rgba(0,0,0,0.6)]";
const BTN =
  "inline-flex items-center gap-2 rounded-xl px-4 py-2 ring-1 ring-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70";

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const name = user?.firstName || user?.email || "Admin";

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    userCount: 0,
    appointmentCount: 0,
    vehicleCount: 0,
    totalEarnings: 0,
    activeServiceCount: 0,
    confirmedAppointmentsCount: 0,
    todayAppointmentsCount: 0,
  });

  // --- Local demo series (replace with API series when available) ---
  const [range, setRange] = useState<7 | 30>(7);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [
          userCount,
          appointmentCount,
          vehicleCount,
          totalEarnings,
          activeServiceCount,
          confirmedAppointments,
          todayAppointments,
        ] = await Promise.all([
          getDashboardUserCount().catch((err) => {
            console.error("Error fetching user count:", err);
            return 0;
          }),
          getDashboardAppointmentCount().catch((err) => {
            console.error("Error fetching appointment count:", err);
            return 0;
          }),
          getDashboardVehicleCount().catch((err) => {
            console.error("Error fetching vehicle count:", err);
            return 0;
          }),
          getDashboardTotalEarnings().catch((err) => {
            console.error("Error fetching total earnings:", err);
            return 0;
          }),
          getDashboardActiveServiceCount().catch((err) => {
            console.error("Error fetching active service count:", err);
            return 0;
          }),
          getDashboardConfirmedAppointments().catch((err) => {
            console.error("Error fetching confirmed appointments:", err);
            return [];
          }),
          getDashboardTodayAppointments().catch((err) => {
            console.error("Error fetching today appointments:", err);
            return [];
          }),
        ]);

        console.log("Dashboard data received:", {
          userCount,
          appointmentCount,
          vehicleCount,
          totalEarnings,
          activeServiceCount,
          confirmedAppointments,
          todayAppointments,
        });

        setStats({
          userCount: Number(userCount) || 0,
          appointmentCount: Number(appointmentCount) || 0,
          vehicleCount: Number(vehicleCount) || 0,
          totalEarnings: Number(totalEarnings) || 0,
          activeServiceCount: Number(activeServiceCount) || 0,
          confirmedAppointmentsCount: (confirmedAppointments as any[])?.length || 0,
          todayAppointmentsCount: (todayAppointments as any[])?.length || 0,
        });
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const nf = useMemo(() => new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }), []);
  const cf = useMemo(() => new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }), []);

  const cards = [
    { label: "Total Users", value: nf.format(stats.userCount), icon: Users },
    { label: "Total Appointments", value: nf.format(stats.appointmentCount), icon: Calendar },
    { label: "Total Vehicles", value: nf.format(stats.vehicleCount), icon: Car },
    { label: "Active Services", value: nf.format(stats.activeServiceCount), icon: BarChart2 },
    { label: "Confirmed Today", value: nf.format(stats.todayAppointmentsCount), icon: CheckCircle },
    { label: "Total Earnings", value: cf.format(stats.totalEarnings), icon: DollarSign },
  ];

  // ---------- Chart Data Builders (replace with real API series) ----------
  // Creates a soft trend from totals so charts look useful until server series is added.
  const buildAppointmentsSeries = (days: number) => {
    const total = Math.max(0, stats.appointmentCount);
    const today = Math.max(0, stats.todayAppointmentsCount);
    // create a gentle curve ending at today's count
    const base = Math.max(1, Math.floor(total / days));
    return Array.from({ length: days }, (_, i) => {
      const dayIndex = i - (days - 1);
      const label = new Date(Date.now() + dayIndex * 24 * 3600 * 1000)
        .toLocaleDateString(undefined, { month: "short", day: "2-digit" });
      const value = Math.max(0, Math.round(base * (0.6 + (i / days) * 0.8)));
      return { day: label, appointments: i === days - 1 ? today : value };
    });
  };

  const buildStatusPie = () => {
    const confirmed = stats.confirmedAppointmentsCount;
    const other = Math.max(0, stats.appointmentCount - confirmed);
    return [
      { name: "Confirmed", value: confirmed },
      { name: "Other", value: other },
    ];
  };

  const series = useMemo(() => buildAppointmentsSeries(range), [stats.appointmentCount, stats.todayAppointmentsCount, range]);
  const pie = useMemo(() => buildStatusPie(), [stats.confirmedAppointmentsCount, stats.appointmentCount]);

  const COLORS = ["#22d3ee", "#a78bfa", "#34d399", "#f472b6", "#fbbf24"]; // matches accent palette

  return (
    <div className="relative min-h-screen text-white overflow-hidden">
      {/* Backdrop like Home: gradient, radial glows, subtle grid */}
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

      {/* Page container */}
      <main className="mx-auto max-w-7xl px-6 py-10">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${ACCENT_GRADIENT} text-slate-950 ring-1 ring-white/10`}>
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Welcome, {name}</h1>
              <p className="text-slate-300/90 text-sm">Manage users, appointments, vehicles, and revenue at a glance.</p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <button className={`${BTN} bg-white/5 hover:bg-white/10`} onClick={() => navigate("/admin/appointments")}>Appointments</button>
            <button className={`${BTN} bg-white/5 hover:bg-white/10`} onClick={() => navigate("/admin/projects")}>Projects</button>
            <button className={`${BTN} ${ACCENT_GRADIENT} text-slate-950 hover:brightness-110`} onClick={() => navigate("/admin/services")}>Services</button>
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex items-center justify-center h-72">
            <Loader2 className="w-10 h-10 animate-spin text-cyan-300" />
          </div>
        ) : (
          <>
            {/* Stat Cards */}
            <section className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {cards.map(({ label, value, icon: Icon }, i) => (
                <motion.div
                  key={label}
                  className={`${CARD} p-6`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: i * 0.05 }}
                  whileHover={{ y: -3 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-extrabold tracking-tight text-cyan-300">{value}</div>
                      <div className="mt-1 text-slate-300/90 text-sm">{label}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-white/5 ring-1 ring-white/10">
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </section>

            {/* Charts Row */}
            <section className="mt-10 grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Area Chart */}
              <div className={`xl:col-span-2 ${CARD} p-6`}>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${ACCENT_GRADIENT} text-slate-950 ring-1 ring-white/10`}>
                      <Calendar className="w-5 h-5" />
                    </div>
                    <h2 className="text-lg font-semibold">Appointments Trend</h2>
                    <span className="text-slate-400 text-sm">(derived locally)</span>
                  </div>
                  <div className="inline-flex items-center gap-2 bg-white/5 ring-1 ring-white/10 rounded-xl p-1">
                    <button
                      onClick={() => setRange(7)}
                      className={`px-3 py-1 rounded-lg text-sm ${range === 7 ? "bg-white/10" : "hover:bg-white/5"}`}
                    >
                      7d
                    </button>
                    <button
                      onClick={() => setRange(30)}
                      className={`px-3 py-1 rounded-lg text-sm ${range === 30 ? "bg-white/10" : "hover:bg-white/5"}`}
                    >
                      30d
                    </button>
                  </div>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={series} margin={{ left: 8, right: 8, top: 10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorAppointments" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="day" tick={{ fill: "#cbd5e1" }} tickLine={false} axisLine={{ stroke: "#475569" }} />
                      <YAxis tick={{ fill: "#cbd5e1" }} tickLine={false} axisLine={{ stroke: "#475569" }} allowDecimals={false} />
                      <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#e2e8f0" }} />
                      <Area type="monotone" dataKey="appointments" stroke="#22d3ee" fillOpacity={1} fill="url(#colorAppointments)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Pie Chart */}
              <div className={`${CARD} p-6`}>
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-xl ${ACCENT_GRADIENT} text-slate-950 ring-1 ring-white/10`}>
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <h2 className="text-lg font-semibold">Appointment Status Split</h2>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pie} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={4}>
                        {pie.map((_, idx) => (
                          <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend wrapperStyle={{ color: "#cbd5e1" }} />
                      <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#e2e8f0" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </section>

            {/* Secondary Panels */}
            <section className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={`${CARD} p-6`}>
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-xl ${ACCENT_GRADIENT} text-slate-950 ring-1 ring-white/10`}>
                    <Calendar className="w-5 h-5" />
                  </div>
                  <h2 className="text-lg font-semibold">Today's Appointments</h2>
                </div>
                <p className="text-slate-300/90 text-sm">
                  {stats.todayAppointmentsCount} appointment{stats.todayAppointmentsCount !== 1 ? "s" : ""} scheduled for today.
                </p>
                <div className="mt-4 h-2 w-full rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-300 to-indigo-300"
                    style={{ width: `${Math.min(100, stats.todayAppointmentsCount * 10)}%` }}
                  />
                </div>
              </div>

              <div className={`${CARD} p-6`}>
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-xl ${ACCENT_GRADIENT} text-slate-950 ring-1 ring-white/10`}>
                    <BarChart2 className="w-5 h-5" />
                  </div>
                  <h2 className="text-lg font-semibold">Quick Stats</h2>
                </div>
                <p className="text-slate-300/90 text-sm">
                  {stats.confirmedAppointmentsCount} confirmed appointment{stats.confirmedAppointmentsCount !== 1 ? "s" : ""} pending completion.
                </p>
                <ul className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <li className="rounded-xl bg-white/5 ring-1 ring-white/10 p-3">
                    <div className="text-slate-400">Active services</div>
                    <div className="text-white font-semibold">{nf.format(stats.activeServiceCount)}</div>
                  </li>
                  <li className="rounded-xl bg-white/5 ring-1 ring-white/10 p-3">
                    <div className="text-slate-400">Vehicles</div>
                    <div className="text-white font-semibold">{nf.format(stats.vehicleCount)}</div>
                  </li>
                  <li className="rounded-xl bg-white/5 ring-1 ring-white/10 p-3">
                    <div className="text-slate-400">Users</div>
                    <div className="text-white font-semibold">{nf.format(stats.userCount)}</div>
                  </li>
                  <li className="rounded-xl bg-white/5 ring-1 ring-white/10 p-3">
                    <div className="text-slate-400">Revenue</div>
                    <div className="text-white font-semibold">{cf.format(stats.totalEarnings)}</div>
                  </li>
                </ul>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;