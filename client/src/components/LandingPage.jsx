import React from "react";
import { Link } from "react-router-dom";
import "./LandingPage.css"; // optional if you use custom CSS

export default function LandingPage() {
  return (
    <div className="landing-container">
      <div className="hero-section">
        <h1>Welcome to FineAnswer</h1>
        <p>Your trusted partner in study abroad guidance</p>
        <div className="btn-group">
          <Link to="/login" className="btn login-btn">Login</Link>
          <Link to="/register" className="btn register-btn">Register</Link>
        </div>
      </div>
    </div>
  );
}
