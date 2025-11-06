import React, { useState } from "react";
import { register, RegisterRequest } from "../../api/auth";

// Home accent sweep
const ACCENT_GRADIENT = "bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400";

const RegisterForm: React.FC = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: RegisterRequest = {
        firstName,
        lastName,
        phoneNumber,
        email,
        password,
        role: "CUSTOMER",
      };
      console.log("Sending payload:", payload);
      const res = await register(payload);
      console.log("Registered user:", res);
      alert("Registered successfully!");
    } catch (error: any) {
      console.error("Full error:", error);
      console.error("Error response:", error.response?.data);
      const errorMessage =
        error.response?.data?.message || error.response?.data || error.message;
      alert("Error registering: " + errorMessage);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden text-white">
      {/* Background: dark gradient + radial highlights + subtle grid (matches Home) */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />
        <div
          className="pointer-events-none absolute -top-40 left-1/2 h-[60rem] w-[60rem] -translate-x-1/2 rounded-full opacity-20 blur-3xl"
          style={{
            background:
              "radial-gradient(closest-side, rgba(34,211,238,0.35), transparent 70%)",
          }}
        />
        <div
          className="pointer-events-none absolute top-1/3 right-[-20%] h-[40rem] w-[40rem] rounded-full opacity-15 blur-3xl"
          style={{
            background:
              "radial-gradient(closest-side, rgba(99,102,241,0.35), transparent 70%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* Centered card */}
      <div className="mx-auto max-w-7xl px-6 py-16 grid place-items-center">
        <div className="relative w-full max-w-md">
          {/* subtle glow accents */}
          <div className="pointer-events-none absolute -top-14 -left-10 h-32 w-32 rounded-full bg-cyan-400/20 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-12 -right-8 h-32 w-32 rounded-full bg-indigo-400/20 blur-2xl" />

          <div className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_20px_60px_-10px_rgba(0,0,0,0.6)] p-6">
            <div className="mb-6">
              <h1 className="text-xl font-semibold">Create your account</h1>
              <p className="text-sm text-slate-400">
                Sign up to get started. (Default role is Customer)
              </p>
            </div>

            {/* UI updated only — fields unchanged */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First Name"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-300"
                required
              />
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last Name"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-300"
                required
              />

              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-300"
                required
              />
              <input
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Phone Number"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-300"
                required
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-300"
                required
              />
              <button
                type="submit"
                className={`w-full ${ACCENT_GRADIENT} text-slate-950 font-semibold py-3 rounded-lg shadow-lg shadow-cyan-500/20 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300`}
              >
                Register
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;