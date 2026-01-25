import { useState, useEffect } from "react";
import { FaPlus, FaTrash, FaSpinner } from "react-icons/fa";
import SuccessStoryForm from "../../components/admin/SuccessStoryForm";
import { getSuccessStories, deleteSuccessStory } from "../../services/successStoriesApi";
import "./SuccessStories.css";

export default function SuccessStories() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState(null);

  const fetchStories = async () => {
    try {
      setLoading(true);
      const data = await getSuccessStories();
      setStories(data.stories || data || []);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to load success stories");
      setStories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this success story?")) {
      return;
    }

    try {
      setDeleting(id);
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication required");
      }

      await deleteSuccessStory(id, token);
      await fetchStories();
    } catch (err) {
      alert(err.message || "Failed to delete success story");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="admin-success-stories">
      <div className="page-header">
        <div>
          <h2>Success Stories</h2>
          <p>Manage success stories that appear on the landing page</p>
        </div>
        <button className="btn-create" onClick={() => setIsFormOpen(true)}>
          <FaPlus /> Create New Story
        </button>
      </div>

      {error && (
        <div className="error-banner">
          {error}
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <FaSpinner className="spinner" />
          <p>Loading stories...</p>
        </div>
      ) : stories.length === 0 ? (
        <div className="empty-state">
          <p>No success stories yet. Create your first story!</p>
        </div>
      ) : (
        <div className="stories-grid">
          {stories.map((story) => (
            <div key={story._id || story.id} className="story-card">
              <div className="story-image">
                <img src={story.image} alt={story.name || "Success story"} />
              </div>
              <div className="story-content">
                <h3>{story.name}</h3>
                <p className="story-university">{story.university}</p>
                <p className="story-country">{story.country}</p>
                <p className="story-program">{story.program}</p>
                <p className="story-text">{story.story}</p>
              </div>
              <div className="story-actions">
                <button
                  className="btn-delete"
                  onClick={() => handleDelete(story._id || story.id)}
                  disabled={deleting === (story._id || story.id)}
                >
                  {deleting === (story._id || story.id) ? (
                    <FaSpinner className="spinner" />
                  ) : (
                    <FaTrash />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <SuccessStoryForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={fetchStories}
      />
    </div>
  );
}
