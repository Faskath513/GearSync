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

export const bookAppointment = async (
  payload: AppointmentRequest
): Promise<AppointmentResponseDTO> => {
  const res = await api.post<AppointmentResponseDTO>("/customer/appointments", payload);
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
): Promise<AppointmentUpdateRequest> => {
  const res = await api.put<AppointmentUpdateRequest>(`/customer/appointments/${id}`, payload);
  return res.data;
};

export const cancelMyAppointment = async (id: number): Promise<AppointmentResponseDTO> => {
  const res = await api.put<AppointmentResponseDTO>(`/customer/appointments/${id}/cancel`);
  return res.data;
};

export const deleteMyAppointment = async (id: number): Promise<void> => {
  await api.delete(`/customer/appointments/${id}`);
};



