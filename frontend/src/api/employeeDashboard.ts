// api/employeeDashboard.ts
import api from "./auth";

export interface EmployeeDashboardStats {
  assignedAppointments: number;
  completedAppointments: number;
  ongoingAppointments: number;
}

export const getAssignedAppointmentCount = async (): Promise<number> => {
  const res = await api.get<number>("employee/dashboard/assigned/appointment/count");
  return res.data;
};

export const getCompletedAppointmentCount = async (): Promise<number> => {
  const res = await api.get<number>("employee/dashboard/completed/appointment/count");
  return res.data;
};

export const getOngoingAppointmentCount = async (): Promise<number> => {
  const res = await api.get<number>("employee/dashboard/ongoing/appointment/count");
  return res.data;
};

export const getAllEmployeeDashboardStats = async (): Promise<EmployeeDashboardStats> => {
  const [assignedAppointments, completedAppointments, ongoingAppointments] = await Promise.all([
    getAssignedAppointmentCount(),
    getCompletedAppointmentCount(),
    getOngoingAppointmentCount(),
  ]);

  return {
    assignedAppointments,
    completedAppointments,
    ongoingAppointments,
  };
};
