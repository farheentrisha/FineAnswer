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
          “We were looking for a platform that was essentially a CRM for
          influencer management that also allowed us to aggregate our campaign
          analytics and access the insights we need to properly evaluate
          influencers.”
        </p>

        <div className="quote-icon-right">”</div>

        {/* Name + designation */}
        <h3 className="ceo-name">Arif Bhuiyan</h3>
        <p className="ceo-desg">CEO & Managing Director</p>
      </div>
    </section>
  );
}
