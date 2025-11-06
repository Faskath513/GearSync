import axios from "axios";

const API_URL = "http://localhost:8082/api";

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
  isFirstLogin: boolean;
}

export interface UserDto {
  id: number;
  name: string;
  email: string;
  role: string;
  phoneNumber: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface VerifyOtpResponse {
  resetToken: string;
  message: string;
  expiresInMinutes: number;
}

export interface ResetPasswordRequest {
  resetToken: string;
  newPassword: string;
  confirmPassword: string;
}

export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  const res = await api.post<LoginResponse>("/auth/login", data);
  return res.data; // { token, role, isFirstLogin }
};

export const register = async (data: RegisterRequest) => {
  const res = await api.post("/auth/register", data);
  return res.data; // saved user
};

export const getCurrentUser = async (): Promise<UserDto> => {
  const res = await api.get<UserDto>("/auth/me");
  return res.data;
};

export const refreshToken = async (): Promise<{ token: string }> => {
  const res = await api.post<{ token: string }>("/auth/refresh");
  return res.data;
};

export const logout = async (): Promise<{ message: string }> => {
  const res = await api.post<{ message: string }>("/auth/logout");
  return res.data;
};

export const changePassword = async (data: ChangePasswordRequest): Promise<{ message: string; success: boolean }> => {
  const res = await api.post<{ message: string; success: boolean }>("/auth/change-password", data);
  return res.data;
};

export const forgotPassword = async (data: ForgotPasswordRequest): Promise<{ message: string; success: boolean; email: string }> => {
  const res = await api.post<{ message: string; success: boolean; email: string }>("/auth/forgot-password", data);
  return res.data;
};

export const verifyOtp = async (data: VerifyOtpRequest): Promise<VerifyOtpResponse> => {
  const res = await api.post<VerifyOtpResponse>("/auth/verify-otp", data);
  return res.data;
};

export const resetPassword = async (data: ResetPasswordRequest): Promise<{ message: string; success: boolean }> => {
  const res = await api.post<{ message: string; success: boolean }>("/auth/reset-password", data);
  return res.data;
};

export default api;