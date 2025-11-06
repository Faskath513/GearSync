import api from "./auth";

export interface VehicleRequest {
  registrationNumber: string;
  make: string;
  model: string;
  year: number;
  color: string;
  vinNumber: string;
  mileage: number;
}

export interface Vehicle extends VehicleRequest {
  id: number;
  createdAt?: string;
  updatedAt?: string;
}

export const listMyVehicles = async (): Promise<Vehicle[]> => {
  const res = await api.get<Vehicle[]>("customer/vehicles");
  return res.data;
};

export const getMyVehicle = async (id: number): Promise<Vehicle> => {
  const res = await api.get<Vehicle>(`customer/vehicles/${id}`);
  return res.data;
};

export const addMyVehicle = async (payload: VehicleRequest): Promise<Vehicle> => {
  const res = await api.post<Vehicle>("customer/vehicles", payload);
  return res.data;
};

export const updateMyVehicle = async (
  id: number,
  payload: Partial<VehicleRequest>
): Promise<Vehicle> => {
  const res = await api.put<Vehicle>(`customer/vehicles/${id}`, payload);
  return res.data;
};

export const deleteMyVehicle = async (id: number): Promise<void> => {
  await api.delete(`customer/vehicles/${id}`);
};



