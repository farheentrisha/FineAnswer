import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // for redirect
import "./LoginPage.css";

export default function LoginPage() {
  const navigate = useNavigate();

  // Slideshow images
  const images = [
    "https://images.unsplash.com/photo-1623632306901-e509641e7191?auto=format&fit=crop&w=2070&q=80",
    "https://images.unsplash.com/photo-1603573355706-3f15d98cf100?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1329",
    "https://images.unsplash.com/photo-1604808621558-b09365436e51?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=880",
  ];

  const [currentImage, setCurrentImage] = useState(0);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState(null);

  // Image slideshow
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  // Update form state
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Logging in:", formData);

    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", formData);
      console.log("Login successful:", res.data);

      setMessage({ type: "success", text: "✅ Login successful!" });

      // Save JWT token to localStorage
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data));

      // Redirect to dashboard or landing page after 1s
      setTimeout(() => navigate("/Dashboard"), 1000);
    } catch (error) {
      console.log("Login error:", error.response);
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Login failed",
      });
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        {/* Left Side */}
        <div
          className="login-left"
          style={{
            background: `url(${images[currentImage]}) center/cover no-repeat`,
          }}
        >
          <div className="overlay">
            <h1>Welcome to FineAnswer – Your Gateway to Studying Abroad!</h1>
            <p>
              Explore top universities, scholarships, and programs worldwide.
              Begin your journey with expert guidance and personalized support.
            </p>
          </div>
        </div>

        {/* Right Side */}
        <div className="login-right">
          <div className="login-card animate-slide-up">
            <h2>User Login</h2>
            <p className="login-subtext">Access your personalized study dashboard</p>
            <form onSubmit={handleSubmit} autoComplete="off">
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
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="options">
                <label>
                  <input type="checkbox" /> Remember me
                </label>
                <a href="#">Forgot password?</a>
              </div>
              <button type="submit" className="login-btn">
                LOGIN
              </button>

              {/* Message */}
              {message && (
                <p className={`message ${message.type === "success" ? "success-msg" : "error-msg"}`}>
                  {message.text}
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
