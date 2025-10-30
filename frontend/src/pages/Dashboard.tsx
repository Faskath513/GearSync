import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const Dashboard: React.FC = () => {
  const { logout } = useContext(AuthContext)!;
  return (
    <div>
      <h1>Dashboard (Protected)</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

export default Dashboard;