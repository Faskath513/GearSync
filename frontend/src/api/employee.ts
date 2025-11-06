import api from "./auth";

export interface EmployeeStatusUpdateDTO {
  status: string;
  notes?: string;
}

// Appointments assigned to employee
export interface AppointmentResponseDTO {
  id: number;
  scheduledDateTime: string;
  status: string;
  customerNotes?: string;
  employeeNotes?: string;
  estimatedCost?: number;
  finalCost?: number;
  progressPercentage?: number;
  customerId: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  vehicleId: number;
  vehicleRegistrationNumber: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: string;
  services?: Array<{
    id: number;
    serviceName: string;
    description?: string;
    price?: number;
  }>;
  assignedEmployeeId?: number;
  assignedEmployeeName?: string;
  assignedEmployeeEmail?: string;
  actualStartTime?: string;
  actualEndTime?: string;
  createdAt: string;
  updatedAt: string;
}

export const listAssignedAppointments = async (): Promise<AppointmentResponseDTO[]> => {
  const res = await api.get<AppointmentResponseDTO[]>("/employee/appointments");
  return res.data;
};

export const getAssignedAppointment = async (id: number): Promise<AppointmentResponseDTO> => {
  const res = await api.get<AppointmentResponseDTO>(`/employee/appointments/${id}`);
  return res.data;
};

export const updateAppointmentStatus = async (
  id: number,
  payload: EmployeeStatusUpdateDTO
): Promise<AppointmentResponseDTO> => {
  const res = await api.patch<AppointmentResponseDTO>(`/employee/appointments/${id}/status`, payload);
  return res.data;
};

export const getAppointmentTimeLogs = async (id: number): Promise<TimeLogResponseDTO[]> => {
  const res = await api.get<TimeLogResponseDTO[]>(`/employee/appointments/${id}/timelogs`);
  return res.data;
};

// Projects assigned to employee
export interface ProjectResponseDTO {
  id: number;
  projectName: string;
  description?: string;
  status: string;
  estimatedCost?: number;
  actualCost?: number;
  estimatedDurationHours?: number;
  startDate?: string;
  completionDate?: string;
  expectedCompletionDate?: string;
  progressPercentage?: number;
  customerId: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  vehicleId: number;
  vehicleRegistrationNumber: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: string;
  assignedEmployeeId?: number;
  assignedEmployeeName?: string;
  assignedEmployeeEmail?: string;
  additionalNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export const listAssignedProjects = async (): Promise<ProjectResponseDTO[]> => {
  const res = await api.get<ProjectResponseDTO[]>("/employee/projects");
  return res.data;
};

export const getAssignedProject = async (id: number): Promise<ProjectResponseDTO> => {
  const res = await api.get<ProjectResponseDTO>(`/employee/projects/${id}`);
  return res.data;
};

export const updateProjectStatus = async (
  id: number,
  payload: EmployeeStatusUpdateDTO
): Promise<ProjectResponseDTO> => {
  const res = await api.patch<ProjectResponseDTO>(`/employee/projects/${id}/status`, payload);
  return res.data;
};

export const getProjectTimeLogs = async (id: number): Promise<TimeLogResponseDTO[]> => {
  const res = await api.get<TimeLogResponseDTO[]>(`/employee/projects/${id}/timelogs`);
  return res.data;
};

// Employee time logs
export interface TimeLogRequestDTO {
  appointmentId?: number;
  projectId?: number;
  description: string;
  hours: number;
}

export interface TimeLogUpdateDTO {
  description?: string;
  hours?: number;
}

export interface TimeLogResponseDTO {
  id: number;
  startTime: string;
  endTime?: string;
  durationMinutes?: number;
  workDescription: string;
  notes?: string;
  employeeId: number;
  employeeName: string;
  employeeEmail: string;
  appointmentId?: number;
  appointmentDescription?: string;
  projectId?: number;
  projectName?: string;
  createdAt: string;
  updatedAt: string;
}

export const createTimeLog = async (payload: TimeLogRequestDTO): Promise<TimeLogResponseDTO> => {
  const res = await api.post<TimeLogResponseDTO>("/employee/timelogs", payload);
  return res.data;
};

export const listMyTimeLogs = async (): Promise<TimeLogResponseDTO[]> => {
  const res = await api.get<TimeLogResponseDTO[]>("/employee/timelogs");
  return res.data;
};

export const updateTimeLog = async (
  id: number,
  payload: TimeLogUpdateDTO
): Promise<TimeLogResponseDTO> => {
  const res = await api.put<TimeLogResponseDTO>(`/employee/timelogs/${id}`, payload);
  return res.data;
};

export const deleteTimeLog = async (id: number): Promise<void> => {
  await api.delete(`/employee/timelogs/${id}`);
};



