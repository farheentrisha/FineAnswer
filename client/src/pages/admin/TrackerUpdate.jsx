import { useEffect, useState } from "react";
import { FaCheck, FaSave, FaSpinner } from "react-icons/fa";
import { API_BASE_URL } from "../../config/api";
import "../../components/ProgressTracker.css";
import {
  getInitialTimeline,
  normalizeTimeline,
  PROGRESS_STEPS,
} from "../../utils/progressTrackerSteps";
import { getUserProgressTracker, updateUserProgressTracker } from "../../services/progressTrackerApi";
import "./TrackerUpdate.css";

export default function TrackerUpdate() {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await fetch(`${API_BASE_URL}/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          const regularUsers = (data.users || data || []).filter(
            (user) => !user.isAdmin,
          );
          setUsers(regularUsers);
        }
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    if (!selectedUserId) {
      setTimeline(getInitialTimeline());
      return;
    }

    const fetchTracker = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Authentication required");

        const data = await getUserProgressTracker(selectedUserId, token);
        const raw = data.timeline || data.progressTracker || [];
        setTimeline(normalizeTimeline(raw));
      } catch (err) {
        setError(err.message || "Failed to load progress tracker");
        setTimeline(getInitialTimeline());
      } finally {
        setLoading(false);
      }
    };

    fetchTracker();
  }, [selectedUserId]);

  const handleDateChange = (index, date) => {
    const newTimeline = [...timeline];
    newTimeline[index] = {
      ...newTimeline[index],
      date: date || null,
      completed: !!date,
    };
    setTimeline(newTimeline);
  };

  const handleSave = async () => {
    if (!selectedUserId) {
      setError("Please select a student first");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication required");

      await updateUserProgressTracker(selectedUserId, timeline, token);
      setSuccess("Progress tracker updated successfully!");
    } catch (err) {
      setError(err.message || "Failed to update progress tracker");
    } finally {
      setSaving(false);
    }
  };

  const handleDone = async () => {
    if (!selectedUserId) {
      setError("Please select a student first");
      return;
    }

    const newTimeline = [...timeline];
    const today = new Date().toISOString().split("T")[0];
    newTimeline[9] = {
      ...newTimeline[9],
      date: today,
      completed: true,
    };
    setTimeline(newTimeline);

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication required");

      await updateUserProgressTracker(selectedUserId, newTimeline, token);
      setSuccess("Progress marked as complete!");
    } catch (err) {
      setError(err.message || "Failed to update progress tracker");
    } finally {
      setSaving(false);
    }
  };

  const selectedUser = users.find(
    (u) => u._id === selectedUserId || u.id === selectedUserId,
  );

  return (
    <div className="tracker-update-page">
      <div className="page-header">
        <div>
          <h2>Tracker Update</h2>
          <p>Update progress tracker for students</p>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}
      {success && <div className="success-banner">{success}</div>}

      <div className="user-selection-card">
        <label htmlFor="user-select">Select Student:</label>
        <select
          id="user-select"
          value={selectedUserId}
          onChange={(e) => setSelectedUserId(e.target.value)}
          className="user-select"
        >
          <option value="">-- Select a student --</option>
          {users.map((user) => (
            <option key={user._id || user.id} value={user._id || user.id}>
              {user.name || user.email} ({user.email})
            </option>
          ))}
        </select>
        {selectedUser && (
          <div className="selected-user-info">
            <p>
              <strong>Selected:</strong> {selectedUser.name || selectedUser.email}
            </p>
          </div>
        )}
      </div>

      {loading ? (
        <div className="loading-container">
          <FaSpinner className="spinner" />
          <p>Loading progress tracker...</p>
        </div>
      ) : (
        selectedUserId && (
          <div className="tracker-editor">
            <div className="editor-actions">
              <button
                className="btn-save"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <FaSpinner className="spinner" /> Saving...
                  </>
                ) : (
                  <>
                    <FaSave /> Save Changes
                  </>
                )}
              </button>
            </div>

            <div className="visa-wrapper">
              <h3 className="visa-header">Study Abroad Progress tracker</h3>

              <div className="timeline tracker-steps-list">
                {PROGRESS_STEPS.map((def, index) => {
                  const item = timeline[index] || {
                    step: def.step,
                    title: def.title,
                    date: null,
                    completed: false,
                  };
                  const isLast = index === 9;

                  return (
                    <div
                      key={item.step}
                      className={`timeline-item ${index % 2 === 0 ? "left" : "right"}`}
                    >
                      <div
                        className={`content ${item.completed ? "completed" : ""} ${isLast ? "final" : ""}`}
                      >
                        <span className="step-number">{item.step}</span>
                        <h4>{item.title}</h4>

                        {isLast ? (
                          <button
                            type="button"
                            className="btn-done"
                            onClick={handleDone}
                            disabled={saving || item.completed}
                          >
                            {item.completed ? (
                              <>✓ Completed {item.date && `(${item.date})`}</>
                            ) : (
                              <>
                                <FaCheck /> Done
                              </>
                            )}
                          </button>
                        ) : (
                          <div className="step-date-row">
                            <label>Date completed:</label>
                            <input
                              type="date"
                              value={item.date || ""}
                              onChange={(e) =>
                                handleDateChange(index, e.target.value)
                              }
                            />
                            {item.completed && (
                              <span className="step-completed-badge">✓</span>
                            )}
                          </div>
                        )}
                      </div>
                      <span
                        className={`dot ${item.completed ? "success" : ""}`}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
}
