import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
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

  return (
    <div className="LandingPage">
      


{/* HERO SECTION */}
<section className="hero-section-new">

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
<section className="about-stats-section">

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





      {/* STATISTICS SECTION */}
      <section className="statistics" ref={statsRef}>
        
        <div className="stat-card">
          <div className="stat-icon"><FaGlobe /></div>
          <h2>{countries}+</h2>
          <p>Years of Language Education Experience</p>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><FaLaptopCode /></div>
          <h2>{partners}+</h2>
          <p>Innovative Foreign Online Courses</p>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><FaChalkboardTeacher /></div>
          <h2>{students}+</h2>
          <p>Qualified Teachers and Language Experts</p>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><FaUserGraduate /></div>
          <h2>{satisfaction}+</h2>
          <p>Learners Enrolled in Edexcel Courses</p>
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

      {/* SPECIALIZATION SECTION */}
      <section className="specialization">
        <h2>Our Specializations</h2>
        <p>We provide expert guidance and end-to-end support for top study destinations.</p>

        <div className="specialization-grid">
          <div className="specialization-card ireland">
            <div className="overlay"></div>
            <h3>Ireland</h3>
            <p>Experience world-class education and career opportunities in Europe’s tech hub.</p>
            <button onClick={() => navigate("/countries/ireland")}>Explore</button>
          </div>
          <div className="specialization-card uk">
            <div className="overlay"></div>
            <h3>United Kingdom</h3>
            <p>Study in globally reputed institutions with centuries of academic excellence.</p>
            <button onClick={() => navigate("/uk")}>Explore</button>
          </div>
          <div className="specialization-card australia">
            <div className="overlay"></div>
            <h3>Australia</h3>
            <p>Enjoy diverse culture and top-tier universities with post-study work benefits.</p>
            <button onClick={() => navigate("/australia")}>Explore</button>
          </div>
        </div>
      </section>

      {/* MAP SECTION */}
<section className="map-section">
  <h2>Our Location</h2>
  <div className="map-container">
    <iframe
      title="FineAnswer Office Location"
      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3651.943502239492!2d90.40158827461542!3d23.750912778686275!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755c7b34277af61%3A0x3263d373deea33c4!2sCo-Desk!5e0!3m2!1sen!2sbd!4v1731336400000!5m2!1sen!2sbd"
      width="100%"
      height="400"
      style={{ border: 0 }}
      allowFullScreen=""
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
    ></iframe>
  </div>
</section>
{/* LOGIN & CONTACT SECTION */}
<section className="login-contact-section">
  <div className="login-contact-container">
    {/* Left Side – Login Form */}
    <div className="login-box">
      <h3>Login to your account</h3>
      <form>
        <div className="form-group">
          <label>Email</label>
          <input type="email" placeholder="Enter your email" required />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input type="password" placeholder="Enter your password" required />
        </div>
        <div className="form-options">
          <label>
            <input type="checkbox" /> Remember me
          </label>
          <a href="#">Forgot Password?</a>
        </div>
        <button type="submit" className="btn-primary">Login</button>
      </form>
    </div>

    {/* Right Side – Contact Info */}
    <div className="contact-box">
      <h3>Don't hesitate to contact us</h3>
      <p>
        Reach out anytime for admission guidance, support, or partnership inquiries.  
        We’re here to help you achieve your academic goals.
      </p>

      <div className="contact-info">
        <div className="contact-item">
          <span>📍</span>
          <div>
            <h4>Office</h4>
            <p>Co-Desk (Beside Aarong Banani), Road 11, Banani, Dhaka 1213</p>
          </div>
        </div>

        <div className="contact-item">
          <span>📞</span>
          <div>
            <h4>Phone</h4>
            <p>+880 1711 444 909</p>
          </div>
        </div>

        <div className="contact-item">
          <span>✉️</span>
          <div>
            <h4>Email</h4>
            <p>info@fineanswer.com</p>
          </div>
        </div>

        <div className="contact-item">
          <span>🕒</span>
          <div>
            <h4>Work Hours</h4>
            <p>Sun - Thu: 10 AM – 6 PM</p>
          </div>
        </div>
      </div>

      <div className="social-links">
        <p>Follow us:</p>
        <div>
          <a href="#"><i className="fab fa-facebook"></i></a>
          <a href="#"><i className="fab fa-linkedin"></i></a>
          <a href="#"><i className="fab fa-instagram"></i></a>
        </div>
      </div>
    </div>
  </div>
</section>


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

  window.addEventListener("scroll", () => {
  const header = document.querySelector("header");
  if (window.scrollY > 20) {
    header.classList.add("scrolled");
  } else {
    header.classList.remove("scrolled");
  }
});

}
