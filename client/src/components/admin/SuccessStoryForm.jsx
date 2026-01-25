import { useState } from "react";
import { FaTimes, FaCloudUploadAlt, FaSpinner } from "react-icons/fa";
import { uploadImageToCloudinary } from "../../utils/cloudinary";
import { createSuccessStory } from "../../services/successStoriesApi";
import "./SuccessStoryForm.css";

export default function SuccessStoryForm({ isOpen, onClose, onSuccess }) {
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError("Image size should be less than 10MB");
        return;
      }
      setImage(file);
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

    if (!image) {
      setError("Please select an image");
      return;
    }

    setUploading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication required");
      }

      // Upload image to Cloudinary
      const imageUrl = await uploadImageToCloudinary(image);

      // Create success story with only image URL
      const storyData = {
        image: imageUrl,
      };

      await createSuccessStory(storyData, token);

      // Reset form
      setImage(null);
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
            <label htmlFor="image">Success Story Image *</label>
            <p className="form-help-text">Upload a complete success story graphic. The image will be displayed on both the success stories page and home page.</p>
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
