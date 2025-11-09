import React, { useEffect, useMemo, useState } from "react";
import { Clock, Plus, Edit, Trash2, X, Calendar, Timer, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  listMyTimeLogs,
  listAssignedProjects,
  listAssignedAppointments,
  createTimeLog as apiCreateTimeLog,
  updateTimeLog as apiUpdateTimeLog,
  deleteTimeLog as apiDeleteTimeLog,
} from "@/api/employee";
import type {
  TimeLogDTO,
  AssignedProjectDTO,
  AssignedAppointmentDTO,
  TimeLogRequestDTO,
} from "@/api/employee";

/* ---------------------- Theme tokens ---------------------- */
const ACCENT_GRADIENT =
  "bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400";
const CARD =
  "rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_10px_40px_-12px_rgba(0,0,0,0.6)]";
const BTN_BASE =
  "inline-flex items-center gap-2 rounded-xl px-4 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 focus-visible:ring-offset-0 ring-1 ring-white/10";
const INPUT =
  "w-full rounded-xl bg-white/5 text-white placeholder:text-slate-400 px-3 py-2.5 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-300/70";

/* ---------------------- Form types ---------------------- */
interface TimeLogFormData {
  workDate: string;   // YYYY-MM-DD
  startTime: string;  // HH:mm
  endTime: string;    // HH:mm
  projectId: string;
  appointmentId: string;
  workDescription: string;
  notes: string;
}

