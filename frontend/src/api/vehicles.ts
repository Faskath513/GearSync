import api from "./auth";

export interface VehicleRequest {
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  vin?: string;
}

export interface Vehicle extends VehicleRequest {
  id: number;
}

export interface VehicleResponseDTO {
  id: number;
  registrationNumber: string;
  make: string;
  model: string;
  year: number;
  color?: string;
  vinNumber?: string;
  mileage?: number;
  ownerEmail: string;
}

export const listMyVehicles = async (): Promise<Vehicle[]> => {
  const res = await api.get<Vehicle[]>("/customer/vehicles");
  return res.data;
};

export const getMyVehicle = async (id: number): Promise<Vehicle> => {
  const res = await api.get<Vehicle>(`/customer/vehicles/${id}`);
  return res.data;
};

export const addMyVehicle = async (payload: VehicleRequest): Promise<VehicleResponseDTO> => {
  const res = await api.post<VehicleResponseDTO>("/customer/vehicles", payload);
  return res.data;
};

export const updateMyVehicle = async (
  id: number,
  payload: Partial<VehicleRequest>
): Promise<Vehicle> => {
  const res = await api.put<Vehicle>(`/customer/vehicles/${id}`, payload);
  return res.data;
};

export const deleteMyVehicle = async (id: number): Promise<void> => {
  await api.delete(`/customer/vehicles/${id}`);
};



