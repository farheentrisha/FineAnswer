import React from "react";
import "./DashboardPage.css";

export default function DashboardPage() {
  // Get user info from localStorage
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Welcome to FineAnswer 🎓</h1>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className="dashboard-content">
        <h2>Hello, {user?.name || "User"} 👋</h2>
        <p>
          You’re now logged in to your FineAnswer Dashboard. From here you can explore:
        </p>

        <ul>
          <li>🌍 Study Abroad Opportunities</li>
          <li>🎓 Top Universities and Programs</li>
          <li>💰 Scholarship Recommendations</li>
          <li>📊 Personalized Study Plans</li>
        </ul>

        <p className="footer-note">This is a demo dashboard — more features coming soon!</p>
      </div>
    </div>
  );
}
