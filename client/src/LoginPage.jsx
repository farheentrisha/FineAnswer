<<<<<<< HEAD
import React, { useState, useEffect } from "react";
import "./LoginPage.css";

export default function LoginPage() {
  const images = [
    "https://images.unsplash.com/photo-1623632306901-e509641e7191?auto=format&fit=crop&w=2070&q=80",
    "https://images.unsplash.com/photo-1603573355706-3f15d98cf100?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1329",
    "https://images.unsplash.com/photo-1604808621558-b09365436e51?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=880"
  ];

  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 200); // change image every 5 seconds
    return () => clearInterval(interval);
  }, []);


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
              Explore top universities, scholarships, and programs worldwide. Begin your journey with expert guidance and personalized support
            </p>
          </div>
=======
import React from "react";
import "./LoginPage.css"; // import the CSS file

export default function LoginPage() {
  return (
    <div className="login-container">
      <div className="login-box">
        {/* Left Side */}
        <div className="login-left">
          <h1>Welcome to Our Website</h1>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed diam
            nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat
            volutpat.
          </p>
>>>>>>> ea4a13f (Initial commit)
        </div>

        {/* Right Side */}
        <div className="login-right">
<<<<<<< HEAD
          <div className="login-card animate-slide-up">
            <h2>User Login</h2>
            <p className="login-subtext">Access your personalized study dashboard</p>
            <form>
              <div className="input-group">
                <input type="text" placeholder="Username" />
              </div>
              <div className="input-group">
                <input type="password" placeholder="Password" />
              </div>
              <div className="options">
                <label>
                  <input type="checkbox" /> Remember me
                </label>
                <a href="#">Forgot password?</a>
              </div>
              <button type="submit" className="login-btn">LOGIN</button>
            </form>
          </div>
=======
          <h2>User Login</h2>
          <form>
            <div className="input-group">
              <input type="text" placeholder="Username" />
            </div>
            <div className="input-group">
              <input type="password" placeholder="Password" />
            </div>
            <div className="options">
              <label>
                <input type="checkbox" /> Remember
              </label>
              <a href="#">Forgot password?</a>
            </div>
            <button type="submit" className="login-btn">LOGIN</button>
          </form>
>>>>>>> ea4a13f (Initial commit)
        </div>
      </div>
    </div>
  );
}
