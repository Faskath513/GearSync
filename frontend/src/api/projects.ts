import api from "./auth";

export interface ProjectRequest {
  title: string;
  description?: string;
  vehicleId: number;
  serviceId?: number;
}

export interface ProjectUpdateRequest {
  title?: string;
  description?: string;
}

export interface ProjectDTO {
  id: number;
  title: string;
  description?: string;
  status?: string;
}

export const createProject = async (
  payload: ProjectRequest
): Promise<ProjectDTO> => {
  const res = await api.post<ProjectDTO>("/customer/projects", payload);
  return res.data;
};

export const listMyProjects = async (): Promise<ProjectDTO[]> => {
  const res = await api.get<ProjectDTO[]>("/customer/projects");
  return res.data;
};

export const listMyActiveProjects = async (): Promise<ProjectDTO[]> => {
  const res = await api.get<ProjectDTO[]>("/customer/projects/active");
  return res.data;
};

export const getMyProject = async (id: number): Promise<ProjectDTO> => {
  const res = await api.get<ProjectDTO>(`/customer/projects/${id}`);
  return res.data;
};

export const updateMyProject = async (
  id: number,
  payload: ProjectUpdateRequest
): Promise<ProjectDTO> => {
  const res = await api.put<ProjectDTO>(`/customer/projects/${id}`, payload);
  return res.data;
};

export const deleteMyProject = async (id: number): Promise<void> => {
  await api.delete(`/customer/projects/${id}`);
};



