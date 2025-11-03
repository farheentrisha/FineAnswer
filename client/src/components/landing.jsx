import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./landing.css";
import uni1 from "../images/uni1.jpg";
import uni2 from "../images/uni2.jpg";
import uni3 from "../images/uni3.jpg";


export default function LandingPage() {
  const navigate = useNavigate();

  // Background slider images
  const images = [
   uni1, uni2, uni3
  ];

  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    // Slide images every 5 seconds
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const inputs = document.querySelectorAll(".search-bar input, .search-bar select");
    inputs.forEach((el) => {
      el.addEventListener("focus", () => (el.style.boxShadow = "0 0 10px rgba(0,119,255,0.5)"));
      el.addEventListener("blur", () => (el.style.boxShadow = "none"));
    });
  }, []);

  return (
    <div className="LandingPage">
      {/* HEADER */}
      <header>
        <div className="logo">FineAnswer</div>
        <nav>
          <a href="#">Home</a>
          <a href="#">About</a>
          <a href="#">Services</a>
          <a href="#">Countries</a>
          <a href="#">Events</a>
          <a href="#">Contact</a>
        </nav>
        <button className="consult-btn" onClick={() => navigate("/register")}>
          Book Consultation
        </button>
      </header>

      {/* HERO SECTION */}
      <section
        className="hero"
        style={{
          backgroundImage: `url(${images[currentImage]})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          transition: "background-image 1s ease-in-out",
        }}
      >
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>Study Abroad with Confidence</h1>
          <p>
            Find your dream university with FineAnswer. We’ll guide you through every step — from
            applications to arrival.
          </p>

          <div className="search-bar">
            <input type="text" placeholder="Search Program or Course" />
            <select>
              <option>All Countries</option>
              <option>USA</option>
              <option>UK</option>
              <option>Canada</option>
              <option>Australia</option>
            </select>
            <button>🔍</button>
          </div>
        </div>
      </section>

      {/* SERVICES SECTION */}
      <section className="services">
        <h2>Our Services</h2>
        <div className="service-grid">
          <div className="service-card">🎓 Admission Support</div>
          <div className="service-card">✈️ Visa Guidance</div>
          <div className="service-card">💰 Scholarship Advice</div>
          <div className="service-card">📚 IELTS Preparation</div>
          <div className="service-card">🧭 Career Counseling</div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <p>© 2025 FineAnswer Study Abroad Consultancy. All rights reserved.</p>
      </footer>
    </div>
  );
}
