import React, { useEffect, useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import "../css/navbar3.css";
import logo from "../images/logo.png";

export default function Navbar() {
  const navigate = useNavigate();
  const [hidden, setHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  // Scroll hide/show logic
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > lastScrollY && window.scrollY > 80) {
        setHidden(true);   // scrolling down
      } else {
        setHidden(false);  // scrolling up
      }
      setLastScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <header className={`minimal-navbar ${hidden ? "nav-hide" : "nav-show"}`}>
      <div className="nav-inner">

        {/* Logo */}
        <div className="nav-logo" onClick={() => navigate("/")}>
          <img src={logo} alt="Logo" />
        </div>

        {/* Menu */}
        <nav className={`nav-menu ${menuOpen ? "open" : ""}`}>
          <NavLink to="/" onClick={() => setMenuOpen(false)}>Home</NavLink>
          <NavLink to="/about" onClick={() => setMenuOpen(false)}>About</NavLink>
          <NavLink to="/services" onClick={() => setMenuOpen(false)}>Services</NavLink>
          <NavLink to="/countries" onClick={() => setMenuOpen(false)}>Countries</NavLink>
          <NavLink to="/contact" onClick={() => setMenuOpen(false)}>Contact</NavLink>
          <NavLink to="/career" onClick={() => setMenuOpen(false)}>Career</NavLink>
          <NavLink to="/blog" onClick={() => setMenuOpen(false)}>Blog</NavLink>

          <button
            className="nav-btn"
            onClick={() => {
              setMenuOpen(false);
              navigate("/register");
            }}
          >
            Join Now
          </button>
        </nav>

        {/* Hamburger (Mobile) */}
        <div
          className={`hamburger ${menuOpen ? "active" : ""}`}
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
