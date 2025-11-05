import axios from "axios";

const API_URL = "http://localhost:8085/api";

const api = axios.create({
  baseURL: API_URL,
});

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
}

// Login API
export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  const res = await api.post<LoginResponse>("/auth/login", data);
  return res.data;
};

// Register API
export const register = async (data: RegisterRequest) => {
  const res = await api.post("/auth/register", data);
  return res.data;
};

// Forgot Password API (send OTP)
export const forgotPassword = async (email: string) => {
  const res = await api.post("/auth/forgot-password", { email });
  return res.data; // { message, resetToken }
};

export default api;
