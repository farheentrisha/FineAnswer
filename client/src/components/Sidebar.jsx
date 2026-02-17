import { NavLink, useNavigate } from "react-router-dom";
import { useContext } from "react";
import {
  FaHome,
  FaUniversity,
  FaFolderOpen,
  FaVideo,
  FaEnvelope,
  FaUser,
  FaSignOutAlt,
} from "react-icons/fa";
import { AuthContext } from "../pages/Provider/ContextProvider";
import "./Sidebar.css";


export default function Sidebar({
  collapsed = false,
  mobileOpen = false,
  onCloseMobile,
}) {
  const { logOut } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logOut();
    navigate("/login");
  };
  return (
    <aside
      className={`sidebar ${collapsed ? "sidebar--collapsed" : ""} ${
        mobileOpen ? "sidebar--mobileOpen" : ""
      }`}
    >
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-icon">✈️</div>
        <h3> <a href="/"> FineAnswer </a></h3>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav" onClick={() => onCloseMobile?.()}>
        <NavLink to="/dashboard" end title="Dashboard">
          <FaHome /> <span>Dashboard</span>
        </NavLink>

        <NavLink to="/dashboard/universities" title="Universities">
          <FaUniversity /> <span>Universities</span>
        </NavLink>

        <NavLink to="/dashboard/documentchecklist" title="Documents">
          <FaFolderOpen /> <span>Documents</span>
        </NavLink>

        <NavLink to="/dashboard/sessions" title="Sessions">
          <FaVideo /> <span>Sessions</span>
        </NavLink>

        <NavLink to="/dashboard/messages" title="Messages">
          <FaEnvelope /> <span>Messages</span>
        </NavLink>

        <NavLink to="/dashboard/profile" title="Profile">
          <FaUser /> <span>Profile</span>
        </NavLink>
      </nav>

      {/* Logout */}
      <button className="logout-btn" onClick={handleLogout} title="Logout">
        <FaSignOutAlt /> Logout
      </button>
    </aside>
  );
}
