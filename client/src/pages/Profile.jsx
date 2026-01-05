import { FaUser, FaGraduationCap, FaSave, FaCamera } from "react-icons/fa";
import "./Profile.css";

export default function Profile() {
  return (
    <div className="profile-page">
      {/* Header */}
      <div className="profile-header">
        <div className="profile-left">
          <div className="avatar">
            JC
            <span className="camera">
              <FaCamera />
            </span>
          </div>

          <div>
            <h3>Sarah Johnson</h3>
            <p>sarah.johnson@email.com</p>

            <div className="stats">
              <span>4 Applications</span>
              <span>1 Offer</span>
            </div>
          </div>
        </div>

        <button className="save-btn">
          <FaSave /> Save Changes
        </button>
      </div>

      {/* Content */}
      <div className="profile-grid">
        {/* Personal Info */}
        <div className="profile-card">
          <h4>
            <FaUser /> Personal Information
          </h4>

          <div className="form-grid">
            <div>
              <label>Full Name</label>
              <input value="Sarah Johnson" />
            </div>

            <div>
              <label>Date of Birth</label>
              <input type="date" value="1998-05-15" />
            </div>

            <div>
              <label>Email Address</label>
              <input value="sarah.johnson@email.com" />
            </div>

            <div>
              <label>Phone Number</label>
              <input value="+1 234 567 8900" />
            </div>

            <div>
              <label>Country</label>
              <input value="USA" />
            </div>

            <div>
              <label>City</label>
              <input value="New York" />
            </div>

            <div className="full">
              <label>Address</label>
              <input value="123 Main Street, Apartment 4B" />
            </div>

            <div>
              <label>Postal Code</label>
              <input value="10001" />
            </div>
          </div>
        </div>

        {/* Education + Language */}
        <div className="profile-card">
          <h4>
            <FaGraduationCap /> Educational Background
          </h4>

          <div className="form-grid">
            <div className="full">
              <label>Highest Education</label>
              <input value="Bachelor of Science in Computer Science" />
            </div>

            <div className="full">
              <label>University</label>
              <input value="University of California, Berkeley" />
            </div>

            <div>
              <label>Graduation Year</label>
              <input value="2020" />
            </div>

            <div>
              <label>GPA / CGPA</label>
              <input value="3.8" />
            </div>

            <div className="full">
              <label>Work Experience</label>
              <input value="Software Engineer at Tech Corp" />
            </div>

            <div>
              <label>Years of Experience</label>
              <input value="2 years" />
            </div>
          </div>

          {/* Language Test */}
          <div className="language-section">
            <h5>Language Proficiency Test</h5>

            <div className="form-grid">
              <div>
                <label>Test Type</label>
                <select>
                  <option>IELTS</option>
                  <option>TOEFL</option>
                  <option>Duolingo</option>
                </select>
              </div>

              <div>
                <label>Overall Score</label>
                <input placeholder="7.5" />
              </div>

              <div>
                <label>Reading</label>
                <input />
              </div>

              <div>
                <label>Writing</label>
                <input />
              </div>

              <div>
                <label>Listening</label>
                <input />
              </div>

              <div>
                <label>Speaking</label>
                <input />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
