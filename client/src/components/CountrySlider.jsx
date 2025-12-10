import React, { useState } from "react";
import "./CountrySlider.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";

export default function CountrySlider({ countries }) {
  const [activeSlide, setActiveSlide] = useState(2);

  const next = () =>
    activeSlide < countries.length - 1 && setActiveSlide(activeSlide + 1);

  const prev = () =>
    activeSlide > 0 && setActiveSlide(activeSlide - 1);

  const getStyles = (index) => {
    const isMobile = window.innerWidth < 768;

    const left1 = isMobile ? -150 : -240;
    const right1 = isMobile ? 150 : 240;
    const depth1 = isMobile ? -250 : -400;

    const left2 = isMobile ? -300 : -480;
    const right2 = isMobile ? 300 : 480;
    const depth2 = isMobile ? -300 : -500;

    if (activeSlide === index)
      return {
        opacity: 1,
        transform: "translateX(0px) translateZ(0px) rotateY(0deg)",
        zIndex: 10,
      };
    else if (activeSlide - 1 === index)
      return {
        opacity: 1,
        transform: `translateX(${left1}px) translateZ(${depth1}px) rotateY(35deg)`,
        zIndex: 9,
      };
    else if (activeSlide + 1 === index)
      return {
        opacity: 1,
        transform: `translateX(${right1}px) translateZ(${depth1}px) rotateY(-35deg)`,
        zIndex: 9,
      };
    else if (activeSlide - 2 === index)
      return {
        opacity: 1,
        transform: `translateX(${left2}px) translateZ(${depth2}px) rotateY(35deg)`,
        zIndex: 8,
      };
    else if (activeSlide + 2 === index)
      return {
        opacity: 1,
        transform: `translateX(${right2}px) translateZ(${depth2}px) rotateY(-35deg)`,
        zIndex: 8,
      };
    else return { opacity: 0 };
  };

  return (
    <div className="country-slider-wrapper">
      <h2 className="cs-title">Countries We Operate In</h2>
      <p className="cs-sub">Helping students reach global education destinations</p>

      <div className="slideC">
        {countries.map((c, i) => (
          <div className="slide" key={c.id} style={{ background: c.bgColor, ...getStyles(i) }}>
            <div className="sliderContent">
              <img src={c.flag} className="flag-img" alt="" />
              <h3>{c.title}</h3>
              <p>{c.desc}</p>

              <button className="details-btn">View Details</button>
            </div>
          </div>
        ))}
      </div>

      <div className="btns">
        <FontAwesomeIcon className="btn" onClick={prev} icon={faChevronLeft} />
        <FontAwesomeIcon className="btn" onClick={next} icon={faChevronRight} />
      </div>
    </div>
  );
}
