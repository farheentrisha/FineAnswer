import { NavLink, useNavigate } from "react-router-dom";
import { useContext } from "react";
import {
  FaHome,
  FaFileAlt,
  FaUniversity,
  FaFolderOpen,
  FaVideo,
  FaEnvelope,
  FaUser,
  FaSignOutAlt,
} from "react-icons/fa";
import { AuthContext } from "../pages/Provider/ContextProvider";
import "./Sidebar.css";


export default function Sidebar() {
  const { logOut } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logOut();
    navigate("/login");
  };
  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-icon">✈️</div>
        <h3> <a href="/"> FineAnswer </a></h3>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <NavLink to="/dashboard" end>
          <FaHome /> <span>Dashboard</span>
        </NavLink>

        <NavLink to="/dashboard/universities">
          <FaUniversity /> <span>Universities</span>
        </NavLink>

        <NavLink to="/dashboard/documentchecklist">
          <FaFolderOpen /> <span>Documents</span>
        </NavLink>

        <NavLink to="/dashboard/sessions">
          <FaVideo /> <span>Sessions</span>
        </NavLink>

        <NavLink to="/dashboard/messages">
          <FaEnvelope /> <span>Messages</span>
        </NavLink>

        <NavLink to="/dashboard/profile">
          <FaUser /> <span>Profile</span>
        </NavLink>
      </nav>

      {/* Logout */}
      <button className="logout-btn" onClick={handleLogout}>
        <FaSignOutAlt /> Logout
      </button>
    </aside>
  );
}
