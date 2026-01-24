import React, { useState } from "react";
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
    setMessage(null);

    try {
      const response = await fetch("http://localhost:5000/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        // Check if user already exists
        if (response.status === 409 || response.status === 400) {
          const errorMessage = result.message || result.error || "User already exists";
          
          // Check if error message indicates duplicate user
          if (
            errorMessage.toLowerCase().includes("already exists") ||
            errorMessage.toLowerCase().includes("user exists") ||
            errorMessage.toLowerCase().includes("email already") ||
            errorMessage.toLowerCase().includes("duplicate")
          ) {
            setMessage({
              type: "error",
              text: "❌ This email is already registered. Please log in instead.",
            });
            return;
          }
        }
        
        throw new Error(result.message || result.error || "Registration failed");
      }

      // Registration successful
      console.log("User registered:", result);

      // If backend returns token and data (like login), store them
      if (result.token && result.data) {
        localStorage.setItem("token", result.token);
        localStorage.setItem("user", JSON.stringify(result.data));
      } else if (result.data) {
        // If only data is returned, store it
        localStorage.setItem("user", JSON.stringify(result.data));
      }

      setMessage({ 
        type: "success", 
        text: "✅ Registration successful! Redirecting to dashboard..." 
      });

      // Reset form
      setFormData({ name: "", email: "", phone: "", password: "" });

      // Redirect to dashboard after 1.5 seconds
      setTimeout(() => navigate("/dashboard"), 1500);

    } catch (error) {
      console.error("Registration error:", error);
      setMessage({
        type: "error",
        text: error.message || "Registration failed. Please try again.",
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
