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

export const listEmployees = async (): Promise<User[]> => {
  const { data } = await api.get<User[]>("/admin/employees");
  return data;
};

// ----- Appointments
export interface AssignAppointmentDTO { employeeId: number; }

export const assignEmployeeToAppointment = async (
  id: number,
  payload: AssignAppointmentDTO
): Promise<void> => {
  await api.put(`/admin/appointments/${id}/assign`, payload);
};

export const reassignEmployeeToAppointment = async (
  id: number,
  payload: AssignAppointmentDTO
): Promise<void> => {
  await api.put(`/admin/appointments/${id}/reassign`, payload);
};

export const unassignEmployeeFromAppointment = async (id: number): Promise<void> => {
  await api.delete(`/admin/appointments/${id}/unassign`);
};

// ----- Projects
export interface ApproveProjectDTO { employeeId: number; notes?: string; }
export interface RejectProjectDTO { reason: string; }
export interface AssignProjectDTO { employeeId: number; }

export const approveAndAssignProject = async (
  id: number,
  payload: ApproveProjectDTO
): Promise<void> => {
  await api.put(`/admin/projects/${id}/approve`, payload);
};

export const rejectProject = async (id: number, payload: RejectProjectDTO): Promise<void> => {
  await api.put(`/admin/projects/${id}/reject`, payload);
};

export const assignEmployeeToProject = async (
  id: number,
  payload: AssignProjectDTO
): Promise<void> => {
  await api.put(`/admin/projects/${id}/assign`, payload);
};

export const unassignEmployeeFromProject = async (id: number): Promise<void> => {
  await api.delete(`/admin/projects/${id}/unassign`);
};