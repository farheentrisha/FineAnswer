import React, { useState, useEffect } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import "../css/navbar3.css";
import logo from "../images/logo.png";

export default function Navbar() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;

      // fix navbar only after scrolling
      setScrolled(currentScroll > 80);

      if (currentScroll > lastScrollY && currentScroll > 120) {
        setHidden(true);   // scrolling down
      } else {
        setHidden(false);  // scrolling up
      }

      setLastScrollY(currentScroll);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <header
  className={`minimal-navbar ${scrolled ? "navbar-fixed scrolled" : ""} ${hidden ? "nav-hide" : "nav-show"}`}
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
