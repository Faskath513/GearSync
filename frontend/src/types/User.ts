export interface User {
  id?: number;
  name: string;
  email: string;
  role?: "CUSTOMER" | "EMPLOYEE" | "ADMIN";
}
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role?: "CUSTOMER" | "EMPLOYEE" | "ADMIN"; // Add this
}