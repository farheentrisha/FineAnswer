import React, { useEffect, useRef } from "react";
import "./RoadmapSection.css";

export default function RoadmapSection() {
  const stepsRef = useRef([]);

  useEffect(() => {
    const els = stepsRef.current.filter(Boolean);

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
          }
        });
      },
      { threshold: 0.2 }
    );

    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const steps = [
    {
      id: 1,
      title: "Step 1: Consultation",
      desc: "We understand your goals, background, preferences, and career direction.",
      icon: "🗂️",
    },
    {
      id: 2,
      title: "Step 2: Course & University Selection",
      desc: "Shortlisting institutions that match your academic and financial requirements.",
      icon: "🎓",
    },
    {
      id: 3,
      title: "Step 3: Application Submission",
      desc: "We prepare your documents, edit SOP, and manage your application workflow.",
      icon: "📝",
    },
    {
      id: 4,
      title: "Step 4: Offer Letter & Acceptance",
      desc: "We guide you after receiving offer letters and help you finalize decisions.",
      icon: "📨",
    },
    {
      id: 5,
      title: "Step 5: Visa Guidance",
      desc: "Step-by-step visa application help, financial documents & interview prep.",
      icon: "✈️",
    },
    {
      id: 6,
      title: "Step 6: Pre-Departure Support",
      desc: "Accommodation help, lifestyle guidance, travel prep & airport assistance.",
      icon: "🧳",
    },
  ];

  return (
    <section className="roadmap-section">
      <h2 className="roadmap-title">Your Journey With Us</h2>
      <p className="roadmap-subtitle">
        A complete step-by-step guidance for your overseas education.
      </p>

      <div className="timeline">
        {steps.map((s, idx) => (
          <div
            key={s.id}
            className="timeline-step"
            ref={(el) => (stepsRef.current[idx] = el)}
          >
            <div className="step-icon">{s.icon}</div>
            <div className="step-content">
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
