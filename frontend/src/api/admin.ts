// src/api/admin.ts
import api from "./auth";

export type Role = "CUSTOMER" | "EMPLOYEE" | "ADMIN";

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: Role;
  isActive: boolean;
  createdAt: string; // ISO string
}

export interface EmployeeRegisterDTO {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
}

// Admin has same shape as employee creation:
export type AdminRegisterDTO = EmployeeRegisterDTO;

export const addEmployee = async (payload: EmployeeRegisterDTO): Promise<User> => {
  const { data } = await api.post<User>("/admin/employees", payload);
  return data;
};

export const addAdmin = async (payload: AdminRegisterDTO): Promise<User> => {
  const { data } = await api.post<User>("/admin/admins", payload);
  return data;
};

export interface UserDto {
  id?: number;
  name: string;
  email: string;
  role: string;
  phoneNumber?: string;
}

export const listEmployees = async (): Promise<UserDto[]> => {
  const { data } = await api.get<UserDto[]>("/admin/employees");
  return data;
};

// User Management
export interface UpdateUserDTO {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  isActive?: boolean;
}

export const updateUser = async (userId: number, payload: UpdateUserDTO): Promise<User> => {
  const { data } = await api.put<User>(`/admin/users/${userId}`, payload);
  return data;
};

export const deleteUser = async (userId: number): Promise<void> => {
  await api.delete(`/admin/users/${userId}`);
};

export const toggleUserStatus = async (userId: number, isActive: boolean): Promise<User> => {
  const { data } = await api.put<User>(`/admin/users/${userId}/status`, { isActive });
  return data;
};

// ----- Appointments
export interface AssignAppointmentDTO { employeeId: number; }

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

export const assignEmployeeToAppointment = async (
  id: number,
  payload: AssignAppointmentDTO
): Promise<AppointmentResponseDTO> => {
  const { data } = await api.put<AppointmentResponseDTO>(`/admin/appointments/${id}/assign`, payload);
  return data;
};

export const reassignEmployeeToAppointment = async (
  id: number,
  payload: AssignAppointmentDTO
): Promise<AppointmentResponseDTO> => {
  const { data } = await api.put<AppointmentResponseDTO>(`/admin/appointments/${id}/reassign`, payload);
  return data;
};

export const unassignEmployeeFromAppointment = async (id: number): Promise<AppointmentResponseDTO> => {
  const res = await api.delete<AppointmentResponseDTO>(`/admin/appointments/${id}/unassign`);
  return res.data;
};

// ----- Projects
export interface ApproveProjectDTO { employeeId: number; notes?: string; }
export interface RejectProjectDTO { reason: string; }
export interface AssignProjectDTO { employeeId: number; }

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

export const approveAndAssignProject = async (
  id: number,
  payload: ApproveProjectDTO
): Promise<ProjectResponseDTO> => {
  const { data } = await api.put<ProjectResponseDTO>(`/admin/projects/${id}/approve`, payload);
  return data;
};

export const rejectProject = async (id: number, payload: RejectProjectDTO): Promise<ProjectResponseDTO> => {
  const { data } = await api.put<ProjectResponseDTO>(`/admin/projects/${id}/reject`, payload);
  return data;
};

export const assignEmployeeToProject = async (
  id: number,
  payload: AssignProjectDTO
): Promise<ProjectResponseDTO> => {
  const { data } = await api.put<ProjectResponseDTO>(`/admin/projects/${id}/assign`, payload);
  return data;
};

export const unassignEmployeeFromProject = async (id: number): Promise<ProjectResponseDTO> => {
  const res = await api.delete<ProjectResponseDTO>(`/admin/projects/${id}/unassign`);
  return res.data;
};