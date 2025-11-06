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
}

export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  const res = await api.post<LoginResponse>("/auth/login", data);
  return res.data; // { token, role }
};

export const register = async (data: RegisterRequest) => {
  const res = await api.post("/auth/register", data);
  return res.data; // saved user
};

export default api;