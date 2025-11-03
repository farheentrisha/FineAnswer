import React from "react";
import "./Navbar.css";

export default function Navbar() {
  return (
    <header className="navbar">
      {/* === Top Section === */}
      <div className="navbar-inner">
        <div className="navbar-top">
          <div className="navbar-left">
            <div className="navbar-logo">
              <img
                src="/logo.png"
                alt="Ocean Transit"
                className="logo-img"
              />
              <div className="logo-text">
                <h1>FineAnswer</h1>
                <p>Study Abroad</p>
              </div>
            </div>
          </div>

          <div className="navbar-right">
            <div className="contact-info">
              <span>📞 01725-971833</span>
              <span>24 x 7 Support</span>
            </div>
            <div className="track">
              <span>📦 studyabroad@fineanswer.net</span>
              <p>    Find Your Cargo</p>
            </div>
          </div>
        </div>

        {/* === Divider Line === */}
        <div className="navbar-line"></div>

        {/* === Bottom Navigation === */}
        <nav className="navbar-main">
          <a href="#">Home</a>
          <a href="#">About</a>
          <a href="#">Services</a>
          <a href="#">Check Eligibility</a>

          <a href="#">Contact</a>
          <a href="#">Login</a>
          
          
        </nav>
      </div>
    </header>
  );
}
