import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import LoadingSpinner from "../../components/shared/LoadingSpinner";
import ErrorState from "../../components/shared/ErrorState";
import StatusBadge from "../../components/shared/StatusBadge";
import { getAssignedProject, getProjectTimeLogs, updateProjectStatus, EmployeeStatusUpdateDTO } from "../../api/employee";

const ProjectDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<any | null>(null);
  const [timeLogs, setTimeLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<boolean>(false);
  const [newStatus, setNewStatus] = useState<string>("");

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const [details, logs] = await Promise.all([
          getAssignedProject(Number(id)),
          getProjectTimeLogs(Number(id)).catch(() => []),
        ]);
        setData(details);
        setNewStatus(details?.status || "");
        setTimeLogs(logs || []);
      } catch (e: any) {
        setError(e?.message || "Failed to load project");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const applyStatus = async () => {
    if (!id || !newStatus) return;
    setUpdating(true);
    try {
      const payload: EmployeeStatusUpdateDTO = { status: newStatus };
      const updated = await updateProjectStatus(Number(id), payload);
      setData(updated);
    } catch (e) {
      // Soft fail: keep UI responsive
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <LoadingSpinner label="Loading project..." colorClassName="border-purple-600" />;
  if (error || !data) return <ErrorState title="Unable to load" message={error || "Project not found"} actionLabel="Back" onAction={() => navigate(-1)} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Project #{data.id}</h1>
          <div className="mt-2"><StatusBadge status={data.status} /></div>
        </div>
        <button onClick={() => navigate(-1)} className="px-4 py-2 rounded-lg border">Back</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Details</h2>
          <dl className="space-y-2 text-sm text-gray-700">
            <div className="flex justify-between"><dt>Title</dt><dd>{data.title || "-"}</dd></div>
            <div className="flex justify-between"><dt>Description</dt><dd>{data.description || "-"}</dd></div>
            <div className="flex justify-between"><dt>Vehicle</dt><dd>{data?.vehicle?.id ? `#${data.vehicle.id}` : "-"}</dd></div>
          </dl>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Update Status</h2>
          <div className="flex items-center gap-2">
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="border rounded px-3 py-2"
            >
              <option value="">Select status</option>
              <option value="PENDING">PENDING</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
            <button
              onClick={applyStatus}
              disabled={!newStatus || updating}
              className="px-4 py-2 rounded bg-indigo-600 text-white disabled:opacity-60"
            >
              {updating ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
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
  );
};

export default ProjectDetails;

