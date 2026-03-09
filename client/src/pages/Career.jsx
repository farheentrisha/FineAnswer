import React, { useEffect, useState } from "react";
import {
  FaArrowLeft,
  FaHeartbeat,
  FaUtensils,
  FaClock,
  FaChevronRight,
  FaExternalLinkAlt,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/api";
import { IRELAND_JOB_LINKS } from "../constants/irelandJobLinks";
import "./admin/Career.css";

export default function Career() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/jobs`);
        const data = await res.json();
        if (data.success) {
          setJobs(data.data);
        } else {
          setError("Failed to load jobs");
        }
      } catch (_err) {
        setError("Network error occurred");
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  return (
    <div className="career-container">
      {/* 1. BACK TO HOME BUTTON */}
      <nav className="career-nav">
        <button onClick={() => navigate("/")} className="back-home-btn">
          <FaArrowLeft /> Back to Home
        </button>
      </nav>

      {/* 2. HERO SECTION (Why Work With Us) */}
      <header className="career-hero">
        <h1 className="hero-title2">Careers</h1>
        <p className="hero-subtitle33">
          Join our mission to transform education and career building. 
          We’re looking for passionate individuals to join our growing team.
        </p>

        <div className="value-props-section">
          <h2 className="section-title">Why work with us?</h2>
          <div className="values-grid">
            <div className="value-item">
              <div className="value-icon green"><FaUtensils /></div>
              <div className="value-text">
                <h3>Global Impact </h3>
                <p>Change lives by facilitating access to world-class universities across the UK, USA, and Canada.</p>
              </div>
            </div>
            <div className="value-item">
              <div className="value-icon blue"><FaHeartbeat /></div>
              <div className="value-text">
                <h3>Student Success</h3>
                <p>Be part of a culture that celebrates every student visa approval and successful enrollment.</p>
              </div>
            </div>
            <div className="value-item">
              <div className="value-icon purple"><FaClock /></div>
              <div className="value-text">
                <h3>Exposure & Travel</h3>
                <p>Opportunities for international training and university networking events across the globe</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Section 1: Career in FineAnswer */}
      <section className="openings-section career-section career-section-fineanswer">
        <h2 className="section-title center">Career in FineAnswer</h2>
        <p className="career-section-desc center-desc">
          Open positions at FineAnswer. View details and apply for the role that fits you.
        </p>

        {loading ? (
          <div className="career-loading">
            <div className="spinner" />
            <p>Scanning for opportunities...</p>
          </div>
        ) : error ? (
          <div className="career-error">{error}</div>
        ) : jobs.length === 0 ? (
          <div className="career-empty">
            <p>No open positions at the moment. Check back later or explore other jobs in Ireland below.</p>
          </div>
        ) : (
          <div className="career-job-grid">
            {jobs.map((job) => (
              <div key={job._id} className="job-card-premium">
                <div className="job-card-header">
                  <div>
                    <h3>{job.title}</h3>
                    <p>{job.location} • {job.employmentType || "Full-time"}</p>
                  </div>
                  <span className="job-badge">NEW</span>
                </div>

                <button
                  className="job-action-link"
                  onClick={() => navigate(`/jobs/${job._id}`)}
                >
                  View details &amp; Apply <FaChevronRight />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Section 2: Explore Other jobs in Ireland */}
      <section className="career-section career-section-ireland user-career-ireland">
        <h2 className="section-title center">Explore Other jobs in Ireland</h2>
        <p className="career-section-desc center-desc">
          Browse graduate, experienced, corporate, and healthcare roles on these trusted Irish job portals.
        </p>
        <div className="ireland-links-grid">
          {IRELAND_JOB_LINKS.map((item, index) => (
            <a
              key={index}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="ireland-link-card"
            >
              <div className="ireland-link-logo-wrap">
                <img src={item.logo} alt="" className="ireland-link-logo" />
              </div>
              <div className="ireland-link-content">
                <span className="ireland-link-label">{item.label}</span>
                {item.description && (
                  <span className="ireland-link-desc">{item.description}</span>
                )}
              </div>
              <FaExternalLinkAlt className="ireland-link-icon" />
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}