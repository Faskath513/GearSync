import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../../api/auth";
import { AuthContext } from "../../context/AuthContext";

type Role = "ADMIN" | "EMPLOYEE" | "CUSTOMER";

const LoginForm: React.FC = () => {
  const auth = useContext(AuthContext);
  if (!auth) throw new Error("AuthContext must be used inside AuthProvider");

  const { login: saveAuth } = auth;
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const validate = () => {
    if (!email.trim()) return "Email is required.";
    if (!/^\S+@\S+\.\S+$/.test(email)) return "Enter a valid email address.";
    if (password.length < 6) return "Password must be at least 6 characters.";
    return null;
  };

  const goByRole = (role: Role) => {
    if (role === "ADMIN") navigate("/admin-dashboard");
    else if (role === "EMPLOYEE") navigate("/employee-dashboard");
    else navigate("/customer-dashboard");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const v = validate();
    if (v) {
      setFormError(v);
      return;
    }

    try {
      setLoading(true);
      const res = await login({ email, password }); // expected: { token, role }
      saveAuth(res.token, res.role);
      goByRole(res.role as Role);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Invalid credentials. Please try again.";
      setFormError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-2xl shadow">
      <h1 className="text-2xl font-semibold mb-1">Welcome back</h1>
      <p className="text-sm text-gray-500 mb-6">
        Log in to access your dashboard.
      </p>

      {formError && (
        <div className="mb-4 rounded-lg bg-red-50 text-red-700 px-4 py-3 text-sm">
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="text-sm">
          Email
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="you@example.com"
            required
          />
        </label>

        <label className="text-sm">
          Password
          <div className="mt-1 relative">
            <input
              type={showPw ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="Your password"
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPw((s) => !s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-600 hover:text-gray-800"
              aria-label={showPw ? "Hide password" : "Show password"}
            >
              {showPw ? "Hide" : "Show"}
            </button>
          </div>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors"
        >
          {loading ? "Signing in..." : "Log In"}
        </button>
      </form>

      <div className="mt-4 text-sm text-gray-600">
        Don’t have an account?{" "}
        <Link to="/register" className="text-indigo-600 hover:underline">
          Register
        </Link>
      </div>
    </div>
  );
};

export default LoginForm;