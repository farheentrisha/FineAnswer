import { useState, useEffect } from "react";
import "./ProgressTracker.css";
import { getMyProgressTracker } from "../services/progressTrackerApi";
import {
  getInitialTimeline,
  normalizeTimeline,
  PROGRESS_STEPS,
} from "../utils/progressTrackerSteps";

export default function ProgressTracker() {
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
        const raw = data.timeline || data.progressTracker || [];
        setTimeline(normalizeTimeline(raw));
      } catch (error) {
        console.error("Error fetching progress tracker:", error);
        setTimeline(getInitialTimeline());
      } finally {
        setLoading(false);
      }
    };

    fetchTracker();
  }, []);

  const allComplete = timeline.length > 0 && timeline[9]?.completed;
  const hasData = timeline.some((s) => s.completed);

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

  if (!hasData) {
    return (
      <div className="visa-wrapper">
        <h3 className="visa-header">Study Abroad Progress tracker</h3>
        <div style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}>
          No progress updates yet. Your tracker will appear here once updated by
          admin.
        </div>
      </div>
    );
  }

  return (
    <div className="visa-wrapper">
      <h3 className="visa-header">Study Abroad Progress tracker</h3>
      {allComplete && (
        <div className="progress-complete-banner">
          ✓ Progress Complete
        </div>
      )}

      <div className="timeline">
        {PROGRESS_STEPS.map((def, index) => {
          const item = timeline[index] || {
            step: def.step,
            title: def.title,
            date: null,
            completed: false,
          };

          return (
            <div
              key={item.step}
              className={`timeline-item ${index % 2 === 0 ? "left" : "right"}`}
            >
              <div
                className={`content ${item.completed ? "completed" : ""} ${index === 9 && item.completed ? "final" : ""}`}
              >
                <span className="date">
                  {item.date ? new Date(item.date).toLocaleDateString() : "—"}
                </span>
                <h4>{item.title}</h4>
                {item.completed && (
                  <span className="completed-badge">✓ Completed</span>
                )}
              </div>
              <span className={`dot ${item.completed ? "success" : ""}`} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
