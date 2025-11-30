import React from "react";
import { useNavigate } from "react-router-dom";
import "../css/navbar3.css";

export default function Navbar() {
  const navigate = useNavigate();

  return (
    <header className="minimal-navbar">
      <div className="nav-inner">

        {/* Left Logo */}
        <div className="nav-logo">FineAnswer</div>

        {/* Right Menu */}
        <nav className="nav-menu">
          <a href="/">Home</a>
          <a href="/about">About</a>
          <a href="/services">Services</a>
          <a href="/countries">Countries</a>
          <a href="/events">Events</a>
          <a href="/contact">Contact</a>

          <button className="nav-btn" onClick={() => navigate("/register")}>
            Join Now
          </button>
        </nav>

      </div>
    </header>
  );
}
