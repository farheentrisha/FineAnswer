import { useState, useEffect } from "react";
import "./ProgressTracker.css";
import { getMyProgressTracker } from "../services/progressTrackerApi";

export default function ProgressTracker() {
  const [open, setOpen] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTracker = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setLoading(false);
          return;
        }

        const data = await getMyProgressTracker(token);
        setTimeline(data.timeline || data.progressTracker || []);
      } catch (error) {
        console.error("Error fetching progress tracker:", error);
        setTimeline([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTracker();
  }, []);

  if (loading) {
    return (
      <div className="visa-wrapper">
        <h3 className="visa-header">Study Abroad Progress tracker</h3>
        <div style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}>
          Loading progress tracker...
        </div>
      </div>
    );
  }

  if (timeline.length === 0) {
    return (
      <div className="visa-wrapper">
        <h3 className="visa-header">Study Abroad Progress tracker</h3>
        <div style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}>
          No progress updates yet. Your tracker will appear here once updated by admin.
        </div>
      </div>
    );
  }

  return (
    <div className="visa-wrapper">
      <h3 className="visa-header">Study Abroad Progress tracker</h3>

      <div className="timeline">
        {timeline.map((step, index) => (
          <div key={step.id || index} className={`timeline-item ${step.side || (index % 2 === 0 ? "left" : "right")}`}>
            
            {/* Card */}
            <div className={`content ${step.final ? "final" : ""}`}>
              <span className="date">{step.date || "No date"}</span>
              <h4>{step.title || "Untitled"}</h4>

              {/* Dropdown */}
              {step.type === "dropdown" && step.options && step.options.length > 0 && (
                <div className="dropdown">
                  <button onClick={() => setOpen(open === index ? null : index)}>
                    View University Offers ▾
                  </button>

                  {open === index && (
                    <div className="dropdown-menu">
                      {step.options.map((opt, i) => (
                        <div key={i} className="dropdown-item">
                          <strong>{opt.university || "University"}</strong>
                          <p>{opt.status || "Status"}</p>
                          <span>{opt.date || "Date"}</span>
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
