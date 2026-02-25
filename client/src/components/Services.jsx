import React from "react";
import "./Services.css";

import { FaFileAlt, FaGlobe, FaHandsHelping, FaPassport, FaPlaneDeparture, FaUniversity, FaHeartbeat } from "react-icons/fa";


const Services = () => {
  const handleSendEnquiry = () => {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const cards = [
  {
    icon: <FaGlobe />,
    title: "Study Abroad Counseling",
    text: "Personalized guidance to help students choose the right country, university, and course aligned with their academic profile and long-term career goals.",
    color: "#6C63FF",
  },
  {
    icon: <FaUniversity />,
    title: "University & Course Selection",
    text: "Expert support in shortlisting globally recognized universities and programs across Ireland, the UK, Australia, and other destinations.",
    color: "#4CC9F0",
  },
  {
    icon: <FaFileAlt />,
    title: "Application & Documentation",
    text: "Complete assistance with applications, SOPs, LORs, transcripts, and all academic documentation required by universities.",
    color: "#FF6B6B",
  },
  {
    icon: <FaPassport />,
    title: "Visa Processing & Interview Preparation",
    text: "Accurate visa processing support including document review, application submission guidance, and interview preparation to maximize approval success.",
    color: "#FFD93D",
  },
  {
    icon: <FaPlaneDeparture />,
    title: "Visa Logistics & Document Handling",
    text: "Secure logistics support for transferring visa documents from Bangladesh to India, where the Ireland Embassy processes applications.",
    color: "#FF9F1C",
  },
  {
    icon: <FaHandsHelping />,
    title: "International Mentorship & Student Guidance",
    text: "Access to internal experts and experienced student mentors for scholarship guidance, English proficiency preparation, and academic success strategies.",
    color: "#7209B7",
  },
  {
  icon: <FaHeartbeat />,
  title: "Medical Insurance Assistance",
  text: "Guidance in selecting and processing mandatory international medical insurance plans required for student visas and university enrollment.",
  color: "#2EC4B6",
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
        <button onClick={handleSendEnquiry}>Send your enquiry</button>
      </div>

      <div className="services-grid">
        {cards.map((card, index) => (
          <div
            className="service-card service-card-animate"
            key={index}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
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
