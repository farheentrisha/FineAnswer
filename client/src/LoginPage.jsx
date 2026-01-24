import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // for redirect
import "./LoginPage.css";
import { AuthContext } from "./pages/Provider/ContextProvider";

export default function LoginPage() {
  const navigate = useNavigate();
  const { googleSignIn } = useContext(AuthContext);

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
      setTimeout(() => navigate("/dashboard"), 1000);
    } catch (error) {
      console.log("Login error:", error.response);
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Login failed",
      });
    }
  };

  // Handle Google Sign In
  const handleGoogleSignIn = async () => {
    try {
      setMessage(null);
      
      // Step 1: Authenticate with Google via Firebase
      const result = await googleSignIn();
      console.log("Google Firebase auth successful:", result.user);

      const userData = {
        email: result.user.email,
        name: result.user.displayName || result.user.email.split("@")[0],
        phone: null, // Google login doesn't provide phone, can be updated later
        password: null, // Google users don't use password
        authProvider: "google", // Flag to indicate this is a Google OAuth user
      };

      // Step 2: Create or verify user in backend database
      try {
        const backendRes = await axios.post("http://localhost:5000/api/users", userData);
        console.log("User created/verified in database:", backendRes.data);

        // Save user info and token to localStorage
        if (backendRes.data.token) {
          localStorage.setItem("token", backendRes.data.token);
        }
        localStorage.setItem("user", JSON.stringify({
          ...backendRes.data,
          photo: result.user.photoURL,
        }));

        setMessage({ type: "success", text: "✅ Google login successful!" });
        
        // Redirect to dashboard after 1s
        setTimeout(() => navigate("/dashboard"), 1000);
      } catch (backendError) {
        // If user already exists (409 Conflict or 400 Bad Request), that's okay
        // The user is already in the database, proceed with login
        if (backendError.response?.status === 409 || 
            backendError.response?.status === 400 ||
            backendError.response?.data?.message?.toLowerCase().includes("already exists") ||
            backendError.response?.data?.message?.toLowerCase().includes("user exists")) {
          
          console.log("User already exists in database, proceeding with login...");
          
          // Save Firebase user info and proceed
          localStorage.setItem("user", JSON.stringify({
            email: result.user.email,
            name: result.user.displayName || result.user.email.split("@")[0],
            photo: result.user.photoURL,
          }));

          setMessage({ type: "success", text: "✅ Google login successful!" });
          setTimeout(() => navigate("/dashboard"), 1000);
        } else {
          // For other errors, show the error but still allow Firebase login
          console.error("Backend error:", backendError.response?.data || backendError.message);
          
          // Still save Firebase user info so they can use the app
          localStorage.setItem("user", JSON.stringify({
            email: result.user.email,
            name: result.user.displayName || result.user.email.split("@")[0],
            photo: result.user.photoURL,
          }));

          setMessage({ 
            type: "success", 
            text: "✅ Google login successful! (Note: Some features may be limited)" 
          });
          setTimeout(() => navigate("/dashboard"), 1000);
        }
      }
    } catch (error) {
      console.error("Google login error:", error);
      
      // Handle specific Firebase errors
      let errorMessage = "Google login failed. Please try again.";
      if (error.code === "auth/popup-closed-by-user") {
        errorMessage = "Login popup was closed. Please try again.";
      } else if (error.code === "auth/popup-blocked") {
        errorMessage = "Popup was blocked. Please allow popups and try again.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setMessage({
        type: "error",
        text: errorMessage,
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

            <div className="divider">or</div>

            <button type="button" className="google-btn" onClick={handleGoogleSignIn}>
              <img
                src="https://www.svgrepo.com/show/355037/google.svg"
                alt="Google"
              />
              Sign in with Google
            </button>

             <p className="signup-text">
    Don’t have an account?{" "}
    <span
      className="signup-link"
      onClick={() => navigate("/register")}
      style={{ color: "#007bff", cursor: "pointer", textDecoration: "underline" }}
    >
      Join now
    </span>
  </p>
          </div>
        </div>
      </div>
    </div>
  );
}
