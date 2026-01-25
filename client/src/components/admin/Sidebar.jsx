import { NavLink, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { FaSignOutAlt } from "react-icons/fa";
import { AuthContext } from "../../pages/Provider/ContextProvider";

export default function Sidebar() {
  const { logOut } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logOut();
    navigate("/login");
  };
  return (
    <aside className="admin-sidebar">
      <div className="logo">
        <span>🛡️</span>
        <div>
          <h3><a href="/">FineAnswer</a></h3>
          <p>FineAnswer</p>
        </div>
      </div>

      <nav>
        <NavLink to="/admin/dashboard" end>
          Dashboard
        </NavLink>
        <NavLink to="/admin/analytics">
          Analytics
        </NavLink>
        <NavLink to="/admin/success-stories">
          Success Stories
        </NavLink>
        <NavLink to="/admin/blog">
          Blog
        </NavLink>
        <NavLink to="/admin/career">
          Career
        </NavLink>
        <NavLink to="/admin/tracker-update">
          Tracker Update
        </NavLink>
        <NavLink to="/admin/sessions">
          Session
        </NavLink>
        <NavLink to="/admin/students-info">
          Get overall info About students
        </NavLink>
      </nav>

      {/* Logout */}
      <button className="logout-btn" onClick={handleLogout} style={{
        marginTop: "auto",
        padding: "12px 16px",
        border: "1px solid rgba(255,255,255,0.3)",
        borderRadius: "10px",
        background: "transparent",
        color: "#fff",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        width: "100%",
        fontSize: "14px",
        fontWeight: "500",
        transition: "0.25s"
      }}>
        <FaSignOutAlt /> Logout
      </button>
    </aside>
  );
}
