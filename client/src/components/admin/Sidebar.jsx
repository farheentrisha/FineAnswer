import { NavLink, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { FaUserGraduate, FaCog, FaChartBar, FaSignOutAlt } from "react-icons/fa";
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
          <h3>Admin Panel</h3>
          <p>FineAnswer</p>
        </div>
      </div>

      <nav>
        <p className="menu-title">MAIN</p>
        <NavLink to="/admin/dashboard" end>
          Dashboard
        </NavLink>
        <NavLink to="/admin/analytics">
          Analytics
        </NavLink>

        <p className="menu-title">MANAGEMENT</p>
        <NavLink to="/admin/students">
          <FaUserGraduate /> Students <span className="badge">4</span>
        </NavLink>
        <NavLink to="/admin/counselors">
          Counselors
        </NavLink>
        <NavLink to="/admin/universities">
          Universities
        </NavLink>
        <NavLink to="/admin/applications">
          Applications <span className="badge">23</span>
        </NavLink>
        <NavLink to="/admin/sessions">
          Sessions
        </NavLink>
        <NavLink to="/admin/documents">
          Documents
        </NavLink>

        <p className="menu-title">SYSTEM</p>
        <NavLink to="/admin/settings">
          <FaCog /> Settings
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
