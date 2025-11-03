import React from "react";
import "./HeroSection.css";
import heroBg from "../assets/hero-bg3.jpg";

export default function HeroSection() {
  return (
    <section
      className="hero"
      style={{ backgroundImage: `url(${heroBg})` }}
    >
      <div className="overlay">
        <div className="hero-content">
          <h2>Dream Big</h2>
          <h1>Achieve Anywhere</h1>
          <button className="quote-btn">Book Free Consultation</button>
        </div>
      </div>
    </section>
  );
}
