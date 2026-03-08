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
          FineAnswer is a one-stop global education service provider, dedicated to delivering the most accurate, meaningful, and trustworthy information to students worldwide. Since our inception, we have established ourselves as the number 1 study abroad consultancy for Ireland from Bangladesh, and have successfully expanded our services to other countries as well.
Backed by an experienced and passionate team, we offer comprehensive support beyond just admission and visa processing. From the initial consultation to post-arrival assistance, we are committed to guiding students through every step of their international education journey.
We are proud to hold the highest visa success rate from Bangladesh, and many of our students have gone on to secure professional employment and launch successful international careers in Ireland and beyond. If you are interested in studying abroad, please speak to our team and you will feel the difference in sha Allah.
        </p>

        <div className="quote-icon-right">”</div>

        {/* Name + designation */}
        <h3 className="ceo-name">Arif Bhuiyan (FCA, ACA, MBA, MSc)</h3>
        <p className="ceo-desg">Finance Manager - US Big Tech Multinational ; Ex- Apple, Meta, Bank of Ireland, Citi, Deloitte; Former Part-Time Faculty—Trinity College Dublin.
Founder & CEO, FineAnswer</p>
      </div>
    </section>
  );
}
