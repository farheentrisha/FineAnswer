import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import SuccessStories from "./components/SuccessStories";
import ContactSection from "./components/ContactSection";
import Services from "./components/Services";
import CountrySlider from "./components/CountrySlider";
import Navbar3 from "./components/navbar3";
import CEOQuote from "./components/CEOQuote";
import useFadeIn from "./hooks/useFadeIn";

import "./LandingPage.css";
import uni1 from "./images/uni1.jpg";
import uni2 from "./images/uni2.jpg";
import uni3 from "./images/uni3.jpg";
import {
  FaGlobe,
  FaLaptopCode,
  FaChalkboardTeacher,
  FaUserGraduate,
} from "react-icons/fa";

export default function LandingPage() {
  const [aboutRef, aboutVisible] = useFadeIn();
  const [servicesRef, servicesVisible] = useFadeIn();
  const [storiesRef, storiesVisible] = useFadeIn();
  const [countryRef, countryVisible] = useFadeIn();
  const [ceoRef, ceoVisible] = useFadeIn();
  const [contactRef, contactVisible] = useFadeIn();
  const navigate = useNavigate();
  const images = [uni1, uni2, uni3];
  const [currentImage, setCurrentImage] = useState(0);

  // Stats animation states
  const statsRef = useRef(null);
  const [statsVisible, setStatsVisible] = useState(false);
  const [students, setStudents] = useState(0);
  const [countries, setCountries] = useState(0);
  const [partners, setPartners] = useState(0);
  const [satisfaction, setSatisfaction] = useState(0);

  // Popup state
  const [showPopup, setShowPopup] = useState(false);

  // Image slider
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Count-up animation
  useEffect(() => {
    if (!statsVisible) return;

    const duration = 2000;
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

  // Detect stats section visibility
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setStatsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  // Input focus effect
  useEffect(() => {
    const inputs = document.querySelectorAll(".search-bar input, .search-bar select");
    inputs.forEach((el) => {
      el.addEventListener("focus", () => (el.style.boxShadow = "0 0 10px rgba(0,119,255,0.5)"));
      el.addEventListener("blur", () => (el.style.boxShadow = "none"));
    });
  }, []);

  // Show popup after 10 seconds (every visit)
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPopup(true);
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
  const handleScroll = () => {
    const header = document.querySelector("header");
    if (header) {
      if (window.scrollY > 20) header.classList.add("scrolled");
      else header.classList.remove("scrolled");
    }
  };

  window.addEventListener("scroll", handleScroll);
  return () => window.removeEventListener("scroll", handleScroll);
}, []);


  return (
    <div className="LandingPage">
      
  <Navbar3 />


{/* HERO SECTION */}
<section className="hero-section-new" >

  <div className="hero-background">
  {images.map((img, index) => (
    <div
      key={index}
      className={`hero-bg-slide ${index === currentImage ? "active" : ""}`}
      style={{ backgroundImage: `url(${img})` }}
    ></div>
  ))}
</div>


  {/* Dark + Purple Gradient Overlay */}
  <div className="hero-overlay"></div>

  {/* Main Content */}
  <div className="hero-content-wrapper">

    <h1 className="hero-title">
      Discover Your <span>Next Adventure</span>
    </h1>

    <p className="hero-subtitle">
      Find your dream university with FineAnswer. From choosing a country  
      to landing on campus — we guide you every step of the way.
    </p>

    {/* Search Bar Glass Box */}
    <div className="hero-search-wrapper-new">
      <div className="hero-search-box-new">

        <div className="search-item-new">
          <span className="search-label">Program</span>
          <span className="search-value">Search Program</span>
        </div>

        <div className="divider"></div>

        <div className="search-item-new">
          <span className="search-label">Country</span>
          <span className="search-value">Choose Country</span>
        </div>

        <div className="divider"></div>

        <div className="search-item-new">
          <span className="search-label">Intake</span>
          <span className="search-value">Select Intake</span>
        </div>

        <button className="search-btn-new">Search</button>

      </div>
    </div>
    {/* CTA BUTTONS */}
<div className="hero-cta-buttons">
  <button className="cta-apply" onClick={() => navigate("/apply")}>
    Apply Now
  </button>

  <button className="cta-consult" onClick={() => navigate("/consultation")}>
    Book Consultation
  </button>
</div>



  </div>
</section>

{/* ABOUT + STATS SECTION (Like Example Image) */}
<section className="about-stats-section" ref={statsRef}>


  <div className="about-left">
    <h2>ABOUT US</h2>
    <p>
      We help students discover global academic opportunities with seamless 
      guidance, expert mentoring, and complete end-to-end support.
      From choosing a country to landing on campus — we’re with you every step.
    </p>

    <div className="about-buttons">
      <button className="btn-primary">Learn More</button>
      <button className="btn-outline">Watch Video ▶</button>
    </div>
  </div>

  <div className="about-right">
    <div className="stat-box">
      <h3>{students}+</h3>
      <p>Happy Students</p>
    </div>

    <div className="stat-box">
      <h3>{countries}+</h3>
      <p>Countries Served</p>
    </div>

    <div className="stat-box">
      <h3>{partners}+</h3>
      <p>Partner Institutions</p>
    </div>

    <div className="stat-box">
      <h3>{satisfaction}%</h3>
      <p>Student Satisfaction</p>
    </div>
  </div>

</section>



<div ref={servicesRef} className={`fade-section ${servicesVisible ? "show" : ""}`}>
  <Services />
</div>

<div ref={storiesRef} className={`fade-section ${storiesVisible ? "show" : ""}`}>
  <SuccessStories />
</div>

<div ref={countryRef} className={`fade-section ${countryVisible ? "show" : ""}`}>
  <CountrySlider />
</div>

<div ref={ceoRef} className={`fade-section ${ceoVisible ? "show" : ""}`}>
  <CEOQuote />
</div>

<div ref={contactRef} className={`fade-section ${contactVisible ? "show" : ""}`}>
  <ContactSection />
</div>








      {/* FOOTER */}
      <footer>
        <p>© 2025 FineAnswer Study Abroad Consultancy. All rights reserved.</p>
      </footer>

 {showPopup && (
  <div className="popup-overlay">
    <div className="modern-popup">
      <button className="popup-close" onClick={() => setShowPopup(false)}>×</button>
      <h2>Unlock More Opportunities!</h2>
      <p>
        Login or Register now to access personalized guidance, scholarships,
        and priority support from our expert team.
      </p>
      <div className="modern-popup-buttons">
        <button onClick={() => navigate("/login")} className="modern-btn">
          Login
        </button>
        <button onClick={() => navigate("/register")} className="modern-btn modern-btn-alt">
          Register
        </button>
      </div>
    </div>
  </div>
)}


    </div>
  );


}
