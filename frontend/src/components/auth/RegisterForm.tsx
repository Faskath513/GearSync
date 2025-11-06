import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register, RegisterRequest } from "../../api/auth";

// Home accent sweep
const ACCENT_GRADIENT = "bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400";

const RegisterForm: React.FC = () => {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validation
    if (!firstName.trim() || !lastName.trim()) {
      setError("First and last name are required.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    
    // Password validation
    if (password.length < 5) {
      setError("Password must be at least 5 characters.");
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
        role: "CUSTOMER",
      };
      const response = await register(payload);
      console.log("Registration successful:", response);
      
      // Show success message first
      setSuccess(true);
      setLoading(false);
      
      // Clear form fields
      setFirstName("");
      setLastName("");
      setPhoneNumber("");
      setEmail("");
      setPassword("");
      
      // Redirect to login page after showing success message
      setTimeout(() => {
        console.log("Reistration successful");
        try {
          navigate("/login", { replace: true });
        } catch (navError) {
          console.error("Navigation error:", navError);
          // Fallback: use window.location if navigate fails
          window.location.href = "/login";
        }
      }, 2000);
    } catch (error: any) {
      console.error("Registration error:", error);
      
      // Extract error message properly - handle both string and object responses
      let errorMessage = "Registration failed. Please try again.";
      
      if (error.response?.data) {
        const data = error.response.data;
        if (typeof data === 'string') {
          errorMessage = data;
        } else if (data?.message) {
          errorMessage = data.message;
        } else if (data?.error) {
          errorMessage = data.error;
        } else if (typeof data === 'object' && data !== null) {
          // Handle validation errors from backend (e.g., {password: "error", email: "error"})
          const errorMessages = Object.values(data).filter(v => typeof v === 'string') as string[];
          if (errorMessages.length > 0) {
            // Show all validation errors, one per line
            errorMessage = errorMessages.join('. ');
          } else {
            // Fallback: stringify the object
            errorMessage = "Validation failed. Please check your input.";
          }
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
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

            {success ? (
              <div className="flex flex-col items-center gap-4 py-8">
                <div className="flex items-start gap-3 rounded-lg border border-green-500/30 bg-green-500/10 px-6 py-4 text-center">
                  <span className="font-medium text-green-300">Registration successful! Redirecting to login page...</span>
                </div>
              </div>
            ) : (
              <>
                {error && (
                  <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                    <span>{typeof error === 'string' ? error : String(error)}</span>
                  </div>
                )}

                {loading ? (
                  <div className="flex flex-col items-center gap-4 py-8">
                    <div className="flex items-center gap-3 text-slate-300">
                      <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                      <span className="font-medium">Registering your account...</span>
                    </div>
                  </div>
                ) : (
                  <>
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
                        placeholder="Password (minimum 5 characters)"
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-300"
                        required
                        minLength={5}
                      />
                      <div className="text-xs text-slate-400">
                        Password must be at least 5 characters.
                      </div>
                      <button
                        type="submit"
                        className={`w-full ${ACCENT_GRADIENT} text-slate-950 font-semibold py-3 rounded-lg shadow-lg shadow-cyan-500/20 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300`}
                      >
                        Register
                      </button>
                    </form>

                    <div className="mt-4 text-sm text-slate-400">
                      Already have an account?{' '}
                      <Link to="/login" className="text-cyan-300 hover:text-cyan-200 underline-offset-4 hover:underline">
                        Login
                      </Link>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;