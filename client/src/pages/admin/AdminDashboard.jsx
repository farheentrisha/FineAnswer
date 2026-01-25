import { useContext } from "react";
import { AuthContext } from "../Provider/ContextProvider";
import Students from "./Students";

export default function AdminDashboard() {
  const { user, isAdmin } = useContext(AuthContext);

  // If somehow a non-admin gets here, show warning
  if (!isAdmin) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h2 style={{ color: "#dc2626" }}>Access Denied</h2>
        <p>You don't have admin privileges. Redirecting...</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ color: "#0369a1", marginBottom: "8px" }}>
          Admin Dashboard
        </h2>
        <p style={{ color: "#64748b" }}>
          Welcome, {user?.name || "Admin"}! Manage your platform here.
        </p>
        <p style={{ color: "#10b981", fontSize: "0.9rem", marginTop: "8px" }}>
          ✓ Admin Access Confirmed
        </p>
      </div>

      <Students />
    </div>
  );
}
