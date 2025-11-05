import React, { useState, useContext } from "react";
import { login } from "../../api/auth";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import ForgotPassword from "./ForgotPassword";

const LoginForm: React.FC = () => {
  const auth = useContext(AuthContext);
  if (!auth) throw new Error("AuthContext must be used inside AuthProvider");

  const { login: saveAuth } = auth;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await login({ email, password });
      saveAuth(res.token, res.role);
      alert(`Login success as ${res.role}!`);
      if (res.role === "ADMIN") navigate("/admin-dashboard");
      else if (res.role === "EMPLOYEE") navigate("/employee-dashboard");
      else if (res.role === "CUSTOMER") navigate("/customer-dashboard");
    } catch {
      alert("Invalid credentials");
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition-colors duration-200"
        >
          Login
        </button>

        <button
          type="button"
          onClick={() => setIsForgotOpen(true)}
          
          className="inline-block text-blue-200 hover:text-red-500 text-sm px-1.5 py-0.5 transition-colors duration-200"




        >
          Forgot Password?
        </button>
      </form>

      <ForgotPassword isOpen={isForgotOpen} onClose={() => setIsForgotOpen(false)} />
    </>
  );
};

export default LoginForm;
