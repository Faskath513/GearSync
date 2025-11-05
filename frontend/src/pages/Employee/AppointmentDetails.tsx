import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import LoadingSpinner from "../../components/shared/LoadingSpinner";
import ErrorState from "../../components/shared/ErrorState";
import StatusBadge from "../../components/shared/StatusBadge";
import { getAssignedAppointment, getAppointmentTimeLogs } from "../../api/employee";

const AppointmentDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<any | null>(null);
  const [timeLogs, setTimeLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const [details, logs] = await Promise.all([
          getAssignedAppointment(Number(id)),
          getAppointmentTimeLogs(Number(id)).catch(() => []),
        ]);
        setData(details);
        setTimeLogs(logs || []);
      } catch (e: any) {
        setError(e?.message || "Failed to load appointment");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <LoadingSpinner label="Loading appointment..." colorClassName="border-indigo-600" />;
  if (error || !data) return <ErrorState title="Unable to load" message={error || "Appointment not found"} actionLabel="Back" onAction={() => navigate(-1)} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Appointment #{data.id}</h1>
          <div className="mt-2"><StatusBadge status={data.status} /></div>
        </div>
        <button onClick={() => navigate(-1)} className="px-4 py-2 rounded-lg border">Back</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Details</h2>
          <dl className="space-y-2 text-sm text-gray-700">
            <div className="flex justify-between"><dt>Service</dt><dd>{data.serviceName || "-"}</dd></div>
            <div className="flex justify-between"><dt>Date</dt><dd>{data.appointmentDate || "-"}</dd></div>
            <div className="flex justify-between"><dt>Notes</dt><dd>{data.notes || "-"}</dd></div>
            <div className="flex justify-between"><dt>Vehicle</dt><dd>{data?.vehicle?.make ? `${data.vehicle.make} ${data.vehicle.model} (${data.vehicle.year || ""})` : "-"}</dd></div>
          </dl>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Time Logs</h2>
          {timeLogs.length === 0 ? (
            <p className="text-gray-600 text-sm">No time logs</p>
          ) : (
            <ul className="divide-y">
              {timeLogs.map((t: any) => (
                <li key={t.id} className="py-2 text-sm flex items-center justify-between">
                  <span>{t.description || "Work"}</span>
                  <span className="text-gray-500">{t.hours}h</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetails;

