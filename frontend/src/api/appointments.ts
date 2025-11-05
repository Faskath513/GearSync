import api from "./auth";

export interface AppointmentRequest {
  vehicleId: number;
  serviceId: number;
  appointmentDate: string; // ISO string
  notes?: string;
}

export interface AppointmentUpdateRequest {
  appointmentDate?: string;
  notes?: string;
}

export interface MyAppointmentDTO {
  id: number;
  status: string;
  appointmentDate: string;
  serviceName?: string;
  vehicle?: {
    id: number;
    make?: string;
    model?: string;
    year?: number;
  };
}

export const bookAppointment = async (
  payload: AppointmentRequest
): Promise<any> => {
  const res = await api.post("/customer/appointments", payload);
  return res.data;
};

export const listMyAppointments = async (): Promise<MyAppointmentDTO[]> => {
  const res = await api.get<MyAppointmentDTO[]>("/customer/appointments");
  return res.data;
};

export const getMyAppointment = async (id: number): Promise<MyAppointmentDTO> => {
  const res = await api.get<MyAppointmentDTO>(`/customer/appointments/${id}`);
  return res.data;
};

export const updateMyAppointment = async (
  id: number,
  payload: AppointmentUpdateRequest
): Promise<any> => {
  const res = await api.put(`/customer/appointments/${id}`, payload);
  return res.data;
};

export const cancelMyAppointment = async (id: number): Promise<any> => {
  const res = await api.put(`/customer/appointments/${id}/cancel`);
  return res.data;
};

export const deleteMyAppointment = async (id: number): Promise<void> => {
  await api.delete(`/customer/appointments/${id}`);
};



