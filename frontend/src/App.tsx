// App.tsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Home from "./pages/Home";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import EmployeeDashboard from "./pages/Employee/EmployeeDashboard";
import CustomerDashboard from "./pages/Customer/CustomerDashboard";
import ProtectedRoute from "./pages/ProtectedRoute";
import Navbar from "./components/Navbar";
import Login from "./components/auth/LoginForm";
import Register from "./components/auth/RegisterForm";

const Footer: React.FC = () => (
  <footer className="bg-gray-100 text-center py-4">
    <div className="container mx-auto text-sm text-gray-600">
      © {new Date().getFullYear()} GearSync
    </div>
  </footer>
);

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />

              {/* public login route */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* protected routes */}
              <Route
                path="/admin-dashboard"
                element={
                  <ProtectedRoute requiredRole="ADMIN">
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employee-dashboard"
                element={
                  <ProtectedRoute requiredRole="EMPLOYEE">
                    <EmployeeDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customer-dashboard"
                element={
                  <ProtectedRoute requiredRole="CUSTOMER">
                    <CustomerDashboard />
                  </ProtectedRoute>
                }
              />

              {/* fallback */}
              <Route path="*" element={<Home />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;