import api from "./auth";

export interface ServiceItem {
  id?: number;
  name: string;
  category?: string;
  description?: string;
  price?: number;
}

export interface ServiceResponseDTO {
  id: number;
  serviceName: string;
  description?: string;
  basePrice?: number;
  estimatedDurationMinutes?: number;
  category?: string;
}

export interface AdminServiceDTO {
  serviceName: string;
  serviceType?: string;
  description?: string;
  price?: number;
}

// Public/admin view list of services
export const listAllServices = async (): Promise<ServiceResponseDTO[]> => {
  const res = await api.get<ServiceResponseDTO[]>("/service/view/all");
  return res.data;
};

// Admin add a new service
export const addService = async (payload: AdminServiceDTO): Promise<string> => {
  const res = await api.post<string>("/admin/service/add", payload);
  return res.data;
};



