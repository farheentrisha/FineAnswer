import React, { useState, useContext } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { AuthContext } from "../pages/Provider/ContextProvider";
import "../css/navbar3.css";
import logo from "../images/logo.png";

export default function Navbar() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, isAdmin } = useContext(AuthContext);

  const getInitials = () => {
    if (user?.name) {
      return user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return "?";
  };

  const handleProfileClick = () => {
    setMenuOpen(false);
    navigate(isAdmin ? "/admin/dashboard" : "/dashboard");
  };

  return (
    <header
      className="minimal-navbar"
    >
      <div className="nav-inner">
        <div className="nav-logo" onClick={() => navigate("/")}>
          <img src={logo} alt="Logo" />
        </div>

        <nav className={`nav-menu ${menuOpen ? "open" : ""}`}>
          <NavLink to="/" onClick={() => setMenuOpen(false)}>Home</NavLink>
          <NavLink to="/about" onClick={() => setMenuOpen(false)}>About</NavLink>
          <NavLink to="/services" onClick={() => setMenuOpen(false)}>Services</NavLink>
          <NavLink to="/countries" onClick={() => setMenuOpen(false)}>Countries</NavLink>
          <NavLink to="/contact" onClick={() => setMenuOpen(false)}>Contact</NavLink>
          <NavLink to="/career" onClick={() => setMenuOpen(false)}>Career</NavLink>
          <NavLink to="/blog" onClick={() => setMenuOpen(false)}>Blog</NavLink>
          
          {user ? (
            <button
              className="nav-profile-btn"
              onClick={handleProfileClick}
              title={`Go to ${isAdmin ? "Admin" : "User"} Dashboard`}
            >
              {user.picture ? (
                <img src={user.picture} alt={user.name || "Profile"} className="nav-profile-img" />
              ) : (
                <span className="nav-profile-initials">{getInitials()}</span>
              )}
            </button>
          ) : (
            <button
              className="nav-btn"
              onClick={() => {
                setMenuOpen(false);
                navigate("/register");
              }}
            >
              Join Now
            </button>
          )}
        </nav>

        <div
          className="hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </header>
  );
}
