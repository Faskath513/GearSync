import React from "react";
import { Calendar, Plus, Clock, Car } from "lucide-react";
import { listMyAppointments, MyAppointmentDTO, deleteMyAppointment, cancelMyAppointment, updateMyAppointment, bookAppointment, getMyAppointment } from "../../api/appointments";
import useApi from "../../hooks/useApi";
import { listAllServices } from "../../api/services";
import { listMyVehicles } from "../../api/vehicles";

const MyAppointments: React.FC = () => {
  const { data: appointments, loading, error, refetch } = useApi<MyAppointmentDTO[]>(() => listMyAppointments(), []);
  const [showModal, setShowModal] = React.useState(false);
  const [editApp, setEditApp] = React.useState<MyAppointmentDTO | null>(null);
  const [form, setForm] = React.useState<any>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);

  // fetch vehicles and services for dropdowns
  const { data: services } = useApi(() => listAllServices(), []);
  const { data: myVehicles } = useApi(() => listMyVehicles(), []);

  const openBook = () => {
    setEditApp(null);
    setForm({
      vehicleId: myVehicles && myVehicles.length ? myVehicles[0].id : undefined,
      serviceId: services && services.length ? services[0].id : undefined,
      appointmentDate: "",
      notes: "",
    });
    setShowModal(true);
  };

  const openEdit = async (app: MyAppointmentDTO) => {
    setEditApp(app);
    try {
      const full = await getMyAppointment(app.id);
      setForm({
        vehicleId: full.vehicle?.id,
        serviceId: (full as any).serviceId || (full as any).service?.id,
        appointmentDate: full.appointmentDate,
        notes: (full as any).notes || "",
      });
    } catch (e) {
      setForm({
        appointmentDate: app.appointmentDate,
        vehicleId: app.vehicle?.id,
      });
    }
    setShowModal(true);
  };
  const closeModal = () => {
    setShowModal(false);
    setEditApp(null);
    setForm({});
    setFormError(null);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete this appointment?")) return;
    setIsSubmitting(true);
    try {
      await deleteMyAppointment(id);
      await refetch();
    } catch (e) {
      setFormError("Failed to delete appointment");
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleCancel = async (id: number) => {
    if (!window.confirm("Cancel this appointment?")) return;
    setIsSubmitting(true);
    try {
      await cancelMyAppointment(id);
      await refetch();
    } catch (e) {
      setFormError("Failed to cancel appointment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    try {
      // Validate required fields for booking
      if (!form.vehicleId || !form.serviceId || !form.appointmentDate) {
        setFormError("Please select vehicle, service, and date/time.");
        setIsSubmitting(false);
        return;
      }
      if (editApp) {
        await updateMyAppointment(editApp.id, form);
      } else {
        await bookAppointment(form);
      }
      await refetch();
      closeModal();
    } catch (err: any) {
      setFormError(err?.response?.data || "Failed to save appointment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
          <p className="text-gray-600 mt-1">View and manage your service appointments</p>
        </div>
        <button onClick={openBook} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
          <Plus className="w-5 h-5" />
          Book Appointment
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Appointments</p>
              <p className="text-2xl font-bold text-gray-900">{appointments.length}</p>
            </div>
            <Calendar className="w-10 h-10 text-green-500" />
          </div>
        </div>
        {/* ...other stats... */}
      </div>

      {/* Appointments List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Loading appointments...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center text-red-600">Error loading appointments</div>
        ) : !appointments || appointments.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No appointments yet</p>
            <button onClick={openBook} className="mt-4 text-green-600 hover:text-green-700 font-medium">
              Book your first appointment
            </button>
          </div>
        ) : (
          <div className="p-6">
            <ul className="space-y-4">
              {appointments.map((a) => (
                <li key={a.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{a.serviceName || "Service"}</p>
                      <p className="text-sm text-gray-600">{new Date(a.appointmentDate).toLocaleString()}</p>
                    </div>
                    <div className="text-sm text-gray-500">{a.status}</div>
                  </div>
                  <div className="mt-2 flex gap-2">
                    <button onClick={() => openEdit(a)} className="text-blue-600 hover:underline text-sm">Edit</button>
                    <button onClick={() => handleCancel(a.id)} className="text-orange-600 hover:underline text-sm">Cancel</button>
                    <button onClick={() => handleDelete(a.id)} className="text-red-600 hover:underline text-sm">Delete</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Modal for Book/Edit Appointment */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">{editApp ? "Edit Appointment" : "Book Appointment"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Vehicle</label>
                <select value={form.vehicleId || ""} onChange={e => setForm(f => ({...f, vehicleId: Number(e.target.value)}))} required className="mt-1 block w-full border rounded-md px-2 py-1">
                  <option value="">Select vehicle</option>
                  {myVehicles && myVehicles.map((v: any) => (
                    <option key={v.id} value={v.id}>{v.make} {v.model} ({v.licensePlate})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Service</label>
                <select value={form.serviceId || ""} onChange={e => setForm(f => ({...f, serviceId: Number(e.target.value)}))} required className="mt-1 block w-full border rounded-md px-2 py-1">
                  <option value="">Select service</option>
                  {services && services.map((s: any) => (
                    <option key={s.id} value={s.id}>{s.serviceName} - ${s.basePrice ?? '0'}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Date & Time</label>
                <input type="datetime-local" value={form.appointmentDate || ""} onChange={e => setForm(f => ({...f, appointmentDate: e.target.value}))} required className="mt-1 block w-full border rounded-md px-2 py-1" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Notes</label>
                <input type="text" value={form.notes || ""} onChange={e => setForm(f => ({...f, notes: e.target.value}))} className="mt-1 block w-full border rounded-md px-2 py-1" />
              </div>
              {formError && <div className="text-red-600 text-sm">{formError}</div>}
              <div className="flex justify-end gap-2">
                <button type="button" onClick={closeModal} className="px-4 py-2 border rounded-md">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-md" disabled={isSubmitting}>{isSubmitting ? "Saving..." : (editApp ? "Update" : "Book")}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAppointments;