/* ---------------------- Helpers ---------------------- */
const toHHMM = (d: Date) =>
  `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

const todayDateStr = () => new Date().toISOString().split("T")[0];
const isToday = (yyyyMMdd: string) => yyyyMMdd === todayDateStr();
const now = () => new Date();

const normalizeError = (e: any, fallback = "Request failed") => {
  const data = e?.response?.data ?? e?.message ?? e;
  if (typeof data === "string") return data;
  if (Array.isArray(data)) {
    // Spring @Valid often returns a list of messages
    return data.map((x) => (typeof x === "string" ? x : JSON.stringify(x))).join("\n");
  }
  if (data?.message) return data.message;
  try {
    return JSON.stringify(data);
  } catch {
    return fallback;
  }
};

const clampToNowIfToday = (draft: TimeLogFormData) => {
  if (!isToday(draft.workDate)) return draft;
  const nowStr = toHHMM(now());
  if (draft.endTime > nowStr) draft.endTime = nowStr;
  if (draft.startTime > nowStr) draft.startTime = nowStr;
  if (draft.startTime > draft.endTime) draft.startTime = draft.endTime;
  return draft;
};

/* ========================================================
 *                       Component
 * ====================================================== */
const TimeLogs: React.FC = () => {
  // Data
  const [timeLogs, setTimeLogs] = useState<TimeLogDTO[]>([]);
  const [projects, setProjects] = useState<AssignedProjectDTO[]>([]);
  const [appointments, setAppointments] = useState<AssignedAppointmentDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // UI state
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedLog, setSelectedLog] = useState<TimeLogDTO | null>(null);

  // Better defaults: now-10min → now
  const initEnd = now();
  const initStart = new Date(initEnd.getTime() - 10 * 60 * 1000);

  const [formData, setFormData] = useState<TimeLogFormData>({
    workDate: todayDateStr(),
    startTime: toHHMM(initStart),
    endTime: toHHMM(initEnd),
    projectId: "",
    appointmentId: "",
    workDescription: "",
    notes: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof TimeLogFormData, string>>>({});

  /* ---------------------- Fetch ---------------------- */
  const refreshLogs = async () => {
    const logs = await listMyTimeLogs();
    setTimeLogs(Array.isArray(logs) ? logs : []);
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [logs, proj, appt] = await Promise.all([
          listMyTimeLogs(),
          listAssignedProjects(),
          listAssignedAppointments(),
        ]);
        setTimeLogs(Array.isArray(logs) ? logs : []);
        setProjects(Array.isArray(proj) ? proj : []);
        setAppointments(Array.isArray(appt) ? appt : []);
        setErr(null);
      } catch (e: any) {
        setErr(normalizeError(e, "Failed to load time logs"));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ---------------------- Derived ---------------------- */
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return timeLogs;
    return timeLogs.filter((l) => {
      const bag = [
        l.projectName ?? "",
        l.appointmentDescription ?? "",
        l.workDescription ?? "",
        l.notes ?? "",
        new Date(l.startTime).toLocaleDateString(),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return bag.includes(q);
    });
  }, [timeLogs, search]);

  const stats = useMemo(() => {
    const totalH = timeLogs.reduce((s, l) => s + l.durationMinutes / 60, 0);
    const today = new Date().toDateString();
    const todayH = timeLogs
      .filter((l) => new Date(l.startTime).toDateString() === today)
      .reduce((s, l) => s + l.durationMinutes / 60, 0);

    const weekStart = new Date();
    weekStart.setHours(0, 0, 0, 0);
    const d = weekStart.getDay(); // 0=Sun
    weekStart.setDate(weekStart.getDate() - d);
    const weekH = timeLogs
      .filter((l) => new Date(l.startTime) >= weekStart)
      .reduce((s, l) => s + l.durationMinutes / 60, 0);

    return {
      total: totalH.toFixed(1),
      thisWeek: weekH.toFixed(1),
      today: todayH.toFixed(1),
    };
  }, [timeLogs]);

  /* ---------------------- Helpers ---------------------- */
  const appointmentLabel = (a: AssignedAppointmentDTO) => {
    const plate = a.vehicleRegistrationNumber;
    const when = a.scheduledDateTime;
    if (plate && when) return `${plate} — ${new Date(when).toLocaleString()}`;
    if (plate) return plate;
    if (when) return new Date(when).toLocaleString();
    return `Appointment #${a.id}`;
  };

  const validate = () => {
    const ne: Partial<Record<keyof TimeLogFormData, string>> = {};
    if (!formData.workDate) ne.workDate = "Work date is required";
    if (!formData.startTime) ne.startTime = "Start time is required";
    if (!formData.endTime) ne.endTime = "End time is required";

    const start = new Date(`${formData.workDate}T${formData.startTime}:00`);
    const end = new Date(`${formData.workDate}T${formData.endTime}:00`);
    const nowD = now();

    if (end <= start) ne.endTime = "End time must be after start time";
    if (start > nowD) ne.startTime = "Start time cannot be in the future";
    if (end > nowD) ne.endTime = "End time cannot be in the future";

    if (!formData.projectId && !formData.appointmentId) {
      ne.projectId = "Pick a Project or an Appointment";
    }
    if (formData.projectId && formData.appointmentId) {
      ne.appointmentId = "Can't select both";
    }

    const desc = formData.workDescription.trim();
    if (!desc) ne.workDescription = "Description is required";
    else if (desc.length < 10) ne.workDescription = "Minimum 10 characters";

    setErrors(ne);
    return Object.keys(ne).length === 0;
  };

  /* ---------------------- CRUD ---------------------- */
  const openModal = (log?: TimeLogDTO) => {
    if (log) {
      setEditMode(true);
      setSelectedLog(log);
      const s = new Date(log.startTime);
      const e = new Date(log.endTime);
      const pad = (n: number) => String(n).padStart(2, "0");
      setFormData(
        clampToNowIfToday({
          workDate: s.toISOString().split("T")[0],
          startTime: `${pad(s.getHours())}:${pad(s.getMinutes())}`,
          endTime: `${pad(e.getHours())}:${pad(e.getMinutes())}`,
          projectId: log.projectId ? String(log.projectId) : "",
          appointmentId: log.appointmentId ? String(log.appointmentId) : "",
          workDescription: log.workDescription || "",
          notes: log.notes || "",
        })
      );
    } else {
      setEditMode(false);
      setSelectedLog(null);
      setFormData({
        workDate: todayDateStr(),
        startTime: toHHMM(new Date(now().getTime() - 10 * 60 * 1000)),
        endTime: toHHMM(now()),
        projectId: "",
        appointmentId: "",
        workDescription: "",
        notes: "",
      });
    }
    setErrors({});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditMode(false);
    setSelectedLog(null);
    setErrors({});
  };

  const onChangeField = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      let next = { ...prev, [name]: value } as TimeLogFormData;

      // XOR: project vs appointment
      if (name === "projectId" && value) next.appointmentId = "";
      if (name === "appointmentId" && value) next.projectId = "";

      // Clamp if today (avoid future times)
      next = clampToNowIfToday(next);

      return next;
    });
    if (errors[name as keyof TimeLogFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload: TimeLogRequestDTO = {
      startTime: `${formData.workDate}T${formData.startTime}:00`,
      endTime: `${formData.workDate}T${formData.endTime}:00`,
      workDescription: formData.workDescription.trim(),
      notes: formData.notes.trim() ? formData.notes.trim() : null,
      ...(formData.projectId ? { projectId: parseInt(formData.projectId, 10) } : {}),
      ...(formData.appointmentId ? { appointmentId: parseInt(formData.appointmentId, 10) } : {}),
    };

    try {
      if (editMode && selectedLog) {
        await apiUpdateTimeLog(selectedLog.id, payload);
      } else {
        await apiCreateTimeLog(payload);
      }
      await refreshLogs();
      closeModal();
    } catch (e: any) {
      alert(normalizeError(e, "Failed to save log"));
    }
  };

  const remove = async (id: number) => {
    if (!confirm("Delete this time log?")) return;
    try {
      await apiDeleteTimeLog(id);
      setTimeLogs((prev) => prev.filter((l) => l.id !== id));
    } catch (e: any) {
      alert(normalizeError(e, "Failed to delete log"));
    }
  };

  /* ---------------------- “Quick Add (Sample)” ---------------------- */
  const createThatOneLog = async () => {
    try {
      await apiCreateTimeLog({
        appointmentId: 5,
        startTime: "2025-11-06T16:40:00",
        endTime: "2025-11-06T16:50:00",
        workDescription:
          "Performed routine maintenance including oil change, filter replacement, and brake inspection",
        notes:
          "Customer requested extra attention to brake system due to recent noise",
      });
      await refreshLogs();
      alert("Sample time log created successfully.");
    } catch (e: any) {
      alert(normalizeError(e, "Failed to create the time log"));
    }
  };

  /* ---------------------- UI ---------------------- */
  return (
    <div className="relative text-white">
      {/* Backdrop */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-900/80 to-slate-950/80" />
        <div
          className="pointer-events-none absolute -top-40 left-1/2 h-[50rem] w-[50rem] -translate-x-1/2 rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(closest-side, rgba(34,211,238,0.35), transparent 70%)" }}
        />
        <div
          className="pointer-events-none absolute top-1/3 right-[-20%] h-[40rem] w-[40rem] rounded-full opacity-15 blur-3xl"
          style={{ background: "radial-gradient(closest-side, rgba(99,102,241,0.35), transparent 70%)" }}
        />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${ACCENT_GRADIENT} text-slate-950 ring-1 ring-white/10`}>
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Time Logs</h1>
            <p className="text-slate-300/90 text-sm">Track your work hours</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={createThatOneLog}
            className={`${BTN_BASE} bg-white/5 hover:bg-white/10`}
            title="Create the specific sample time log"
          >
            Quick Add (Sample)
          </button>
          <button
            onClick={() => openModal()}
            className={`${BTN_BASE} ${ACCENT_GRADIENT} text-slate-950 hover:brightness-110`}
          >
            <Plus className="w-5 h-5" /> Log Time
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">
        {[
          { label: "Total Hours", value: stats.total, Icon: Clock },
          { label: "This Week", value: stats.thisWeek, Icon: Clock },
          { label: "Today", value: stats.today, Icon: Clock },
        ].map((s) => (
          <motion.div
            key={s.label}
            className={`${CARD} p-5`}
            whileHover={{ y: -2 }}
            transition={{ type: "spring", stiffness: 250, damping: 20 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-300/90 text-sm">{s.label}</p>
                <p className="text-3xl font-extrabold tracking-tight text-cyan-300">{s.value}h</p>
              </div>
              <div className="w-10 h-10 grid place-items-center rounded-xl ring-1 ring-white/10 bg-white/5">
                <s.Icon className="w-6 h-6" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className={`${CARD} p-5 mt-6`}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search description, project, appointment, date…"
            className={`${INPUT} pl-10`}
          />
        </div>
        {err ? (
          <div className="mt-3 rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-rose-200 text-sm">
            {err}
          </div>
        ) : null}
      </div>

      {/* Table */}
      <div className={`${CARD} mt-6 overflow-hidden`}>
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-cyan-300 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-slate-300/90">Loading time logs...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Clock className="w-16 h-16 text-slate-500 mx-auto mb-4" />
            <p className="text-slate-300/90">No time logs found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white/5">
                <tr className="text-left">
                  {["Date & Time", "Project / Appointment", "Work Description", "Duration", "Notes", "Actions"].map(
                    (h) => (
                      <th key={h} className="px-6 py-3 font-semibold text-slate-300/90">
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-white/5">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 grid place-items-center rounded-lg bg-white/5 ring-1 ring-white/10">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-medium text-white">
                            {new Date(log.startTime).toLocaleDateString()}
                          </div>
                          <div className="text-slate-300/90 text-xs">
                            {new Date(log.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} –{" "}
                            {new Date(log.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-white font-medium">
                        {log.projectName || log.appointmentDescription || "—"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-200">{log.workDescription}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="inline-flex items-center gap-2">
                        <Timer className="w-4 h-4 text-cyan-300" />
                        <span className="font-semibold text-cyan-200">
                          {(log.durationMinutes / 60).toFixed(1)}h
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-300/90 max-w-xs truncate">{log.notes || "—"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openModal(log)}
                          className={`${BTN_BASE} bg-white/5 hover:bg-white/10`}
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => remove(log.id)}
                          className={`${BTN_BASE} bg-white/5 hover:bg-white/10`}
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center"
          >
            <div className="absolute inset-0 bg-black/60" onClick={closeModal} />
            <motion.div
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 24, opacity: 0 }}
              className={`${CARD} relative w-full max-w-xl mx-4 max-h-[90vh] overflow-y-auto`}
            >
              {/* Header */}
              <div className="flex justify-between items-center p-5 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${ACCENT_GRADIENT} text-slate-950 ring-1 ring-white/10`}>
                    <Clock className="w-4 h-4" />
                  </div>
                  <h2 className="text-lg font-semibold">{editMode ? "Edit Time Log" : "Add Time Log"}</h2>
                </div>
                <button onClick={closeModal} className={`${BTN_BASE} bg-white/5 hover:bg-white/10`}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={save} className="p-5 space-y-4 text-white">
                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1">
                    Work Date <span className="text-rose-300">*</span>
                  </label>
                  <input
                    type="date"
                    name="workDate"
                    value={formData.workDate}
                    onChange={onChangeField}
                    max={todayDateStr()}
                    className={`${INPUT} ${errors.workDate ? "ring-rose-500/30" : ""}`}
                  />
                  {errors.workDate && <p className="text-rose-300 text-xs mt-1">{errors.workDate}</p>}
                </div>

                {/* Times */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-1">
                      Start Time <span className="text-rose-300">*</span>
                    </label>
                    <input
                      type="time"
                      name="startTime"
                      value={formData.startTime}
                      onChange={onChangeField}
                      className={`${INPUT} ${errors.startTime ? "ring-rose-500/30" : ""}`}
                    />
                    {errors.startTime && <p className="text-rose-300 text-xs mt-1">{errors.startTime}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-1">
                      End Time <span className="text-rose-300">*</span>
                    </label>
                    <input
                      type="time"
                      name="endTime"
                      value={formData.endTime}
                      onChange={onChangeField}
                      className={`${INPUT} ${errors.endTime ? "ring-rose-500/30" : ""}`}
                    />
                    {errors.endTime && <p className="text-rose-300 text-xs mt-1">{errors.endTime}</p>}
                  </div>
                </div>

                {/* Project */}
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1">Project</label>
                <select
                    name="projectId"
                    value={formData.projectId}
                    onChange={onChangeField}
                    className={`${INPUT} appearance-none ${errors.projectId ? "ring-rose-500/30" : ""}`}
                    disabled={!!formData.appointmentId}
                  >
                    <option className="bg-slate-900" value="">
                      -- Select Project --
                    </option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id} className="bg-slate-900">
                        {p.projectName || `Project #${p.id}`}
                      </option>
                    ))}
                  </select>
                  {errors.projectId && <p className="text-rose-300 text-xs mt-1">{errors.projectId}</p>}
                </div>

                {/* Appointment */}
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1">Appointment</label>
                  <select
                    name="appointmentId"
                    value={formData.appointmentId}
                    onChange={onChangeField}
                    className={`${INPUT} appearance-none ${errors.appointmentId ? "ring-rose-500/30" : ""}`}
                    disabled={!!formData.projectId}
                  >
                    <option className="bg-slate-900" value="">
                      -- Select Appointment --
                    </option>
                    {appointments.map((a) => (
                      <option key={a.id} value={a.id} className="bg-slate-900">
                        {appointmentLabel(a)}
                      </option>
                    ))}
                  </select>
                  {errors.appointmentId && <p className="text-rose-300 text-xs mt-1">{errors.appointmentId}</p>}
                  <p className="text-xs text-slate-400 mt-1">Pick either a Project or an Appointment.</p>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1">
                    Work Description <span className="text-rose-300">*</span>
                  </label>
                  <textarea
                    name="workDescription"
                    value={formData.workDescription}
                    onChange={onChangeField}
                    rows={3}
                    placeholder="Describe what you worked on…"
                    className={`${INPUT} min-h-24 ${errors.workDescription ? "ring-rose-500/30" : ""}`}
                  />
                  {errors.workDescription && (
                    <p className="text-rose-300 text-xs mt-1">{errors.workDescription}</p>
                  )}
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-1">
                    Notes (optional)
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={onChangeField}
                    rows={2}
                    placeholder="Additional context…"
                    className={`${INPUT} min-h-20`}
                  />
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className={`${BTN_BASE} bg-white/5 hover:bg-white/10`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`${BTN_BASE} ${ACCENT_GRADIENT} text-slate-950 hover:brightness-110`}
                  >
                    {editMode ? "Save Changes" : "Create Log"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TimeLogs;