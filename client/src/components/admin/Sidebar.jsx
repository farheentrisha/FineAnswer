import { NavLink, useNavigate } from "react-router-dom";
import { useContext } from "react";
import {
  FaTachometerAlt,
  FaChartBar,
  FaStar,
  FaBlog,
  FaBriefcase,
  FaTasks,
  FaVideo,
  FaUsers,
  FaSignOutAlt,
} from "react-icons/fa";
import { AuthContext } from "../../pages/Provider/ContextProvider";
import "../Sidebar.css";

export default function Sidebar() {
  const { logOut } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logOut();
    navigate("/login");
  };

  return (
    <aside className="sidebar">
      {/* Logo - same style as user dashboard */}
      <div className="sidebar-logo">
        <div className="logo-icon">🛡️</div>
        <div>
          <h3>
            <a href="/">FineAnswer</a>
          </h3>
          <span>Admin Panel</span>
        </div>
      </div>

      {/* Navigation - same layout as user sidebar */}
      <nav className="sidebar-nav">
        <NavLink to="/admin/dashboard" end>
          <FaTachometerAlt /> <span>Dashboard</span>
        </NavLink>

        <NavLink to="/admin/analytics">
          <FaChartBar /> <span>Analytics</span>
        </NavLink>

        <NavLink to="/admin/success-stories">
          <FaStar /> <span>Success Stories</span>
        </NavLink>

        <NavLink to="/admin/blog">
          <FaBlog /> <span>Blog</span>
        </NavLink>

        <NavLink to="/admin/career">
          <FaBriefcase /> <span>Career</span>
        </NavLink>

        <NavLink to="/admin/tracker-update">
          <FaTasks /> <span>Tracker Update</span>
        </NavLink>

        <NavLink to="/admin/sessions">
          <FaVideo /> <span>Sessions</span>
        </NavLink>

        <NavLink to="/admin/students-info">
          <FaUsers /> <span>Students Info</span>
        </NavLink>
      </nav>

      {/* Logout - shares same styling as user sidebar */}
      <button className="logout-btn" onClick={handleLogout}>
        <FaSignOutAlt /> Logout
      </button>
    </aside>
  );
}
