import React, { useEffect, useState } from "react";
import "./SuccessStories.css";

import uni1 from '../images/uni1.jpg';
import uni2 from '../images/uni2.jpg';
import uni3 from '../images/uni3.jpg';
import uni4 from '../images/ireland.jpg';
import uni5 from '../images/uk.jpg';
import uni6 from '../images/aus.jpg';

const SuccessStories = () => {
  const cards = [
    { name: "Amir Hossain", role: "Software Engineer", img: uni1 },
    { name: "Sarah Khan", role: "Content Creator", img: uni2 },
    { name: "Tanvir Rahman", role: "Marketing Lead", img: uni3 },
    { name: "Maria Ahmed", role: "Product Designer", img: uni4 },
    { name: "Jamil Hasan", role: "Data Analyst", img: uni5 },
    { name: "Elena Basu", role: "HR Specialist", img: uni6 },
  ];

  const [angle, setAngle] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAngle((prev) => prev + 0.7);   // rotation speed
    }, 60);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="success-main">
      <h2 className="success-title">Success Stories</h2>
      <p className="success-sub">People who transformed their career with us</p>

      <div className="carousel-container">
        {cards.map((c, i) => {
          const cardAngle = angle + i * (360 / cards.length);

          return (
            <div
              key={i}
              className="story-card"
              style={{
                transform: `
                  rotateY(${cardAngle}deg)
                  translateZ(330px)
                  rotateY(-${cardAngle}deg)
                `,
              }}
            >
              <img src={c.img} alt="" />
              <h3>{c.name}</h3>
              <p>{c.role}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SuccessStories;