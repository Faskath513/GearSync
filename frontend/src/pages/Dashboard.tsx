import React, { useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Dashboard: React.FC = () => {
  const { logout, role } = useContext(AuthContext)!;
  const navigate = useNavigate();

  useEffect(() => {
    if (!role) return;
    if (role === "ADMIN") navigate("/admin", { replace: true });
    else if (role === "EMPLOYEE") navigate("/employee", { replace: true });
    else if (role === "CUSTOMER") navigate("/customer", { replace: true });
  }, [role, navigate]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600">Redirecting to your dashboard...</p>
        <div className="mt-6">
          <button onClick={logout} className="text-sm text-red-600 hover:text-red-700">Logout</button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;