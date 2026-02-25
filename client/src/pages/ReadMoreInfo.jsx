import React from "react";
import { useNavigate } from "react-router-dom"; // Assumes you are using react-router
import "./ReadMoreInfo.css";
import fineImg from "../assets/fine.jpg";

export default function ReadMoreInfo() {
  const navigate = useNavigate();

  return (
    <div className="read-more-container">
      {/* Upper Hero Section with Back Navigation */}
      <div className="hero-header">
  <div className="breadcrumb">
    <button className="back-link" onClick={() => navigate(-1)}>
      <span>←</span> Back
    </button>
    <span className="breadcrumb-path">Home &gt; About Us</span>
  </div>
  <h1>About Us</h1>
</div>

      {/* Section 1: Visa Success */}
      <section className="info-section">
        <div className="info-content">
          <span className="section-label">Visa Success</span>
          <h2>Experience the highest visa success rate in Bangladesh.</h2>
          <p>
            Navigating international borders requires precision and expert strategy. 
            We specialize in turning complex applications into success stories, 
            boasting a 100% success rate for female applicants and specific universities.
          </p>
          <ul className="feature-list">
            <li>Mock visa interviews for Sept 2024 & Jan 2025 intakes</li>
            <li>Unmatched success for TUD, SETU, ATU, TUS, and UCC</li>
            <li>Specialized support for difficult visa situations</li>
          </ul>
          <button className="btn-modern" onClick={() => navigate("/#success-stories")}>View Our Success Stories →</button>
        </div>
        <div className="info-image">
  <img src={fineImg} alt="Students" />
</div>
      </section>

      {/* Section 2: Services (Alternating) */}
      <section className="info-section reverse">
        <div className="info-content">
          <span className="section-label">Our Mission</span>
          <h2>Comprehensive support tailored for working professionals.</h2>
          <p>
            From university selection to pre-departure briefings, we offer a 
            complete A-Z service. Our unique analytical representation ensures 
            your application stands out to immigration officers.
          </p>
          <ul className="feature-list">
            <li>Zero consultancy fee for document assessment</li>
            <li>In-person and remote service for busy professionals</li>
            <li>Guaranteed accommodation service for all intakes</li>
          </ul>
          <button className="btn-modern" onClick={() => navigate("/#contact")}>Join Our Coaching →</button>
        </div>
        <div className="info-image">
          <img src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&q=80&w=800" alt="Consultation" />
        </div>
      </section>
    </div>
  );
}