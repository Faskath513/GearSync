import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2 } from "lucide-react";
import FormField from "../components/FormField";
import { AuthContext } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import api from "../api/auth";
import { changePassword, deleteMe, updateMe } from "../api/auth";

// Role-based styles
const roleStyles: Record<
  string,
  { bgGradient: string; card: string; button: string; dangerCard: string }
> = {
  customer: {
    bgGradient: "from-gray-900 via-green-900 to-teal-900",
    card: "bg-gradient-to-r from-green-400 to-teal-500",
    button: "bg-green-600 hover:bg-green-700",
    dangerCard: "bg-red-500/20 border-red-400/30",
  },
  employee: {
    bgGradient: "from-gray-900 via-purple-900 to-indigo-900",
    card: "bg-gradient-to-r from-purple-400 to-indigo-500",
    button: "bg-blue-600 hover:bg-blue-700",
    dangerCard: "bg-red-500/20 border-red-400/30",
  },
  admin: {
    bgGradient: "from-slate-900 via-blue-900 to-indigo-900",
    card: "bg-gradient-to-r from-blue-500 to-indigo-500",
    button: "bg-indigo-600 hover:bg-indigo-700",
    dangerCard: "bg-red-500/20 border-red-400/30",
  },
};

type ProfileState = {
  firstName: string;
  lastName: string;
  email: string;
  gender: string;
  country: string;
  language: string;
  timeZone: string;
};

const UserProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { logout, role } = useContext(AuthContext)!;

  const [userProfile, setUserProfile] = useState<ProfileState | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const normalizedRole = role ? role.toLowerCase().replace(/^role_/i, "") : "customer";
  const safeRole = roleStyles[normalizedRole] ? normalizedRole : "customer";
  const styles = roleStyles[safeRole];

  // Fetch current user from backend
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login first.");
      navigate("/login");
      return;
    }

    api
      .get("/auth/me")
      .then((res) => {
        // Backend returns { id, name, email, role, phoneNumber }
        const { name, email } = res.data as { name?: string; email: string };
        const [firstName = "", lastName = ""] = (name || "").split(/\s+/, 2);
        const mapped: ProfileState = {
          firstName,
          lastName,
          email,
          gender: "",
          country: "",
          language: "",
          timeZone: "",
        };
        setUserProfile(mapped);
      })
      .catch((err) => {
        console.error(err);
        alert("Failed to load user profile. Please login again.");
        logout();
        navigate("/login");
      });
  }, [logout, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (userProfile) setUserProfile({ ...userProfile, [name]: value });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
  };

  const handleResetPassword = async () => {
    if (!passwords.newPassword || passwords.newPassword !== passwords.confirmPassword) {
      alert("New passwords do not match or are empty.");
      return;
    }
    try {
      await changePassword({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
      alert("Password updated.");
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (e) {
      console.error(e);
      alert("Failed to change password.");
    }
  };

  const toggleEdit = () => setIsEditing(!isEditing);

  const handleSave = async () => {
    if (!userProfile) return;
    try {
      await updateMe({
        firstName: userProfile.firstName,
        lastName: userProfile.lastName,
        phoneNumber: "",
      });
      alert("Profile updated.");
      setIsEditing(false);
    } catch (e) {
      console.error(e);
      alert("Failed to update profile.");
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      try {
        await deleteMe();
        alert("Account deleted successfully!");
        logout();
        navigate("/");
      } catch (e) {
        console.error(e);
        alert("Failed to delete account.");
      }
    }
  };

  if (!userProfile) return <div className="text-white p-8">Loading...</div>;

  const initials = `${userProfile.firstName?.[0] || ""}${userProfile.lastName?.[0] || ""}`.toUpperCase();

  return (
    <div className={`flex h-screen relative overflow-hidden bg-gradient-to-br ${styles.bgGradient}`}>
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500 rounded-full opacity-15 animate-pulse" style={{ animationDelay: "2s" }}></div>
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-pink-500 rounded-full opacity-10 animate-pulse" style={{ animationDelay: "4s" }}></div>
      </div>

      {/* Sidebar */}
      <Sidebar role={role} onLogout={handleLogout} />

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto relative z-10 text-white">
        <h1 className="text-4xl font-extrabold mb-4">User Profile</h1>

        {/* Avatar */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-20 h-20 rounded-full bg-purple-400 flex items-center justify-center text-white text-2xl font-bold">
            {initials}
          </div>
          <div>
            <h2 className="text-xl font-bold">{userProfile.firstName} {userProfile.lastName}</h2>
            <p className="text-gray-300">{userProfile.email}</p>
          </div>
        </div>

        {/* Profile Form */}
        <form onSubmit={(e) => e.preventDefault()} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="First Name" name="firstName" value={userProfile.firstName} isEditing={isEditing} onChange={handleInputChange} />
          <FormField label="Last Name" name="lastName" value={userProfile.lastName} isEditing={isEditing} onChange={handleInputChange} />
          <FormField label="Gender" name="gender" type="select" options={["Female", "Male", "Other"]} value={userProfile.gender} isEditing={isEditing} onChange={handleInputChange} />
          <FormField label="Country" name="country" type="select" options={["Sri Lanka", "India", "United States"]} value={userProfile.country} isEditing={isEditing} onChange={handleInputChange} />
          <FormField label="Language" name="language" type="select" options={["English", "Sinhala", "Tamil"]} value={userProfile.language} isEditing={isEditing} onChange={handleInputChange} />
          <FormField label="Time Zone" name="timeZone" type="select" options={["(GMT+05:30) Sri Lanka Time", "(GMT+05:30) India Time"]} value={userProfile.timeZone} isEditing={isEditing} onChange={handleInputChange} />
        </form>

        <div className="mt-6">
          <button onClick={isEditing ? handleSave : () => setIsEditing(true)} className={`px-6 py-2 rounded-3xl font-semibold transition-transform duration-300 transform hover:scale-105 ${styles.button}`}>
            {isEditing ? "Save" : "Edit"}
          </button>
        </div>

        <hr className="my-8 border-white/20" />

        {/* Reset Password & Delete */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className={`p-6 rounded-3xl border border-white/20 shadow-2xl ${styles.card}`}>
            <h2 className="font-bold text-xl mb-4">Reset Password</h2>
            <FormField label="Current Password" name="currentPassword" type="password" value={passwords.currentPassword} isEditing={true} onChange={handlePasswordChange} />
            <FormField label="New Password" name="newPassword" type="password" value={passwords.newPassword} isEditing={true} onChange={handlePasswordChange} />
            <FormField label="Confirm Password" name="confirmPassword" type="password" value={passwords.confirmPassword} isEditing={true} onChange={handlePasswordChange} />
            <button onClick={handleResetPassword} className={`mt-4 px-4 py-2 rounded-3xl font-semibold transition-colors w-full ${styles.button}`}>
              Reset Password
            </button>
          </div>

          <div className={`p-6 rounded-3xl border shadow-2xl ${styles.dangerCard}`}>
            <h2 className="text-xl font-bold mb-4 text-red-400 flex items-center gap-2">
              <Trash2 /> Delete Account
            </h2>
            <p className="text-red-300 mb-4">Warning: Deleting your account is permanent and cannot be undone.</p>
            <button onClick={handleDeleteAccount} className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-3xl w-full transition-colors">
              Delete Account
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserProfilePage;
