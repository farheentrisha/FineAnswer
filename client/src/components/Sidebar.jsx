import React from "react";
import {
  FaHome,
  FaFileAlt,
  FaUniversity,
  FaFolderOpen,
  FaCalendarAlt,
  FaVideo,
  FaEnvelope,
  FaUser,
  FaSignOutAlt,
} from "react-icons/fa";
import "./Sidebar.css";

export default function Sidebar() {
  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-icon">✈️</div>
        <div>
          <h3>StudyGlobal</h3>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <a className="active"><FaHome /> <span>Dashboard</span></a>
        <a><FaFileAlt /> <span>My Applications</span></a>
        <a><FaUniversity /> <span>Universities</span></a>
        <a><FaFolderOpen /> <span>Documents</span></a>
        <a><FaVideo /> <span>Sessions</span></a>
        <a><FaEnvelope /> <span>Messages</span></a>
        <a><FaUser /> <span>Profile</span></a>
      </nav>

      {/* CTA */}
      <div className="sidebar-cta">
        <div className="cta-icon">🎖️</div>
        <p className="cta-title">Need Guidance?</p>
        <p className="cta-sub">Expert counselors available</p>
        <button>Book 1:1 Session</button>
      </div>

      {/* Logout */}
      <button className="logout-btn">
        <FaSignOutAlt /> Logout
      </button>
    </aside>
  );
}
