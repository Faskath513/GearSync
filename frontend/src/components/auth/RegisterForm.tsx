import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register, RegisterRequest } from "../../api/auth";

type Role = RegisterRequest["role"]; // "CUSTOMER" | "EMPLOYEE" | "ADMIN"

const RegisterForm: React.FC = () => {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName]   = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [confirm, setConfirm]     = useState("");
  const [role, setRole]           = useState<Role>("CUSTOMER");

  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const validate = () => {
    if (!firstName.trim()) return "First name is required.";
    if (!lastName.trim()) return "Last name is required.";
    if (!/^\S+@\S+\.\S+$/.test(email)) return "Enter a valid email address.";
    if (!/^[0-9+\-()\s]{7,20}$/.test(phoneNumber))
      return "Enter a valid phone number.";
    if (password.length < 6)
      return "Password must be at least 6 characters.";
    if (password !== confirm) return "Passwords do not match.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMsg(null);

    const v = validate();
    if (v) {
      setFormError(v);
      return;
    }

    try {
      setLoading(true);
      const payload: RegisterRequest = {
        firstName,
        lastName,
        phoneNumber,
        email,
        password,
        role,
      };
      await register(payload);
      setSuccessMsg("Registered successfully! You can now log in.");
      // Optional: redirect after a short delay
      setTimeout(() => navigate("/login"), 700);
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Error registering. Please try again.";
      setFormError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-2xl shadow">
      <h1 className="text-2xl font-semibold mb-1">Create your account</h1>
      <p className="text-sm text-gray-500 mb-6">
        Sign up to get started. (Default role is Customer)
      </p>

      {formError && (
        <div className="mb-4 rounded-lg bg-red-50 text-red-700 px-4 py-3 text-sm">
          {formError}
        </div>
      )}
      {successMsg && (
        <div className="mb-4 rounded-lg bg-green-50 text-green-700 px-4 py-3 text-sm">
          {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="text-sm">
          First Name
          <input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
            required
          />
        </label>

        <label className="text-sm">
          Last Name
          <input
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
            required
          />
        </label>

        <label className="text-sm">
          Email
          <input
            type="email"
            value={email}
            autoComplete="email"
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
            required
          />
        </label>

        <label className="text-sm">
          Phone Number
          <input
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
            required
          />
        </label>

        <label className="text-sm">
          Password
          <input
            type="password"
            value={password}
            autoComplete="new-password"
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
            required
            minLength={6}
          />
        </label>

        <label className="text-sm">
          Confirm Password
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
            required
            minLength={6}
          />
        </label>

        <label className="text-sm">
          Role
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
            className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
          >
            <option value="CUSTOMER">Customer</option>
            <option value="EMPLOYEE">Employee</option>
            <option value="ADMIN">Admin</option>
          </select>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors"
        >
          {loading ? "Creating account..." : "Register"}
        </button>
      </form>

      <div className="mt-4 text-sm text-gray-600">
        Already have an account?{" "}
        <Link to="/login" className="text-green-600 hover:underline">
          Log in
        </Link>
      </div>
    </div>
  );
};

export default RegisterForm;