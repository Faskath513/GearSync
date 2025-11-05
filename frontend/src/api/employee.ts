import api from "./auth";

export interface EmployeeStatusUpdateDTO {
  status: string;
  notes?: string;
}

// Appointments assigned to employee
export const listAssignedAppointments = async (): Promise<any[]> => {
  const res = await api.get<any[]>("/employee/appointments");
  return res.data;
};

export const getAssignedAppointment = async (id: number): Promise<any> => {
  const res = await api.get<any>(`/employee/appointments/${id}`);
  return res.data;
};

export const updateAppointmentStatus = async (
  id: number,
  payload: EmployeeStatusUpdateDTO
): Promise<any> => {
  const res = await api.patch<any>(`/employee/appointments/${id}/status`, payload);
  return res.data;
};

export const getAppointmentTimeLogs = async (id: number): Promise<any[]> => {
  const res = await api.get<any[]>(`/employee/appointments/${id}/timelogs`);
  return res.data;
};

// Projects assigned to employee
export const listAssignedProjects = async (): Promise<any[]> => {
  const res = await api.get<any[]>("/employee/projects");
  return res.data;
};

export const getAssignedProject = async (id: number): Promise<any> => {
  const res = await api.get<any>(`/employee/projects/${id}`);
  return res.data;
};

export const updateProjectStatus = async (
  id: number,
  payload: EmployeeStatusUpdateDTO
): Promise<any> => {
  const res = await api.patch<any>(`/employee/projects/${id}/status`, payload);
  return res.data;
};

export const getProjectTimeLogs = async (id: number): Promise<any[]> => {
  const res = await api.get<any[]>(`/employee/projects/${id}/timelogs`);
  return res.data;
};



