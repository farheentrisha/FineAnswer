import { useState } from "react";
import { FaTimes, FaCloudUploadAlt, FaSpinner } from "react-icons/fa";
import { uploadImageToCloudinary } from "../../utils/cloudinary";
import { createSuccessStory } from "../../services/successStoriesApi";
import "./SuccessStoryForm.css";

export default function SuccessStoryForm({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: "",
    university: "",
    country: "",
    program: "",
    story: "",
    image: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError("Image size should be less than 10MB");
        return;
      }
      setFormData({ ...formData, image: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.name || !formData.university || !formData.country || !formData.program || !formData.story || !formData.image) {
      setError("Please fill in all required fields");
      return;
    }

    setUploading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication required");
      }

      // Upload image to Cloudinary
      const imageUrl = await uploadImageToCloudinary(formData.image);

      // Create success story with all data
      const storyData = {
        name: formData.name,
        university: formData.university,
        country: formData.country,
        program: formData.program,
        story: formData.story,
        image: imageUrl,
      };

      await createSuccessStory(storyData, token);

      // Reset form
      setFormData({
        name: "",
        university: "",
        country: "",
        program: "",
        story: "",
        image: null,
      });
      setImagePreview(null);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || "Failed to create success story");
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create Success Story</h2>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="success-story-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="name">Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter student name"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="university">University *</label>
              <input
                type="text"
                id="university"
                name="university"
                value={formData.university}
                onChange={handleChange}
                placeholder="University name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="country">Country *</label>
              <input
                type="text"
                id="country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                placeholder="Country name"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="program">Program *</label>
            <input
              type="text"
              id="program"
              name="program"
              value={formData.program}
              onChange={handleChange}
              placeholder="e.g., Master of Science in Computer Science"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="story">Success Story *</label>
            <textarea
              id="story"
              name="story"
              value={formData.story}
              onChange={handleChange}
              placeholder="Write the success story here..."
              rows="5"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="image">Image *</label>
            <div className="image-upload-container">
              <input
                type="file"
                id="image"
                name="image"
                accept="image/*"
                onChange={handleImageChange}
                className="file-input"
                required
              />
              <label htmlFor="image" className="file-label">
                <FaCloudUploadAlt />
                <span>{imagePreview ? "Change Image" : "Choose Image"}</span>
              </label>
              {imagePreview && (
                <div className="image-preview">
                  <img src={imagePreview} alt="Preview" />
                </div>
              )}
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-cancel">
              Cancel
            </button>
            <button type="submit" className="btn-submit" disabled={uploading}>
              {uploading ? (
                <>
                  <FaSpinner className="spinner" /> Uploading...
                </>
              ) : (
                "Create Story"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
