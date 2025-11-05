import React, { useState } from "react";
import Modal from "../common/Modal";
import api from "../../api/auth";

interface ForgotPasswordProps {
  isOpen: boolean;
  onClose: () => void;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔹 Step 1: Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.post("/auth/forgot-password", { email });
      alert(res.data.message || "OTP sent to your email!");
      setStep(2);
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.post("/auth/verify-otp", { email, otp });
      alert(res.data.message || "OTP verified!");
      setStep(3);
    } catch (err: any) {
      alert(err.response?.data?.error || "Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Step 3: Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return alert("Passwords do not match!");

    try {
      setLoading(true);
      const res = await api.post("/auth/reset-password", {
        email,
        otp,
        newPassword,
      });
      alert(res.data.message || "Password reset successful!");
      onClose();
      setStep(1);
      setEmail("");
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  // 🧩 Step forms
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your registered email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition-colors duration-200"
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </form>
        );

      case 2:
        return (
          <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
            <p className="text-sm text-gray-600">
              Enter the OTP sent to <span className="font-semibold">{email}</span>
            </p>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition-colors duration-200"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-sm text-blue-500 hover:underline"
            >
              Back
            </button>
          </form>
        );

      case 3:
        return (
          <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New Password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm Password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-colors duration-200"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
            <button
              type="button"
              onClick={() => setStep(2)}
              className="text-sm text-blue-500 hover:underline"
            >
              Back
            </button>
          </form>
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        onClose();
        setStep(1);
      }}
      title="Forgot Password"
      subtitle={
        step === 1
          ? "Enter your email to receive an OTP"
          : step === 2
          ? "Verify your OTP"
          : "Reset your password"
      }
    >
      {renderStep()}
    </Modal>
  );
};

export default ForgotPassword;
