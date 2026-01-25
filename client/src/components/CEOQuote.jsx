import React from "react";
import "./CEOQuote.css";
import ceoImage from "../images/arif.jpg";

export default function CEOQuote() {
  return (
    <section className="ceo-quote-wrapper">
      <div className="ceo-card">
        
        {/* Profile image */}
        <div className="ceo-image-box">
          <img src={ceoImage} alt="Arif Bhuiyan" />
        </div>

        {/* Quote text */}
        <div className="quote-icon-left">“</div>

        <p className="ceo-quote-text">
          Don't just dream of studying abroad—make it happen. With our guidance, expert advice, and personalized strategies, we open doors to universities and opportunities around the world.
        </p>

        <div className="quote-icon-right">”</div>

        {/* Name + designation */}
        <h3 className="ceo-name">Arif Bhuiyan</h3>
        <p className="ceo-desg">CEO & Managing Director</p>
      </div>
    </section>
  );
}
