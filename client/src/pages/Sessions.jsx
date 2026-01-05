import { FaPlay, FaCalendarAlt } from "react-icons/fa";
import "./Sessions.css";

const pastSessions = [
  {
    title: "SOP Writing Workshop",
    speaker: "Dr. Sarah Miller",
    date: "Nov 20, 2025",
    duration: "45 min",
    image:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f",
  },
  {
    title: "University Selection Guide",
    speaker: "Prof. John Davis",
    date: "Nov 15, 2025",
    duration: "60 min",
    image:
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d",
  },
  {
    title: "Visa Process Overview",
    speaker: "Ms. Emily Chen",
    date: "Nov 10, 2025",
    duration: "30 min",
    image:
      "https://images.unsplash.com/photo-1503428593586-e225b39bddfe",
  },
];

const slots = [
  {
    date: "Jan 18, 2026",
    time: "10:00 AM",
    consultant: "Dr. Sarah Miller",
  },
  {
    date: "Jan 18, 2026",
    time: "2:00 PM",
    consultant: "Prof. John Davis",
  },
  {
    date: "Jan 19, 2026",
    time: "11:00 AM",
    consultant: "Ms. Emily Chen",
  },
  {
    date: "Jan 19, 2026",
    time: "3:00 PM",
    consultant: "Dr. Sarah Miller",
  },
];

export default function Sessions() {
  return (
    <div className="sessions-page">
      {/* Past Sessions */}
      <section className="sessions-section">
        <h3 className="section-title">
          <FaPlay /> Past Sessions & Recordings
        </h3>

        <div className="recordings-grid">
          {pastSessions.map((s, i) => (
            <div className="recording-card" key={i}>
              <div className="thumbnail">
                <img src={s.image} alt={s.title} />
                <span className="duration">{s.duration}</span>
              </div>

              <div className="recording-content">
                <h4>{s.title}</h4>
                <p>with {s.speaker}</p>
                <span className="date">{s.date}</span>

                <button className="watch-btn">
                  <FaPlay /> Watch Recording
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Available Slots */}
      <section className="sessions-section">
        <h3 className="section-title">
          <FaCalendarAlt /> Available Time Slots
        </h3>

        <div className="slots-grid">
          {slots.map((slot, i) => (
            <div className="slot-card" key={i}>
              <p className="slot-date">{slot.date}</p>
              <p className="slot-time">{slot.time}</p>
              <p className="slot-name">{slot.consultant}</p>

              <button className="book-btn">Book</button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
