// src/api/projects.ts
import api from "./auth";

/** Matches backend ProjectRequestDTO */
export interface ProjectRequest {
  vehicleId: number;
  projectName: string;
  description?: string;
  additionalNotes?: string;
}

/** Matches backend ProjectUpdateRequestDTO */
export interface ProjectUpdateRequest {
  projectName?: string;
  description?: string;
  additionalNotes?: string;
}

/** Matches backend ProjectResponseDTO (subset + useful fields) */
export interface ProjectDTO {
  id: number;
  projectName: string;
  description: string;
  status: string;

  estimatedCost?: number | null;
  actualCost?: number | null;
  estimatedDurationHours?: number | null;

  startDate?: string | null;
  completionDate?: string | null;
  expectedCompletionDate?: string | null;

  progressPercentage?: number | null;

  // vehicle summary (from ProjectResponseDTO)
  vehicleId?: number;
  vehicleRegistrationNumber?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleYear?: string;

  createdAt?: string;
  updatedAt?: string;
}

export const createProject = async (payload: ProjectRequest): Promise<ProjectDTO> => {
  const res = await api.post<ProjectDTO>("customer/projects", payload);
  return res.data;
};

export const listMyProjects = async (): Promise<ProjectDTO[]> => {
  const res = await api.get<ProjectDTO[]>("customer/projects");
  const data = res.data;
  return Array.isArray(data) ? data : [];
};

export const listMyActiveProjects = async (): Promise<ProjectDTO[]> => {
  const res = await api.get<ProjectDTO[]>("customer/projects/active");
  const data = res.data;
  return Array.isArray(data) ? data : [];
};

export const getMyProject = async (id: number): Promise<ProjectDTO> => {
  const res = await api.get<ProjectDTO>(`customer/projects/${id}`);
  return res.data;
};

export const updateMyProject = async (
  id: number,
  payload: ProjectUpdateRequest
): Promise<ProjectDTO> => {
  // PATCH for partial updates
  const res = await api.patch<ProjectDTO>(`customer/projects/${id}`, payload);
  return res.data;
};

export const deleteMyProject = async (id: number): Promise<void> => {
  await api.delete(`customer/projects/${id}`);
};