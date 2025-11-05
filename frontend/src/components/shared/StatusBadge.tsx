import React from "react";

interface StatusBadgeProps {
  status?: string | null;
}

const colorFor = (status: string) => {
  const s = status.toLowerCase();
  if (s.includes("complete")) return "bg-green-100 text-green-700";
  if (s.includes("pending") || s.includes("in_progress")) return "bg-yellow-100 text-yellow-800";
  if (s.includes("cancel")) return "bg-gray-200 text-gray-700";
  if (s.includes("fail") || s.includes("reject")) return "bg-red-100 text-red-700";
  return "bg-blue-100 text-blue-700";
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  if (!status) return null;
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${colorFor(String(status))}`}>
      {String(status)}
    </span>
  );
};

export default StatusBadge;

