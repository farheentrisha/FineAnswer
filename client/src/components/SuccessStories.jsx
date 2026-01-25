import React, { useEffect, useRef, useState } from "react";
import { FaTimes } from "react-icons/fa";
import "./SuccessStories.css";
import { getSuccessStories } from "../services/successStoriesApi";

export default function SuccessStories() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);

  const autoSlideRef = useRef(null);
  const touchStartX = useRef(0);

  // Fetch success stories from API
  useEffect(() => {
    const fetchStories = async () => {
      try {
        const data = await getSuccessStories();
        const storiesData = data.stories || data || [];
        setStories(storiesData);
        
        // Create infinite loop effect by duplicating stories
        if (storiesData.length > 0) {
          const duplicated = [...storiesData, ...storiesData, ...storiesData];
          setStories(duplicated);
          setActive(storiesData.length); // Start in the middle
        }
      } catch (error) {
        console.error("Error fetching success stories:", error);
        setStories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStories();
  }, []);

  const originalLength = stories.length / 3 || 0;
  const mid = originalLength;

  // AUTO SLIDE
  useEffect(() => {
    if (stories.length === 0) return;

    autoSlideRef.current = setInterval(() => {
      setActive((prev) => prev + 1);
    }, 3000);

    return () => clearInterval(autoSlideRef.current);
  }, [stories.length]);

  // RESET LOOP
  useEffect(() => {
    if (stories.length === 0) return;

    if (active >= stories.length - mid) {
      setActive(mid);
    } else if (active < mid) {
      setActive(stories.length - mid * 2);
    }
  }, [active, stories.length, mid]);

  // TOUCH SWIPE
  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const onTouchMove = (e) => {
    const diff = e.touches[0].clientX - touchStartX.current;

    if (Math.abs(diff) > 50) {
      if (diff > 0) setActive((prev) => prev - 1);
      else setActive((prev) => prev + 1);

      touchStartX.current = e.touches[0].clientX;
    }
  };

  // BUTTON HANDLERS
  const prevSlide = () => setActive((prev) => prev - 1);
  const nextSlide = () => setActive((prev) => prev + 1);

  // Modal handlers
  const openModal = (story) => {
    setSelectedImage(story);
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  };

  const closeModal = () => {
    setSelectedImage(null);
    document.body.style.overflow = 'unset'; // Restore scrolling
  };

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && selectedImage) {
        closeModal();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [selectedImage]);

  if (loading) {
    return (
      <div className="success-wrapper">
        <h2 className="success-title">We have stories to inspire you</h2>
        <p className="success-sub">People who transformed their career with us</p>
        <div style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}>
          Loading stories...
        </div>
      </div>
    );
  }

  if (stories.length === 0) {
    return (
      <div className="success-wrapper">
        <h2 className="success-title">We have stories to inspire you</h2>
        <p className="success-sub">People who transformed their career with us</p>
        <div style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}>
          No success stories available yet.
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="success-wrapper">
        <h2 className="success-title">We have stories to inspire you</h2>
        <p className="success-sub">People who transformed their career with us</p>

        <div className="carousel-container">
          {/* CAROUSEL */}
          <div
            className="carousel"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
          >
            {stories.map((story, i) => {
              const offset = i - active;
              const scale = 1 - Math.min(Math.abs(offset) * 0.15, 0.6);
              const blur = Math.min(Math.abs(offset) * 2, 6);
              const opacity = Math.abs(offset) > 4 ? 0 : 1;

              return (
                <div
                  className="card-container"
                  key={`${story._id || story.id}-${i}`}
                  style={{
                    transform: `translateX(${offset * 220}px) scale(${scale})`,
                    filter: `blur(${blur}px)`,
                    opacity,
                    zIndex: 100 - Math.abs(offset),
                  }}
                >
                  <div 
                    className="card"
                    onClick={() => openModal(story)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="card-image-wrapper">
                      <img 
                        src={story.image} 
                        alt={story.name || "Success story"} 
                        className="story-card-image"
                      />
                    </div>
                    <div className="card-content">
                      <h3>{story.name}</h3>
                      <p className="card-university">{story.university}</p>
                      <p className="card-country">{story.country}</p>
                      <p className="card-program">{story.program}</p>
                      <p className="card-story">{story.story}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modal */}
      {selectedImage && (
        <div className="story-modal-overlay" onClick={closeModal}>
          <div className="story-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="story-modal-close" onClick={closeModal}>
              <FaTimes />
            </button>
            <div className="story-modal-body">
              <div className="story-modal-image-wrapper">
                <img 
                  src={selectedImage.image} 
                  alt={selectedImage.name || "Success story"} 
                  className="story-modal-image"
                />
              </div>
              <div className="story-modal-details">
                <h2>{selectedImage.name}</h2>
                <p className="modal-university"><strong>University:</strong> {selectedImage.university}</p>
                <p className="modal-country"><strong>Country:</strong> {selectedImage.country}</p>
                <p className="modal-program"><strong>Program:</strong> {selectedImage.program}</p>
                <p className="modal-story">{selectedImage.story}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
