import React, { useEffect, useRef, useState } from "react";
import { FaUniversity, FaMapMarkerAlt } from "react-icons/fa";
import "./SuccessStories.css";
import { getSuccessStories } from "../services/successStoriesApi";

export default function SuccessStories() {
  const [stories, setStories] = useState([]);
  const [active, setActive] = useState(0);
  const autoSlideRef = useRef(null);
  const touchStartX = useRef(0);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const data = await getSuccessStories();
        const raw = Array.isArray(data)
          ? data
          : data?.stories ?? data?.data ?? [];
        setStories(raw || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchStories();
  }, []);

  // Auto Slide
  useEffect(() => {
    if (stories.length === 0) return;

    autoSlideRef.current = setInterval(() => {
      setActive((prev) =>
        prev === stories.length - 1 ? 0 : prev + 1
      );
    }, 3500);

    return () => clearInterval(autoSlideRef.current);
  }, [stories]);

  const prevSlide = () => {
    setActive((prev) =>
      prev === 0 ? stories.length - 1 : prev - 1
    );
  };

  const nextSlide = () => {
    setActive((prev) =>
      prev === stories.length - 1 ? 0 : prev + 1
    );
  };

  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e) => {
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) prevSlide();
      else nextSlide();
    }
  };

  if (stories.length === 0) {
    return (
      <div className="success-wrapper">
        <h2 className="success-title">We have stories to inspire you</h2>
        <p className="success-sub">People who transformed their career with us</p>
      </div>
    );
  }

  return (
    <div className="success-wrapper">
      <h2 className="success-title">We have stories to inspire you</h2>
      <p className="success-sub">
        People who transformed their career with us
      </p>

      <div className="carousel-container">
        <button className="nav-btn left" onClick={prevSlide}>
          ←
        </button>

        <button className="nav-btn right" onClick={nextSlide}>
          →
        </button>

        <div
          className="carousel"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {stories.map((story, index) => {
            const offset =
              (index - active + stories.length) % stories.length;

            let position = offset;
            if (offset > stories.length / 2) {
              position = offset - stories.length;
            }

            const scale = position === 0 ? 1 : 0.8;
            const opacity = position === 0 ? 1 : 0.5;

            return (
              <div
                key={index}
                className="card-container"
                style={{
                  transform: `translateX(${position * 320}px) scale(${scale})`,
                  opacity,
                  zIndex: position === 0 ? 10 : 5,
                }}
              >
                <div className="card">
                  <div className="card-image-wrapper">
                    <img
                      src={story.image}
                      alt={story.name}
                      className="story-card-image"
                    />
                  </div>

                  <div className="card-content">
                    <h3>{story.name}</h3>

                    <p className="card-meta">
                      <FaUniversity className="card-icon" />
                      {story.university}
                    </p>

                    <p className="card-meta">
                      <FaMapMarkerAlt className="card-icon" />
                      {story.country}
                    </p>

                    <p className="card-story">
                      {story.story}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}