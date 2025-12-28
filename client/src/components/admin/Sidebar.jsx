import { FaUserGraduate, FaCog, FaChartBar } from "react-icons/fa";

export default function Sidebar() {
  return (
    <aside className="admin-sidebar">
      <div className="logo">
        <span>🛡️</span>
        <div>
          <h3>Admin Panel</h3>
          <p>StudyGlobal</p>
        </div>
      </div>

      <nav>
        <p className="menu-title">MAIN</p>
        <a>Dashboard</a>
        <a>Analytics</a>

        <p className="menu-title">MANAGEMENT</p>
        <a className="active">
          <FaUserGraduate /> Students <span className="badge">4</span>
        </a>
        <a>Counselors</a>
        <a>Universities</a>
        <a>Applications <span className="badge">23</span></a>
        <a>Sessions</a>
        <a>Documents</a>

        <p className="menu-title">SYSTEM</p>
        <a><FaCog /> Settings</a>
      </nav>
    </aside>
  );
}
