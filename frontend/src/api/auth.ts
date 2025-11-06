import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8085/api";

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

// Profile/me
export const fetchMe = async () => {
  const res = await api.get("/auth/me");
  return res.data;
};

// Change password for logged-in user
export const changePassword = async (payload: { currentPassword: string; newPassword: string }) => {
  const res = await api.post("/auth/change-password", payload);
  return res.data;
};

// Update my profile
export const updateMe = async (payload: { firstName?: string; lastName?: string; phoneNumber?: string }) => {
  const res = await api.put("/users/me", payload);
  return res.data;
};

// Delete my account
export const deleteMe = async () => {
  const res = await api.delete("/users/me");
  return res.data;
};

export default api;
