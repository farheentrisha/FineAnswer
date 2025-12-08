import "./contact.css";

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
            <p>📍 House 34, Road 10, Dhaka, Bangladesh</p>
            <p>📞 +880 1521-650-398</p>
            <p>📧 hello@studyabroad.com</p>
          </div>

          <div className="social-icons">
            <span>F</span>
            <span>T</span>
            <span>I</span>
            <span>L</span>
          </div>
        </div>

        {/* RIGHT FORM CARD */}
        <div className="contact-card">
          <h3 className="form-title">Write Us a Message</h3>

          <form className="contact-form">
            <div className="form-group">
              <label>Name</label>
              <input type="text" placeholder="Your Name" />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input type="email" placeholder="Your Email" />
            </div>

            <div className="form-group">
              <label>Message</label>
              <textarea rows="4" placeholder="Your Question"></textarea>
            </div>

            <button className="send-btn">Send Message</button>
          </form>
        </div>

      </div>
    </section>
  );
}
