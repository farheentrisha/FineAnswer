import React, { useEffect, useRef, useState } from "react";
import "./SuccessStories.css";

import uni1 from "../images/uni1.jpg";
import uni2 from "../images/uni2.jpg";
import uni3 from "../images/uni3.jpg";
import uni4 from "../images/ireland.jpg";
import uni5 from "../images/uk.jpg";
import uni6 from "../images/aus.jpg";

const originalCards = [
  { name: "Amir Hossain", role: "Software Engineer", img: uni1 },
  { name: "Sarah Khan", role: "Content Creator", img: uni2 },
  { name: "Tanvir Rahman", role: "Marketing Lead", img: uni3 },
  { name: "Maria Ahmed", role: "Product Designer", img: uni4 },
  { name: "Jamil Hasan", role: "Data Analyst", img: uni5 },
  { name: "Elena Basu", role: "HR Specialist", img: uni6 },
];

// Duplicate cards to create infinite loop effect
const cards = [...originalCards, ...originalCards, ...originalCards];

export default function SuccessStories() {
  const mid = originalCards.length; // start at the middle block
  const [active, setActive] = useState(mid);

  const autoSlideRef = useRef(null);
  const touchStartX = useRef(0);

  // AUTO SLIDE
  useEffect(() => {
    autoSlideRef.current = setInterval(() => {
      setActive((prev) => prev + 1);
    }, 3000);

    return () => clearInterval(autoSlideRef.current);
  }, []);

  // RESET to middle block to keep infinite loop seamless
  useEffect(() => {
    if (active >= cards.length - mid) {
      setActive(mid);
    } else if (active < mid) {
      setActive(cards.length - mid * 2);
    }
  }, [active]);

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

  return (
    <div className="success-wrapper">
      <h2 className="success-title">Success Stories</h2>
      <p className="success-sub">People who transformed their career with us</p>

      <div
        className="carousel"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
      >
        {cards.map((c, i) => {
          const offset = i - active;
          const scale = 1 - Math.min(Math.abs(offset) * 0.15, 0.6);
          const blur = Math.min(Math.abs(offset) * 2, 6);
          const opacity = Math.abs(offset) > 4 ? 0 : 1;

          return (
            <div
              className="card-container"
              key={i}
              style={{
                transform: `translateX(${offset * 220}px) scale(${scale})`,
                filter: `blur(${blur}px)`,
                opacity,
                zIndex: 100 - Math.abs(offset),
              }}
            >
              <div className="card">
                <img src={c.img} alt="" />
                <h3>{c.name}</h3>
                <p>{c.role}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
