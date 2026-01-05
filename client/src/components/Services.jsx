import React from "react";
import "./Services.css";
import {
  FaGlobe,
  FaUniversity,
  FaFileAlt,
  FaPassport,
  FaPlaneDeparture,
} from "react-icons/fa";

const Services = () => {
  const cards = [
    {
      icon: <FaGlobe />,
      title: "Study Abroad Counseling",
      text: "Personalized guidance to help students choose the right country, university, and course based on their academic background and career goals.",
      color: "#6C63FF",
    },
    {
      icon: <FaUniversity />,
      title: "University & Course Selection",
      text: "Expert support in shortlisting globally recognized universities and programs across the UK, Ireland, Australia, and other destinations.",
      color: "#4CC9F0",
    },
    {
      icon: <FaFileAlt />,
      title: "Application & Documentation",
      text: "End-to-end assistance with applications, SOPs, LORs, transcripts, and all required academic documentation.",
      color: "#FF6B6B",
    },
    {
      icon: <FaPassport />,
      title: "Visa Guidance & Interview Prep",
      text: "Accurate visa processing support with mock interviews and document verification to maximize approval success.",
      color: "#FFD93D",
    },
    {
      icon: <FaPlaneDeparture />,
      title: "Pre-Departure & Settlement Support",
      text: "Complete pre-departure briefing including accommodation, travel, banking, and post-arrival assistance.",
      color: "#90BE6D",
    },
  ];

  return (
    <section className="services-section">
      <div className="services-left">
        <h2>Our services</h2>
        <p>
          Find another value to dependent in the workplace with our team of experts.
          Exceptional skills & performance.
        </p>
        <button>Send your enquiry</button>
      </div>

      <div className="services-grid">
        {cards.map((card, index) => (
          <div className="service-card" key={index}>
            <div
              className="icon"
              style={{
                backgroundColor: card.color + "20",
                color: card.color,
              }}
            >
              {card.icon}
            </div>
            <h4>{card.title}</h4>
            <p>{card.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Services;
