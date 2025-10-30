import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string; // optional role restriction
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { token, role } = useContext(AuthContext)!;

  // If no token → redirect to login/home
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // If role is required but user doesn't match → block
  if (requiredRole && role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  // Otherwise, allow access
  return <>{children}</>;
};

export default ProtectedRoute;