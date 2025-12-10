import React from "react";
import "./Services.css";
import {
  FaUsers,
  FaChartBar,
  FaUserTie,
  FaBullhorn,
  FaCertificate,
} from "react-icons/fa";

const Services = () => {
  const cards = [
    {
      icon: <FaUsers />,
      title: "Strategy & Innovation",
      text: "Find another value to dependent in the workplace with our HR talent facility programs.",
      color: "#6C63FF",
    },
    {
      icon: <FaChartBar />,
      title: "Advanced Analytics",
      text: "Get real-time data & actionable insights to strengthen business outcomes.",
      color: "#4CC9F0",
    },
    {
      icon: <FaUserTie />,
      title: "HR & Talent",
      text: "We help you improve recruitment strategies & develop top-tier professionals.",
      color: "#FF6B6B",
    },
    {
      icon: <FaBullhorn />,
      title: "Sales & Marketing",
      text: "Find smart ways to expand customer reach with business-first strategies.",
      color: "#FFD93D",
    },
    {
      icon: <FaCertificate />,
      title: "Training & Certification",
      text: "Upskill your employees with real industry-relevant training modules.",
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
