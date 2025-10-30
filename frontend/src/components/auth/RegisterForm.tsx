import React, { useState } from "react";
import { register, RegisterRequest } from "../../api/auth";

const RegisterForm: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<RegisterRequest["role"]>("CUSTOMER");

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    const payload: RegisterRequest = { name, email, password, role };
    const res = await register(payload);
    console.log("Registered user:", res);
    alert("Registered successfully!");
  } catch (error: any) {
    console.error(error.response?.data || error.message);
    alert("Error registering: " + (error.response?.data?.message || error.message));
  }
};

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
        required
      />
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
        required
      />
      <select
        value={role}
        onChange={(e) => setRole(e.target.value as RegisterRequest["role"])}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
      >
        <option value="CUSTOMER">Customer</option>
        <option value="EMPLOYEE">Employee</option>
        <option value="ADMIN">Admin</option>
      </select>
      <button
        type="submit"
        className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-lg transition-colors duration-200"
      >
        Register
      </button>
    </form>
  );
};

export default RegisterForm;