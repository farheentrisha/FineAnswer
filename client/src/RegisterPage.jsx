import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./RegisterPage.css";

export default function RegisterPage() {
  const navigate = useNavigate(); 

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const [message, setMessage] = useState(null);

  // Update form state on input change
  const handleChange = (e) => {
    
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Submit form data to backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting form data:", formData);

    try {
      const res = await axios.post("http://localhost:5000/api/users", formData);
      console.log("User registered:", res.data);

      setMessage({ type: "success", text: "✅ Registration successful! Redirecting to login..." });

      // ✅ Redirect to login after 1.5 seconds
      // setTimeout(() => navigate("/login"), 1500);  

      // Optional: reset form
      setFormData({ name: "", email: "", phone: "", password: "" });

    } catch (error) {
      console.log("Error response:", error.response);
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Registration failed",
      });
    }
  };

  return (
    <div className="register-container">
      <div className="register-box">
        {/* Left Section (Form) */}
        <div className="register-left">
          <div className="register-form">
            <h2>Create an Account</h2>
            <p className="subtext">Let’s get started with your 30-day free trial.</p>
            
            <form onSubmit={handleSubmit} autoComplete="off">
              <div className="input-group">
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="input-group">
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="input-group">
                <input
                  type="text"
                  name="phone"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="input-group">
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <button type="submit" className="register-btn">
                Create Account
              </button>

              <div className="divider">or</div>

              <button type="button" className="google-btn">
                <img
                  src="https://www.svgrepo.com/show/355037/google.svg"
                  alt="Google"
                />
                Sign up with Google
              </button>

              <p className="login-link">
                Already have an account? <a href="/login">Log in</a>
              </p>

              {/* Success / Error message */}
              {message && (
                <p className={`message ${message.type === "success" ? "success-msg" : "error-msg"}`}>
                  {message.text}
                </p>
              )}
            </form>
          </div>
        </div>

        {/* Right Section (Image + Quote) */}
        <div className="register-right">
          <div className="testimonial">
            <div className="testimonial-bg"></div>
            <div className="testimonial-content">
              <p>
                “Studying abroad can be overwhelming—but you don’t have to do it alone. We provide step-by-step guidance, from choosing the right country to securing admission, so your journey is stress-free and successful”
              </p>
              <h4>Arif Bhuiyan</h4>
              <span>Founder and CEO</span>
              <div className="stars">★★★★★</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
