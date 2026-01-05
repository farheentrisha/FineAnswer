import { FaEnvelope, FaPaperPlane } from "react-icons/fa";
import "./Messages.css";

export default function Messages() {
  return (
    <div className="messages-page">
      <div className="messages-card">
        <h3 className="messages-title">
          <FaEnvelope /> Send a Message
        </h3>

        <div className="form-grid">
          <div>
            <label>Name</label>
            <input placeholder="Your full name" />
          </div>

          <div>
            <label>Phone Number</label>
            <input placeholder="+880 1XXXXXXXXX" />
          </div>

          <div>
            <label>Last Education</label>
            <input placeholder="Bachelor / HSC / Diploma" />
          </div>

          <div>
            <label>Preferred Country</label>
            <select>
              <option>Select country</option>
              <option>Australia</option>
              <option>UK</option>
              <option>Canada</option>
              <option>USA</option>
              <option>Ireland</option>
            </select>
          </div>

          <div className="full">
            <label>Appointment Date</label>
            <input type="date" />
          </div>

          <div className="full">
            <label>Your Message</label>
            <textarea
              rows="4"
              placeholder="Write your message here..."
            />
          </div>
        </div>

        <button className="send-btn">
          <FaPaperPlane /> Send Message
        </button>
      </div>
    </div>
  );
}
