import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom"; // <-- import Link
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebookF, faInstagram, faLinkedinIn, faYoutube } from "@fortawesome/free-brands-svg-icons";

import "./LandingPage.css";

const Hero = () => {
  const images = [
    "https://images.unsplash.com/photo-1531014968147-c89ae1be1360?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=989",
    "https://images.unsplash.com/photo-1666881022440-49a30d5a1751?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=2070",
    "https://plus.unsplash.com/premium_photo-1661431100755-cb1b34cdeca4?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=1169",
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div
      className="hero"
      style={{
        backgroundImage: `url(${images[currentIndex]})`,
      }}
    >
      {/* === Top Bar === */}
     <header className="topbar">
  <div className="container topbar-inner">
    <div className="util-left">
      <p>We’re your trusted study abroad partner in Bangladesh</p>
    </div>

    <div className="contacts">
      <a href="mailto:studyabroad@fineanswer.com">studyabroad@fineanswer.com</a>
      <span>•</span>
      <a href="tel:+8801703081152">+8801703081152</a>
      <span>•</span>

      {/* Social Media Links */}
      <a href="https://www.facebook.com/FineanswerStudyAbroad" target="_blank" rel="noopener noreferrer">
        <FontAwesomeIcon icon={faFacebookF} />
      </a>
      <a href="https://www.instagram.com/fineanswerstudyabroad/" target="_blank" rel="noopener noreferrer">
        <FontAwesomeIcon icon={faInstagram} />
      </a>
      <a href="https://www.linkedin.com/company/fineanswerstudyabroad/" target="_blank" rel="noopener noreferrer">
        <FontAwesomeIcon icon={faLinkedinIn} />
      </a>
      <a href="https://www.youtube.com/@FineAnswerStudyAbroad" target="_blank" rel="noopener noreferrer">
        <FontAwesomeIcon icon={faYoutube} />
      </a>
    </div>
  </div>
</header>


      {/* === Main Bar === */}
      <div className="mainbar">
        <div className="container mainbar-inner">
          <div className="brand">
            <div className="logo-roll-container">
  <div className="roll-bg"></div>
  <img src="./assets/fineanswer2.jpg.png" alt="FineAnswer Logo" className="logo-img" />
</div>

            
          </div>
          <nav className="primary-nav">
            <Link className="active" to="/">Home</Link>
            <Link to="/about">About</Link>
            <Link to="/services">Services</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/login">Login</Link> {/* Redirects to LoginPage */}
          </nav>
        </div>
      </div>

      {/* === Hero Section === */}
      <section className="hero-area">
        <div className="overlay" />
        <div className="container hero-content">
          <div className="hero-grid">
            <div className="copy area-copy">
              <p className="eyebrow">YOUR FUTURE BEGINS HERE</p>
              <h1 className="title serif">Dream, Apply &amp; Fly</h1>
              <p className="mission">Your Gateway to Studying Abroad</p>
            </div>

            <div className="card card-event area-event1">
              <div className="card-eyebrow">Events</div>
              <div className="date">18 DEC 2025</div>
              <div className="card-title">
                Application Bootcamp – Winter 2025
              </div>
              <div className="meta">Time: 10:00 AM</div>
              <button className="btn-outline">Details</button>
            </div>

            <div className="card card-event area-event2">
              <div className="card-eyebrow">Events</div>
              <div className="date">30 NOV 2025</div>
              <div className="card-title">Career Planning Workshop</div>
              <div className="meta">Time: 10:00 AM</div>
              <button className="btn-outline">Details</button>
            </div>

            <div className="card card-tweet area-tweet1">
              <div className="tweet-body">
                “To empower students to achieve their dreams of studying abroad by providing expert guidance, personalized support, and access to global opportunities.
We aim to make the journey from application to acceptance smooth, confident, and successful.”
              </div>
              <div className="tweet-meta">@FineAnswer • Aug 10, 2020</div>
            </div>

            <div className="card card-tweet area-tweet2">
              <div className="tweet-body">
                “We strive to guide every student toward their ideal international education experience.
By combining expert advice, practical resources, and personalized support, we make studying abroad achievable and exciting.”
              </div>
              <div className="tweet-meta">@FineAnswer • Aug 11, 2022</div>
            </div>

            <div className="card card-cta area-cta">
              <h3 className="serif">
                Get personalized guidance from our expert counselors. Plan your path to top universities and scholarships with confidence.
              </h3>
              <button className="btn-cta">Book a Free Consultation</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Hero;
