import React from "react";
import "./ServicesSection.css";
import { FaUniversity, FaFileAlt, FaBookOpen, FaPassport, FaMoneyBillWave } from "react-icons/fa";

export default function ServicesSection() {
  const services = [
    { icon: <FaUniversity />, title: "University & Program Guidance" },
    { icon: <FaFileAlt />, title: "Admission Assistance" },
    { icon: <FaBookOpen />, title: "Test Preparation Support" },
    { icon: <FaPassport />, title: "Visa & Immigration Support" },
    { icon: <FaMoneyBillWave />, title: "Scholarship & Financial Aid Guidance" },
  ];

  return (
    <section className="services">
      {services.map((s, i) => (
        <div
          key={i}
          className={`service-card ${i === 3 ? "active" : ""}`}
        >
          <div className="icon">{s.icon}</div>
          <h3>{s.title}</h3>
        </div>
      ))}
    </section>
  );
}
