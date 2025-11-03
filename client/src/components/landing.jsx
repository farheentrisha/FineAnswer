import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./landing.css";
import uni1 from "../images/uni1.jpg";
import uni2 from "../images/uni2.jpg";
import uni3 from "../images/uni3.jpg";

export default function LandingPage() {
  const navigate = useNavigate();
  const images = [uni1, uni2, uni3];
  const [currentImage, setCurrentImage] = useState(0);

  // For statistics animation
  const statsRef = useRef(null);
  const [statsVisible, setStatsVisible] = useState(false);

  const [students, setStudents] = useState(0);
  const [countries, setCountries] = useState(0);
  const [partners, setPartners] = useState(0);
  const [satisfaction, setSatisfaction] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Count up animation
  useEffect(() => {
    if (!statsVisible) return;

    const duration = 2000; // 2 seconds
    const start = Date.now();

    const target = { students: 500, countries: 4, partners: 16, satisfaction: 98 };

    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - start) / duration, 1);

      setStudents(Math.floor(target.students * progress));
      setCountries(Math.floor(target.countries * progress));
      setPartners(Math.floor(target.partners * progress));
      setSatisfaction(Math.floor(target.satisfaction * progress));

      if (progress < 1) requestAnimationFrame(animate);
    };

    animate();
  }, [statsVisible]);

  // Detect when statistics section is visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setStatsVisible(true);
          observer.disconnect(); // Only trigger once
        }
      },
      { threshold: 0.5 }
    );

    if (statsRef.current) observer.observe(statsRef.current);

    return () => observer.disconnect();
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
          Join Now
        </button>
      </header>

      {/* HERO SECTION */}
      <section className="hero">
        {images.map((img, index) => (
          <div
            key={index}
            className="hero-slide"
            style={{
              backgroundImage: `url(${img})`,
              opacity: index === currentImage ? 1 : 0,
            }}
          ></div>
        ))}
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

      {/* STATISTICS SECTION */}
      <section className="statistics" ref={statsRef}>
        <div className="stat">
          <h2>{students}+</h2>
          <p>Students Passed</p>
        </div>
        <div className="stat">
          <h2>{countries}</h2>
          <p>Countries</p>
        </div>
        <div className="stat">
          <h2>{partners}+</h2>
          <p>Partner Institutions</p>
        </div>
        <div className="stat">
          <h2>{satisfaction}%</h2>
          <p>Satisfaction Rate</p>
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
