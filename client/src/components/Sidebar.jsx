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
        <a className="active"><FaHome /> Dashboard</a>
        <a><FaFileAlt /> My Applications</a>
        <a><FaUniversity /> Universities</a>
        <a><FaFolderOpen /> Documents</a>
        <a><FaCalendarAlt /> Deadlines</a>
        <a><FaVideo /> Sessions</a>
        <a><FaEnvelope /> Messages</a>
        <a><FaUser /> Profile</a>
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
