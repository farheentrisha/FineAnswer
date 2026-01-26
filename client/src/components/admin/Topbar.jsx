import { useContext } from "react";
import { AuthContext } from "../../pages/Provider/ContextProvider";

export default function Topbar() {
  const { user } = useContext(AuthContext);
  
  const getUserInitials = () => {
    if (user?.name) {
      return user.name
        .split(" ")
        .map(n => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return "AU";
  };

  return (
    <header className="topbar">
      <div>
        <h2>Admin Dashboard</h2>
        <p>Manage and monitor your platform</p>
      </div>

      <div className="topbar-right">
        <input placeholder="Search anything..." />
        <div className="admin-user">
          <div className="avatar">{getUserInitials()}</div>
          <div>
            <strong>{user?.name || "Admin User"}</strong>
            <small>Administrator</small>
          </div>
        </div>
      </div>
    </header>
  );
}
