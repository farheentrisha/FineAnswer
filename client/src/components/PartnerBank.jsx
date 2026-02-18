import React from "react";
import "./PartnerBank.css";

// Import your logos
import cityBank from "../assets/city-bank-logo.webp";
import nrbcBank from "../assets/nrbc.webp";
import premierBank from "../assets/pp.webp";
import kcOverseas from "../assets/kc.png";
import crizac from "../assets/crizac.png";
import tcl from "../assets/tcl.png";
import bylc from "../assets/bylc.png";
import studyGlobal from "../assets/studyp.png";

const PartnerBank = () => {
  const partners = [
    { name: "City Bank", logo: cityBank },
    { name: "NRBC Bank", logo: nrbcBank },
    { name: "KC Overseas", logo: kcOverseas },
    { name: "Crizac", logo: crizac },
    { name: "TCL", logo: tcl },
    { name: "Premier Bank", logo: premierBank },
    { name: "BYLC", logo: bylc },
    { name: "Study Global", logo: studyGlobal },
  ];

  return (
    <section className="partner-bank-section">
      <div className="partner-bank-container">
        {/* Left Side: Content */}
        <div className="partner-content">
          <h4 className="partner-badge">STRATEGIC ALLIANCE</h4>
          <h2 className="partner-title">
            Our Strategic <span>Partners</span>
          </h2>
          <p className="partner-description">
            We collaborate with world-class financial institutions and global 
            educational aggregators to provide our students with a seamless, 
            end-to-end study abroad experience.
          </p>
          <div className="partner-stats">
            <div className="p-stat"><strong>10+</strong> Global Partners</div>
            <div className="p-stat"><strong>100%</strong> Verified Support</div>
          </div>
        </div>

        {/* Right Side: Organized Grid of Bubbles */}
        <div className="partner-visual">
          <div className="bubbles-grid">
            {partners.map((item, index) => (
              <div key={index} className="bank-bubble-wrapper">
                <div className="bank-bubble">
                  <img src={item.logo} alt={item.name} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PartnerBank;