import React, { createContext, useState, ReactNode, useEffect } from "react";

interface AuthContextType {
  token: string | null;
  role: "CUSTOMER" | "EMPLOYEE" | "ADMIN" | null;
  login: (token: string, role: "CUSTOMER" | "EMPLOYEE" | "ADMIN") => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );
  const [role, setRole] = useState<AuthContextType["role"]>(
    localStorage.getItem("role") as AuthContextType["role"]
  );

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }

    if (role) {
      localStorage.setItem("role", role);
    } else {
      localStorage.removeItem("role");
    }
  }, [token, role]);

  const login = (jwt: string, userRole: AuthContextType["role"]) => {
    setToken(jwt);
    setRole(userRole);
  };

  const logout = () => {
    setToken(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ token, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};