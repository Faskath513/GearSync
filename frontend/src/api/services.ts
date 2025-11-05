import api from "./auth";

export interface ServiceItem {
  id?: number;
  name: string;
  category?: string;
  description?: string;
  price?: number;
}

export interface AdminServiceDTO {
  serviceName: string;
  serviceType?: string;
  description?: string;
  price?: number;
}

// Public/admin view list of services
export const listAllServices = async (): Promise<ServiceItem[]> => {
  const res = await api.get<ServiceItem[]>("/service/view/all");
  return res.data;
};

// Admin add a new service
export const addService = async (payload: AdminServiceDTO): Promise<string> => {
  const res = await api.post<string>("/admin/service/add", payload);
  return res.data;
};



