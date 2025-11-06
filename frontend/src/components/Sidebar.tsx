import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Users,
  FileText,
  Settings,
  LogOut,
  ShoppingCart,
  User,
  LifeBuoy,
  CheckSquare,
} from "lucide-react";

// Define role types
type Role = "admin" | "customer" | "employee" | string | null;

// --- Helper Component for Sidebar Links ---
interface SidebarLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  baseColor: string; // 'blue', 'green', 'purple'
}

const SidebarLink: React.FC<SidebarLinkProps> = ({
  to,
  icon,
  label,
  baseColor,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive =
    location.pathname.startsWith(to) || 
    (location.pathname === "/profile" && to === "/profile");

  let activeClass = "";
  let hoverClass = "";

  switch (baseColor) {
    case "blue":
      activeClass = "bg-blue-500";
      hoverClass = "hover:bg-blue-500";
      break;
    case "green":
      activeClass = "bg-green-500";
      hoverClass = "hover:bg-green-500";
      break;
    case "purple":
      activeClass = "bg-purple-500"; 
      hoverClass = "hover:bg-purple-500";
      break;
    default:
      activeClass = "bg-gray-500";
      hoverClass = "hover:bg-gray-500";
  }

  return (
    <button
      className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
        isActive ? activeClass : hoverClass
      }`}
      onClick={() => navigate(to)}
    >
      {icon}
      {label}
    </button>
  );
};

// --- Main Sidebar Component ---
interface SidebarProps {
  role: Role;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ role, onLogout }) => {
  let sidebarContent;
  let baseGradient = "";
  let borderColor = "";
  let title = "";
  let baseColor = "";

  const normalizedRole = role ? role.toLowerCase().trim() : null;

  switch (normalizedRole) {
    case "admin":
      title = "Admin Panel";
      baseGradient = "from-blue-700 to-indigo-700";
      borderColor = "border-blue-500";
      baseColor = "blue";
      sidebarContent = (
        <>
          <SidebarLink
            to="/admin/users"
            label="User Management"
            icon={<Users className="w-5 h-5" />}
            baseColor={baseColor}
          />
          <SidebarLink
            to="/admin/reports"
            label="Reports"
            icon={<FileText className="w-5 h-5" />}
            baseColor={baseColor}
          />
          <SidebarLink
            to="/profile"
            label="My Profile"
            icon={<User className="w-5 h-5" />}
            baseColor={baseColor}
          />
          <SidebarLink
            to="/admin/settings"
            label="Settings"
            icon={<Settings className="w-5 h-5" />}
            baseColor={baseColor}
          />
          {/* Admin My Profile */}
          
        </>
      );
      break;

    case "customer":
      title = "Customer Panel";
      baseGradient = "from-green-600 to-teal-600";
      borderColor = "border-green-500";
      baseColor = "green";
      sidebarContent = (
        <>
          <SidebarLink
            to="/customer/orders"
            label="My Orders"
            icon={<ShoppingCart className="w-5 h-5" />}
            baseColor={baseColor}
          />
          <SidebarLink
            to="/profile"
            label="My Profile"
            icon={<User className="w-5 h-5" />}
            baseColor={baseColor}
          />
          <SidebarLink
            to="/customer/support"
            label="Support"
            icon={<LifeBuoy className="w-5 h-5" />}
            baseColor={baseColor}
          />
        </>
      );
      break;

    case "employee":
      title = "Employee Panel";
      baseGradient = "from-purple-600 to-indigo-600"; 
      borderColor = "border-purple-500";
      baseColor = "purple";
      sidebarContent = (
        <>
          <SidebarLink
            to="/employee/tasks"
            label="My Tasks"
            icon={<CheckSquare className="w-5 h-5" />}
            baseColor={baseColor}
          />
          <SidebarLink
            to="/profile"
            label="My Profile"
            icon={<User className="w-5 h-5" />}
            baseColor={baseColor}
          />
          <SidebarLink
            to="/employee/reports"
            label="Reports"
            icon={<FileText className="w-5 h-5" />}
            baseColor={baseColor}
          />
        </>
      );
      break;

    default:
      title = "Panel";
      sidebarContent = <p>Loading navigation...</p>;
  }

  return (
    <aside
      className={`w-64 ${baseGradient} text-white flex flex-col shadow-2xl z-10`}
    >
      <div className={`p-6 text-2xl font-bold border-b ${borderColor}`}>
        {title}
      </div>
      <nav className="flex-1 p-4 space-y-2">{sidebarContent}</nav>
      <div className={`p-4 border-t ${borderColor}`}>
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded-lg transition-all"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
