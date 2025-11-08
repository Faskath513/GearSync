// src/pages/Customer/ServiceHistory.tsx
import React, { useEffect, useState } from "react";
import { Clock, Calendar, Wrench, Car, Receipt, Loader2 } from "lucide-react";
import { listMyAppointments, MyAppointmentDTO } from "../../api/appointments";

/** ---- Theme tokens (match Admin/UserManagement glass) ---- */
const ACCENT_GRADIENT =
  "bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400";
const CARD =
  "rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_10px_40px_-12px_rgba(0,0,0,0.6)]";
const INPUT =
  "w-full rounded-xl bg-white/5 text-white placeholder:text-slate-400 px-3 py-2.5 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-300/70";
const MUTED = "text-slate-300/90";

const ServiceHistory: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [allAppointments, setAllAppointments] = useState<MyAppointmentDTO[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<MyAppointmentDTO[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState("all");
  const [selectedDate, setSelectedDate] = useState("all");

  // Fetch appointments on mount
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const appointments = await listMyAppointments();
        // Filter only completed appointments
        const completed = appointments.filter(
          (apt) => apt.status === "COMPLETED"
        );
        setAllAppointments(completed);
        setFilteredHistory(completed);
      } catch (error) {
        console.error("Error fetching service history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...allAppointments];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (apt) =>
          apt.services?.some((s) =>
            s.serviceName.toLowerCase().includes(query)
          ) ||
          apt.vehicle?.make.toLowerCase().includes(query) ||
          apt.vehicle?.model.toLowerCase().includes(query) ||
          apt.customerNotes?.toLowerCase().includes(query)
      );
    }

    // Vehicle filter
    if (selectedVehicle !== "all") {
      filtered = filtered.filter(
        (apt) => apt.vehicle?.id.toString() === selectedVehicle
      );
    }

    // Date filter
    if (selectedDate !== "all") {
      const now = new Date();
      filtered = filtered.filter((apt) => {
        const aptDate = new Date(apt.scheduledDateTime);
        if (selectedDate === "30days") {
          const thirtyDaysAgo = new Date(now);
          thirtyDaysAgo.setDate(now.getDate() - 30);
          return aptDate >= thirtyDaysAgo;
        } else if (selectedDate === "thisyear") {
          return aptDate.getFullYear() === now.getFullYear();
        } else if (selectedDate === "lastyear") {
          return aptDate.getFullYear() === now.getFullYear() - 1;
        }
        return true;
      });
    }

    setFilteredHistory(filtered);
  }, [searchQuery, selectedVehicle, selectedDate, allAppointments]);

  // Get unique vehicles for filter dropdown
  const uniqueVehicles = Array.from(
    new Map(
      allAppointments
        .filter((apt) => apt.vehicle)
        .map((apt) => [apt.vehicle!.id, apt.vehicle!])
    ).values()
  );

  return (
    <div className="relative text-white">
      <Backdrop />

      <main className="mx-auto max-w-5xl px-6 py-10 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-xl ${ACCENT_GRADIENT} text-slate-950 ring-1 ring-white/10`}
            >
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                Service History
              </h1>
              <p className={`${MUTED} text-sm`}>
                View your past service records
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <section className={`${CARD} p-5`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <input
                className={INPUT}
                placeholder="Search by service, vehicle, notes…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                ⌘K
              </div>
            </div>
            <select
              className={`${INPUT} appearance-none`}
              value={selectedVehicle}
              onChange={(e) => setSelectedVehicle(e.target.value)}
            >
              <option value="all" className="bg-slate-900">
                All Vehicles
              </option>
              {uniqueVehicles.map((vehicle) => (
                <option
                  key={vehicle.id}
                  value={vehicle.id}
                  className="bg-slate-900"
                >
                  {vehicle.make} {vehicle.model} ({vehicle.year})
                </option>
              ))}
            </select>
            <select
              className={`${INPUT} appearance-none`}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            >
              <option value="all" className="bg-slate-900">
                Any Date
              </option>
              <option value="30days" className="bg-slate-900">
                Last 30 days
              </option>
              <option value="thisyear" className="bg-slate-900">
                This year
              </option>
              <option value="lastyear" className="bg-slate-900">
                Last year
              </option>
            </select>
          </div>
        </section>

        {/* List / Empty State */}
        <section className={`${CARD} overflow-hidden`}>
          {loading ? (
            <div className="p-14 text-center">
              <Loader2 className="w-10 h-10 animate-spin text-cyan-300 mx-auto mb-4" />
              <p className="text-lg font-semibold">Loading service history...</p>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="p-14 text-center">
              <div className="mx-auto w-16 h-16 rounded-2xl ring-1 ring-white/10 bg-white/5 grid place-items-center mb-4">
                <Clock className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-lg font-semibold">
                {allAppointments.length === 0
                  ? "No service history yet"
                  : "No results found"}
              </p>
              <p className={`${MUTED} mt-1`}>
                {allAppointments.length === 0
                  ? "Completed services will show up here. Once you finish a job, you'll see invoice, parts and notes."
                  : "Try adjusting your search or filter criteria."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-white/5">
                  <tr className="text-left">
                    {["Date", "Vehicle", "Services", "Total", "Notes"].map(
                      (h) => (
                        <th
                          key={h}
                          className="px-6 py-3 font-semibold text-slate-300/90"
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {filteredHistory.map((row) => (
                    <tr key={row.id} className="hover:bg-white/5">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-white/5 ring-1 ring-white/10 grid place-items-center">
                            <Calendar className="w-4 h-4 text-slate-300" />
                          </div>
                          <div>
                            <div className="font-medium text-white">
                              {new Date(row.scheduledDateTime).toLocaleDateString()}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {new Date(row.scheduledDateTime).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-white/5 ring-1 ring-white/10 grid place-items-center">
                            <Car className="w-4 h-4 text-slate-300" />
                          </div>
                          <div className="text-white">
                            {row.vehicle?.make} {row.vehicle?.model}{" "}
                            {row.vehicle?.year ? `(${row.vehicle.year})` : ""}
                            {row.vehicle?.registrationNumber
                              ? ` • ${row.vehicle.registrationNumber}`
                              : ""}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          {row.services && row.services.length > 0 ? (
                            row.services.map((s) => (
                              <span
                                key={s.id}
                                className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-cyan-500/10 text-cyan-300 ring-1 ring-cyan-300/20"
                              >
                                <Wrench className="w-3 h-3" />
                                {s.serviceName}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400 text-xs">
                              No services listed
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-emerald-300 font-semibold">
                          <Receipt className="w-4 h-4" />
                          {row.finalCost != null
                            ? `$${row.finalCost.toFixed(2)}`
                            : "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`${MUTED} line-clamp-2 max-w-xs`}>
                          {row.customerNotes || "No notes provided"}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between text-sm">
                <p className={MUTED}>
                  Showing{" "}
                  <span className="text-white">{filteredHistory.length}</span>{" "}
                  of <span className="text-white">{allAppointments.length}</span>{" "}
                  completed service{allAppointments.length !== 1 ? "s" : ""}
                </p>
                {filteredHistory.length > 10 && (
                  <div className="flex gap-2">
                    <button className="px-3 py-1.5 rounded-xl bg-white/5 ring-1 ring-white/10 hover:bg-white/10 transition-colors">
                      Previous
                    </button>
                    <button
                      className={`px-3 py-1.5 rounded-xl ${ACCENT_GRADIENT} text-slate-950 ring-1 ring-white/10`}
                    >
                      1
                    </button>
                    <button className="px-3 py-1.5 rounded-xl bg-white/5 ring-1 ring-white/10 hover:bg-white/10 transition-colors">
                      Next
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default ServiceHistory;

/** ----- Backdrop (shared with Admin look) ----- */
const Backdrop = () => (
  <div className="absolute inset-0 -z-10">
    <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />
    <div
      className="pointer-events-none absolute -top-40 left-1/2 h-[60rem] w-[60rem] -translate-x-1/2 rounded-full opacity-20 blur-3xl"
      style={{
        background:
          "radial-gradient(closest-side, rgba(34,211,238,0.35), transparent 70%)",
      }}
    />
    <div
      className="pointer-events-none absolute top-1/3 right-[-20%] h-[40rem] w-[40rem] rounded-full opacity-15 blur-3xl"
      style={{
        background:
          "radial-gradient(closest-side, rgba(99,102,241,0.35), transparent 70%)",
      }}
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
);