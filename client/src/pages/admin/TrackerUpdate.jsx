import { useEffect, useState } from "react";
import { FaEdit, FaPlus, FaSave, FaSpinner, FaTimes, FaTrash } from "react-icons/fa";
import { API_BASE_URL } from "../../config/api";
import "../../components/ProgressTracker.css";
import { getUserProgressTracker, updateUserProgressTracker } from "../../services/progressTrackerApi";
import "./TrackerUpdate.css";

export default function TrackerUpdate() {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [open, setOpen] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Fetch users list
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await fetch(`${API_BASE_URL}/users`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          // Filter out admin users, only show regular users
          const regularUsers = (data.users || data || []).filter(user => !user.isAdmin);
          setUsers(regularUsers);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  // Fetch progress tracker when user is selected
  useEffect(() => {
    if (!selectedUserId) {
      setTimeline([]);
      return;
    }
    const fetchTracker = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Authentication required");
        }

        const data = await getUserProgressTracker(selectedUserId, token);
        setTimeline(data.timeline || data.progressTracker || []);
      } catch (err) {
        setError(err.message || "Failed to load progress tracker");
        setTimeline([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTracker();
  }, [selectedUserId]);

  const handleSave = async () => {
    if (!selectedUserId) {
      setError("Please select a user first");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication required");
      }

      await updateUserProgressTracker(selectedUserId, timeline, token);
      setSuccess("Progress tracker updated successfully!");
      setEditingIndex(null);
    } catch (err) {
      setError(err.message || "Failed to update progress tracker");
    } finally {
      setSaving(false);
    }
  };

  const handleAdd = () => {
    const newItem = {
      id: Date.now(),
      title: "New Step",
      date: new Date().toISOString().split('T')[0],
      side: timeline.length % 2 === 0 ? "left" : "right",
      type: null,
      options: [],
      final: false,
    };
    setTimeline([...timeline, newItem]);
    setEditingIndex(timeline.length);
  };

  const handleDelete = (index) => {
    if (window.confirm("Are you sure you want to delete this step?")) {
      const newTimeline = timeline.filter((_, i) => i !== index);
      setTimeline(newTimeline);
      setEditingIndex(null);
    }
  };

  const handleEdit = (index) => {
    setEditingIndex(index);
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    // Reload tracker to discard changes
    if (selectedUserId) {
      const fetchTracker = async () => {
        try {
          const token = localStorage.getItem("token");
          const data = await getUserProgressTracker(selectedUserId, token);
          setTimeline(data.timeline || data.progressTracker || []);
        } catch (err) {
          console.error("Error reloading tracker:", err);
        }
      };
      fetchTracker();
    }
  };

  const handleFieldChange = (index, field, value) => {
    const newTimeline = [...timeline];
    newTimeline[index] = { ...newTimeline[index], [field]: value };
    setTimeline(newTimeline);
  };

  const handleAddDropdownOption = (index) => {
    const newTimeline = [...timeline];
    if (!newTimeline[index].options) {
      newTimeline[index].options = [];
    }
    newTimeline[index].options.push({
      university: "",
      status: "",
      date: "",
    });
    setTimeline(newTimeline);
  };

  const handleRemoveDropdownOption = (index, optionIndex) => {
    const newTimeline = [...timeline];
    newTimeline[index].options = newTimeline[index].options.filter((_, i) => i !== optionIndex);
    setTimeline(newTimeline);
  };

  const handleDropdownOptionChange = (index, optionIndex, field, value) => {
    const newTimeline = [...timeline];
    newTimeline[index].options[optionIndex] = {
      ...newTimeline[index].options[optionIndex],
      [field]: value,
    };
    setTimeline(newTimeline);
  };

  const selectedUser = users.find(u => u._id === selectedUserId || u.id === selectedUserId);

  return (
    <div className="tracker-update-page">
      <div className="page-header">
        <div>
          <h2>Tracker Update</h2>
          <p>Update progress tracker for students</p>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          {error}
        </div>
      )}

      {success && (
        <div className="success-banner">
          {success}
        </div>
      )}

      {/* User Selection */}
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
            <p><strong>Selected:</strong> {selectedUser.name || selectedUser.email}</p>
          </div>
        )}
      </div>

      {loading ? (
        <div className="loading-container">
          <FaSpinner className="spinner" />
          <p>Loading progress tracker...</p>
        </div>
      ) : selectedUserId && (
        <div className="tracker-editor">
          <div className="editor-actions">
            <button className="btn-add" onClick={handleAdd}>
              <FaPlus /> Add Step
            </button>
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
            {editingIndex !== null && (
              <button className="btn-cancel" onClick={handleCancelEdit}>
                <FaTimes /> Cancel
              </button>
            )}
          </div>

          {/* Progress Tracker - Same design as user dashboard */}
          <div className="visa-wrapper">
            <h3 className="visa-header">Study Abroad Progress tracker</h3>

            <div className="timeline">
              {timeline.length === 0 ? (
                <div className="empty-tracker">
                  <p>No progress tracker steps yet. Click "Add Step" to create one.</p>
                </div>
              ) : (
                timeline.map((step, index) => (
                  <div key={step.id || index} className={`timeline-item ${step.side || (index % 2 === 0 ? "left" : "right")}`}>
                    {/* Card */}
                    <div className={`content ${step.final ? "final" : ""}`}>
                      {editingIndex === index ? (
                        // Edit Mode
                        <div className="edit-form">
                          <div className="form-row">
                            <div className="form-group">
                              <label>Date:</label>
                              <input
                                type="date"
                                value={step.date || ""}
                                onChange={(e) => handleFieldChange(index, "date", e.target.value)}
                              />
                            </div>
                            <div className="form-group">
                              <label>Side:</label>
                              <select
                                value={step.side || "left"}
                                onChange={(e) => handleFieldChange(index, "side", e.target.value)}
                              >
                                <option value="left">Left</option>
                                <option value="right">Right</option>
                              </select>
                            </div>
                          </div>
                          <div className="form-group">
                            <label>Title:</label>
                            <input
                              type="text"
                              value={step.title || ""}
                              onChange={(e) => handleFieldChange(index, "title", e.target.value)}
                              placeholder="Step title"
                            />
                          </div>
                          <div className="form-group">
                            <label>
                              <input
                                type="checkbox"
                                checked={step.final || false}
                                onChange={(e) => handleFieldChange(index, "final", e.target.checked)}
                              />
                              Mark as Final Step
                            </label>
                          </div>
                          <div className="form-group">
                            <label>
                              <input
                                type="checkbox"
                                checked={step.type === "dropdown"}
                                onChange={(e) => handleFieldChange(index, "type", e.target.checked ? "dropdown" : null)}
                              />
                              Has Dropdown (University Offers)
                            </label>
                          </div>
                          {step.type === "dropdown" && (
                            <div className="dropdown-options">
                              <label>Dropdown Options:</label>
                              {step.options?.map((opt, optIndex) => (
                                <div key={optIndex} className="dropdown-option-item">
                                  <input
                                    type="text"
                                    placeholder="University"
                                    value={opt.university || ""}
                                    onChange={(e) => handleDropdownOptionChange(index, optIndex, "university", e.target.value)}
                                  />
                                  <input
                                    type="text"
                                    placeholder="Status"
                                    value={opt.status || ""}
                                    onChange={(e) => handleDropdownOptionChange(index, optIndex, "status", e.target.value)}
                                  />
                                  <input
                                    type="date"
                                    placeholder="Date"
                                    value={opt.date || ""}
                                    onChange={(e) => handleDropdownOptionChange(index, optIndex, "date", e.target.value)}
                                  />
                                  <button
                                    type="button"
                                    className="btn-remove-option"
                                    onClick={() => handleRemoveDropdownOption(index, optIndex)}
                                  >
                                    <FaTrash />
                                  </button>
                                </div>
                              ))}
                              <button
                                type="button"
                                className="btn-add-option"
                                onClick={() => handleAddDropdownOption(index)}
                              >
                                <FaPlus /> Add Option
                              </button>
                            </div>
                          )}
                          <div className="edit-actions">
                            <button className="btn-save-item" onClick={() => setEditingIndex(null)}>
                              <FaSave /> Done
                            </button>
                            <button className="btn-delete-item" onClick={() => handleDelete(index)}>
                              <FaTrash /> Delete
                            </button>
                          </div>
                        </div>
                      ) : (
                        // View Mode
                        <>
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

                          <div className="item-actions">
                            <button className="btn-edit-item" onClick={() => handleEdit(index)}>
                              <FaEdit /> Edit
                            </button>
                            <button className="btn-delete-item" onClick={() => handleDelete(index)}>
                              <FaTrash /> Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Dot */}
                    <span className={`dot ${step.final ? "success" : ""}`} />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
