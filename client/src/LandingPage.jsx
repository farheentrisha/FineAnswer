import React from 'react';
import './LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-page">
      {/* Hero Section */}
      <header className="hero">
        <nav className="navbar">
          <div className="logo">FineAnswer</div>
          <div className="nav-links">
            <a href="#features">Features</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#pricing">Pricing</a>
            <a href="/login" className="login-btn">Log In</a>
            <a href="/register" className="signup-btn">Sign Up</a>
          </div>
        </nav>
        
        <div className="hero-content">
          <h1>AI-Powered Q&A Platform</h1>
          <p>Get accurate, instant answers to all your questions with our advanced AI technology.</p>
          <div className="cta-buttons">
            <a href="/register" className="primary-btn">Get Started for Free</a>
            <a href="#demo" className="secondary-btn">Watch Demo</a>
          </div>
          <div className="trusted-by">
            <span>Trusted by 10,000+ users worldwide</span>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section id="features" className="features">
        <div className="section-header">
          <h2>Why Choose FineAnswer?</h2>
          <p>Experience the power of AI in answering your questions accurately and efficiently.</p>
        </div>
        
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              🚀
            </div>
            <h3>Lightning Fast</h3>
            <p>Get instant answers to your questions without any delays.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              🔒
            </div>
            <h3>Secure & Private</h3>
            <p>Your data is encrypted and protected with enterprise-grade security.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              📊
            </div>
            <h3>Smart Analytics</h3>
            <p>Track your question history and improve your knowledge base.</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="how-it-works">
        <div className="section-header">
          <h2>How It Works</h2>
          <p>Get started in just a few simple steps</p>
        </div>
        
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Create an Account</h3>
            <p>Sign up for free and verify your email address.</p>
          </div>
          
          <div className="step">
            <div className="step-number">2</div>
            <h3>Ask Your Question</h3>
            <p>Type your question in simple, natural language.</p>
          </div>
          
          <div className="step">
            <div className="step-number">3</div>
            <h3>Get Instant Answers</h3>
            <p>Receive accurate, well-researched answers immediately.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <h2>Ready to Get Started?</h2>
        <p>Join thousands of users who trust FineAnswer for accurate information.</p>
        <a href="/register" className="primary-btn">Start Your Free Trial</a>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-logo">FineAnswer</div>
          <div className="footer-links">
            <div className="footer-column">
              <h4>Product</h4>
              <a href="#features">Features</a>
              <a href="#pricing">Pricing</a>
              <a href="#demo">Demo</a>
            </div>
            <div className="footer-column">
              <h4>Company</h4>
              <a href="#about">About Us</a>
              <a href="#careers">Careers</a>
              <a href="#blog">Blog</a>
            </div>
            <div className="footer-column">
              <h4>Support</h4>
              <a href="#help">Help Center</a>
              <a href="#contact">Contact Us</a>
              <a href="#privacy">Privacy Policy</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} FineAnswer. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
