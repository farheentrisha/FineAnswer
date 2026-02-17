import { useContext } from "react";
import { FaBars, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { AuthContext } from "../../pages/Provider/ContextProvider";

export default function Topbar({
  sidebarCollapsed = false,
  onToggleSidebar,
  onToggleMobileSidebar,
}) {
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
        <div className="admin-topbar-titleRow">
          <button
            type="button"
            className="admin-topbar-burger"
            onClick={onToggleMobileSidebar}
            aria-label="Open sidebar"
          >
            <FaBars />
          </button>
          <button
            type="button"
            className="admin-topbar-collapse"
            onClick={onToggleSidebar}
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
          </button>
          <div>
            <h2>Admin Dashboard</h2>
            <p>Manage and monitor your platform</p>
          </div>
        </div>
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
