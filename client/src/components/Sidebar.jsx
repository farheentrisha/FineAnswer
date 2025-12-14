import React from 'react';
import './Sidebar.css';
export default function Sidebar() {
  return (
    <aside className="sidebar">
      <h3 className="logo">StudyGlobal</h3>

      <nav>
        <a className="active">Dashboard</a>
        <a>My Applications</a>
        <a>Universities</a>
        <a>Documents</a>
        <a>Deadlines</a>
        <a>Sessions</a>
        <a>Messages</a>
        <a>Profile</a>
      </nav>

      <div className="sidebar-cta">
        <p>Need Guidance?</p>
        <button>Book 1:1 Session</button>
      </div>
    </aside>
  );
}
