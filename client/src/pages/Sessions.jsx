import { useEffect, useState } from "react";
import { FaPlay, FaCalendarAlt, FaYoutube } from "react-icons/fa";
import { API_BASE_URL } from "../config/api";
import "./Sessions.css";

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
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/videos`);
      const data = await response.json();
      if (data.success) {
        setVideos(data.data);
      }
    } catch (err) {
      console.error("Failed to load videos:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleWatchVideo = (youtubeUrl) => {
    window.open(youtubeUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="sessions-page">
      {/* Past Sessions */}
      <section className="sessions-section">
        <h3 className="section-title">
          <FaPlay /> Past Sessions & Recordings
        </h3>

        {loading && (
          <div className="sessions-loading">
            <div className="sessions-spinner"></div>
            <p>Loading sessions...</p>
          </div>
        )}

        {!loading && videos.length === 0 && (
          <div className="sessions-empty">
            <FaYoutube />
            <p>No session recordings available yet.</p>
          </div>
        )}

        {!loading && videos.length > 0 && (
          <div className="recordings-grid">
            {videos.map((video) => (
              <div className="recording-card" key={video._id}>
                <div className="thumbnail" onClick={() => handleWatchVideo(video.youtubeUrl)}>
                  <img src={video.thumbnailUrl} alt={video.title} />
                  <div className="play-overlay">
                    <FaYoutube className="youtube-play-icon" />
                  </div>
                </div>

                <div className="recording-content">
                  <h4>{video.title}</h4>
                  {video.description && <p className="video-description">{video.description}</p>}
                  <span className="date">{formatDate(video.createdAt)}</span>

                  <button className="watch-btn" onClick={() => handleWatchVideo(video.youtubeUrl)}>
                    <FaPlay /> Watch on YouTube
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
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
