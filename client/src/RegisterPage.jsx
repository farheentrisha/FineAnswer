import React from "react";
import "./RegisterPage.css";

export default function RegisterPage() {
  return (
    <div className="register-container">
      <div className="register-box">
        {/* Left Section (Form) */}
        <div className="register-left">
          <div className="register-form">
            <h2>Create an Account</h2>
            <p className="subtext">Let’s get started with your 30-day free trial.</p>
            
            <form>
              <div className="input-group">
                <input type="text" placeholder="Full Name" required />
              </div>
              <div className="input-group">
                <input type="email" placeholder="Email" required />
              </div>
              <div className="input-group">
                <input type="password" placeholder="Password" required />
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
                Already have an account? <a href="#">Log in</a>
              </p>
            </form>
          </div>
        </div>

        {/* Right Section (Image + Quote) */}
        <div className="register-right">
          <div className="testimonial">
            <div className="testimonial-bg"></div>
            <div className="testimonial-content">
              <p>
                “We use FineAnswer to kickstart every new project and it saves
                us weeks of work. Can’t recommend it enough!”
              </p>
              <h4>Amélie Laurent</h4>
              <span>Founder, Skyplus</span>
              <div className="stars">★★★★★</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
