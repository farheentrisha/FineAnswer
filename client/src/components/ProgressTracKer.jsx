import { useState } from "react";
import { visaTimeline } from "./visaSteps";
import "./ProgressTracker.css";

export default function VisaTimeline() {
  const [open, setOpen] = useState(null);

  return (
    <div className="visa-wrapper">
      <h3 className="visa-header">Visa Process</h3>

      <div className="timeline">
        {visaTimeline.map((step, index) => (
          <div key={step.id} className={`timeline-item ${step.side}`}>
            
            {/* Card */}
            <div className={`content ${step.final ? "final" : ""}`}>
              <span className="date">{step.date}</span>
              <h4>{step.title}</h4>

              {/* Dropdown */}
              {step.type === "dropdown" && (
                <div className="dropdown">
                  <button onClick={() => setOpen(open === index ? null : index)}>
                    View University Offers ▾
                  </button>

                  {open === index && (
                    <div className="dropdown-menu">
                      {step.options.map((opt, i) => (
                        <div key={i} className="dropdown-item">
                          <strong>{opt.university}</strong>
                          <p>{opt.status}</p>
                          <span>{opt.date}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Dot */}
            <span className={`dot ${step.final ? "success" : ""}`} />
          </div>
        ))}
      </div>
    </div>
  );
}
