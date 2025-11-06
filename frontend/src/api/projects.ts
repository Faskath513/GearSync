import api from "./auth";

export interface ProjectRequest {
  projectName: string;
  description: string;
  vehicleId: number;
  additionalNotes?: string;
}

export interface ProjectUpdateRequest {
  projectName?: string;
  description?: string;
  additionalNotes?: string;
}

export interface ProjectDTO {
  id: number;
  title: string;
  description?: string;
  status?: string;
}

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

export const createProject = async (
  payload: ProjectRequest
): Promise<ProjectResponseDTO> => {
  const res = await api.post<ProjectResponseDTO>("/customer/projects", payload);
  return res.data;
};

export const listMyProjects = async (): Promise<ProjectResponseDTO[]> => {
  const res = await api.get<ProjectResponseDTO[]>("/customer/projects");
  return res.data;
};

export const listMyActiveProjects = async (): Promise<ProjectResponseDTO[]> => {
  const res = await api.get<ProjectResponseDTO[]>("/customer/projects/active");
  return res.data;
};

export const getMyProject = async (id: number): Promise<ProjectResponseDTO> => {
  const res = await api.get<ProjectResponseDTO>(`/customer/projects/${id}`);
  return res.data;
};

export const updateMyProject = async (
  id: number,
  payload: ProjectUpdateRequest
): Promise<ProjectResponseDTO> => {
  const res = await api.put<ProjectResponseDTO>(`/customer/projects/${id}`, payload);
  return res.data;
};

export const deleteMyProject = async (id: number): Promise<void> => {
  await api.delete(`/customer/projects/${id}`);
};



