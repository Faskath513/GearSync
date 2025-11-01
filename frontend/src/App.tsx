import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Home from "./pages/Home";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import EmployeeDashboard from "./pages/Employee/EmployeeDashboard";
import CustomerDashboard from "./pages/Customer/CustomerDashboard";
import ProtectedRoute from "./pages/ProtectedRoute";
import Navbar from "./components/Navbar";

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-100 text-center py-4">
      <div className="container mx-auto text-sm text-gray-600">© {new Date().getFullYear()} GearSync</div>
    </footer>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Navbar />

          {/* Main Content */}
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />

              {/* Admin Dashboard */}
              <Route
                path="/admin-dashboard"
                element={
                  <ProtectedRoute requiredRole="ADMIN">
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Employee Dashboard */}
              <Route
                path="/employee-dashboard"
                element={
                  <ProtectedRoute requiredRole="EMPLOYEE">
                    <EmployeeDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Customer Dashboard */}
              <Route
                path="/customer-dashboard"
                element={
                  <ProtectedRoute requiredRole="CUSTOMER">
                    <CustomerDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Optional fallback route */}
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