import "./contact.css";
import {
  FaFacebookF,
  FaLinkedinIn,
  FaInstagram,
  FaYoutube,
} from "react-icons/fa";

export default function ContactSection() {
  return (
    <section className="contact-wrapper">
      <div className="contact-container">
        {/* LEFT PANEL */}
        <div className="contact-left">
          <p className="contact-tag">Contact Us</p>

          <h2 className="contact-title">Get In Touch</h2>

          <p className="contact-desc">
            Reach us anytime for guidance on universities, visas, applications,
            scholarships, and more. Our advisors respond within 24 hours.
          </p>

          <div className="contact-info">
            <p>📍 House 76/A, Road 11, Banani, Dhaka 1213, Bangladesh</p>
            <p>📞 +880 1725-982743</p>
            <p>📧 studyabroad@fineanswer.net</p>
          </div>

          <div className="social-icons">
            <a
              href="https://www.facebook.com/FineanswerStudyAbroad"
              target="_blank"
            >
              <FaFacebookF />
            </a>
            <a
              href="https://www.linkedin.com/company/fineanswerstudyabroad/?originalSubdomain=bd"
              target="_blank"
            >
              <FaLinkedinIn />
            </a>
            <a
              href="https://www.instagram.com/fineanswer_study_abroad/"
              target="_blank"
            >
              <FaInstagram />
            </a>
            <a
              href="https://www.youtube.com/@FineAnswerStudyAbroad/videos"
              target="_blank"
            >
              <FaYoutube />
            </a>
          </div>
        </div>

        {/* RIGHT FORM CARD */}
        <div className="contact-card">
          <h3 className="form-title">Book a Free Consultation</h3>

          <form className="contact-form">
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" placeholder="Your Full Name" />
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input type="tel" placeholder="+880 1XXXXXXXXX" />
            </div>

            <div className="form-group">
              <label>Appointment Date</label>
              <input type="date" />
            </div>

            <div className="form-group">
              <label>Your Message</label>
              <textarea
                rows="4"
                placeholder="Write your questions or requirements"
              ></textarea>
            </div>

            <button className="send-btn">Book Appointment</button>
          </form>
        </div>
      </div>
    </section>
  );
}
