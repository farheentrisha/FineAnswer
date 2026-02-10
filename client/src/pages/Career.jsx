import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "../config/api";
import "./admin/Career.css";

export default function Career() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [applyingJob, setApplyingJob] = useState(null);
  const [applicationText, setApplicationText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/jobs`);
        const data = await res.json();
        if (data.success) {
          setJobs(data.data);
          setError(null);
        } else {
          setError("Failed to load jobs");
        }
      } catch (_err) {
        setError("Failed to load jobs");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const formatDate = (value) => {
    if (!value) return "Open until filled";
    const d = new Date(value);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const isClosed = (deadline) => {
    if (!deadline) return false;
    return new Date(deadline) < new Date();
  };

  const handleOpenApply = (job) => {
    setApplyingJob(job);
    setApplicationText("");
    setSuccessMessage("");
  };

  const handleCloseApply = () => {
    setApplyingJob(null);
    setApplicationText("");
  };

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    if (!applyingJob) return;
    setSubmitting(true);
    setSuccessMessage("");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/jobs/${applyingJob._id}/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          documents: applicationText,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMessage("Application submitted successfully.");
        setTimeout(() => {
          handleCloseApply();
        }, 1200);
      } else {
        alert(data.message || "Failed to submit application");
      }
    } catch (_err) {
      alert("An error occurred while submitting the application");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="user-career-page">
      <h2 className="career-title">Career Opportunities</h2>

      {loading && (
        <div className="career-loading">
          <div className="spinner" />
          <p>Loading jobs...</p>
        </div>
      )}

      {error && !loading && <div className="career-error">{error}</div>}

      {!loading && !error && jobs.length === 0 && (
        <div className="career-empty">
          <p>No job posts available at the moment. Please check back later.</p>
        </div>
      )}

      {!loading && !error && jobs.length > 0 && (
        <div className="career-job-grid">
          {jobs.map((job) => {
            const closed = isClosed(job.deadline);
            return (
              <div key={job._id} className="career-job-card">
                <h3>{job.title}</h3>
                <p className="career-job-meta">
                  {job.company} • {job.location} •{" "}
                  {job.employmentType || "Full-time"}
                </p>
                <p className="career-job-deadline">
                  Deadline: {formatDate(job.deadline)}
                </p>
                <p className="career-job-desc">{job.description}</p>
                {job.requirements && (
                  <p className="career-job-req">
                    <strong>Requirements:</strong> {job.requirements}
                  </p>
                )}
                {job.applicationUrl && (
                  <a
                    href={job.applicationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="career-apply-link"
                  >
                    View Job Details
                  </a>
                )}
                <button
                  className="career-submit-btn"
                  disabled={closed}
                  onClick={() => !closed && handleOpenApply(job)}
                >
                  {closed ? "Applications Closed" : "Apply for this Job"}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {applyingJob && (
        <div className="career-modal-overlay">
          <div className="career-modal">
            <div className="career-modal-header">
              <h3>Apply for {applyingJob.title}</h3>
              <button className="career-close-btn" onClick={handleCloseApply}>
                ×
              </button>
            </div>

            <form className="career-form" onSubmit={handleSubmitApplication}>
              <div className="career-form-group">
                <label htmlFor="documents">
                  Necessary documents / links (CV, cover letter, portfolio,
                  etc.)
                </label>
                <textarea
                  id="documents"
                  rows="4"
                  value={applicationText}
                  onChange={(e) => setApplicationText(e.target.value)}
                  placeholder="Provide links or details to your required documents"
                  required
                />
              </div>

              {successMessage && (
                <p className="career-success-message">{successMessage}</p>
              )}

              <div className="career-form-actions">
                <button
                  type="button"
                  className="career-cancel-btn"
                  onClick={handleCloseApply}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="career-submit-btn"
                  disabled={submitting}
                >
                  {submitting ? "Submitting..." : "Submit Application"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

