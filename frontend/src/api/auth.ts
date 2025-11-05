import axios from "axios";

const API_URL = "http://localhost:8080/api";

const api = axios.create({
  baseURL: API_URL,
});

// Attach token automatically for authenticated requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  password: string;
  role?: "CUSTOMER" | "EMPLOYEE" | "ADMIN";
}

export interface LoginResponse {
  token: string;
  role: "CUSTOMER" | "EMPLOYEE" | "ADMIN";
  isFirstLogin?: boolean;
}

export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  const res = await api.post<LoginResponse>("/auth/login", data);
  return res.data; // { token, role }
};

export const register = async (data: RegisterRequest) => {
  const res = await api.post("/auth/register", data);
  return res.data; // saved user
};

// Current user info
export interface MeResponse {
  id: number;
  name: string;
  email: string;
  role: "CUSTOMER" | "EMPLOYEE" | "ADMIN";
  phoneNumber?: string;
}

export const me = async (): Promise<MeResponse> => {
  const res = await api.get<MeResponse>("/auth/me");
  return res.data;
};

// Refresh JWT
export const refresh = async (): Promise<{ token: string }> => {
  const res = await api.post<{ token: string }>("/auth/refresh");
  return res.data;
};

// Logout (stateless server, client clears token; endpoint returns message)
export const logout = async (): Promise<{ message: string }> => {
  const res = await api.post<{ message: string }>("/auth/logout");
  return res.data;
};

// Password management
export interface ChangePasswordRequestDTO {
  oldPassword: string;
  newPassword: string;
}

export const changePassword = async (
  payload: ChangePasswordRequestDTO
): Promise<any> => {
  const res = await api.post("/auth/change-password", payload);
  return res.data;
};

export interface ForgotPasswordRequestDTO {
  email: string;
}

export const forgotPassword = async (
  payload: ForgotPasswordRequestDTO
): Promise<any> => {
  const res = await api.post("/auth/forgot-password", payload);
  return res.data;
};

export interface VerifyOtpRequestDTO {
  email: string;
  otp: string;
}

export interface VerifyOtpResponseDTO {
  success: boolean;
  message?: string;
}

export const verifyOtp = async (
  payload: VerifyOtpRequestDTO
): Promise<VerifyOtpResponseDTO> => {
  const res = await api.post<VerifyOtpResponseDTO>("/auth/verify-otp", payload);
  return res.data;
};

export interface ResetPasswordRequestDTO {
  email: string;
  newPassword: string;
  otp: string;
}

export const resetPassword = async (
  payload: ResetPasswordRequestDTO
): Promise<any> => {
  const res = await api.post("/auth/reset-password", payload);
  return res.data;
};

export default api;