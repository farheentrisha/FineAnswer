import React, { useRef, useEffect, useState, useCallback } from "react";
import { PageFlip } from "page-flip";
import "./BrochureFlipBook.css";

const BROCHURE_IMAGES = ["/1.png", "/2.png", "/3.png", "/4.png"];

const PAGE_WIDTH = 500;
const PAGE_HEIGHT = 700;

export default function BrochureFlipBook() {
  const containerRef = useRef(null);
  const pageFlipRef = useRef(null);
  const [usePortrait, setUsePortrait] = useState(() => window.innerWidth < 768);

  const initBook = useCallback((portrait) => {
    if (!containerRef.current) return null;

    const el = document.createElement("div");
    el.className = "brochure-flip-book-inner";
    containerRef.current.innerHTML = "";
    containerRef.current.appendChild(el);

    const pageFlip = new PageFlip(el, {
      width: PAGE_WIDTH,
      height: PAGE_HEIGHT,
      drawShadow: true,
      flippingTime: 700,
      usePortrait: portrait,
      autoSize: true,
      maxShadowOpacity: 0.6,
      disableFlipByClick: true,
    });

    pageFlip.loadFromImages(BROCHURE_IMAGES);
    return pageFlip;
  }, []);

  useEffect(() => {
    const pageFlip = initBook(usePortrait);
    pageFlipRef.current = pageFlip;

    return () => {
      if (pageFlipRef.current && typeof pageFlipRef.current.destroy === "function") {
        pageFlipRef.current.destroy();
      }
      pageFlipRef.current = null;
    };
  }, [usePortrait, initBook]);

  useEffect(() => {
    const handleResize = () => {
      const nextPortrait = window.innerWidth < 768;
      setUsePortrait((prev) => (prev !== nextPortrait ? nextPortrait : prev));
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handlePrev = () => {
    if (pageFlipRef.current) pageFlipRef.current.flipPrev("bottom");
  };

  const handleNext = () => {
    if (pageFlipRef.current) pageFlipRef.current.flipNext("bottom");
  };

  const handleBookClick = (e) => {
    if (!pageFlipRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const mid = rect.width / 2;
    if (x < mid) handlePrev();
    else handleNext();
  };

  return (
    <div className="brochure-flip-book-wrapper">
      <div
        ref={containerRef}
        className="brochure-flip-book-container"
        onClick={handleBookClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") handlePrev();
          if (e.key === "ArrowRight") handleNext();
        }}
        aria-label="Brochure flip book – click left to go back, right to go forward"
      />
      <div className="brochure-flip-book-controls">
        <button type="button" className="brochure-btn brochure-btn-prev" onClick={handlePrev}>
          ← Prev
        </button>
        <button type="button" className="brochure-btn brochure-btn-next" onClick={handleNext}>
          Next →
        </button>
      </div>
    </div>
  );
}
