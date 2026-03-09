import { PageFlip } from "page-flip";
import React, { useCallback, useEffect, useRef, useState } from "react";
import page1 from "../assets/1.png";
import page2 from "../assets/2.png";
import page3 from "../assets/3.png";
import page4 from "../assets/4.png";
import "./BrochureFlipBook.css";

const BROCHURE_IMAGES = [page1, page2, page3, page4];
/* Larger dimensions = sharper text (source PNGs are ~3091×4000) */
const PAGE_WIDTH = 700;
const PAGE_HEIGHT = 1000;

const ZOOM_MIN = 0.75;
const ZOOM_MAX = 2;
const ZOOM_STEP = 0.25;

export default function BrochureFlipBook() {
  const containerRef = useRef(null);
  const pageFlipRef = useRef(null);
  const [usePortrait, setUsePortrait] = useState(() => window.innerWidth < 768);
  const [zoom, setZoom] = useState(1);
  const [bookHeight, setBookHeight] = useState(0);

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

    const rafId = requestAnimationFrame(() => {
      if (containerRef.current) {
        const h = containerRef.current.offsetHeight;
        if (h > 0) setBookHeight(h);
      }
    });

    return () => {
      cancelAnimationFrame(rafId);
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

  const handleZoomIn = () => setZoom((z) => Math.min(z + ZOOM_STEP, ZOOM_MAX));
  const handleZoomOut = () => setZoom((z) => Math.max(z - ZOOM_STEP, ZOOM_MIN));
  const handleZoomReset = () => setZoom(1);

  return (
    <div className="brochure-flip-book-wrapper">
      <div
        className="brochure-flip-book-zoom-wrapper"
        style={{
          minHeight: bookHeight > 0 ? `${Math.ceil(bookHeight * zoom)}px` : undefined,
          overflow: "visible",
        }}
      >
        <div
          ref={containerRef}
          className="brochure-flip-book-container"
          style={{ transform: `scale(${zoom})`, transformOrigin: "center top", willChange: "transform" }}
          onClick={handleBookClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") handlePrev();
            if (e.key === "ArrowRight") handleNext();
          }}
          aria-label="Brochure flip book – click left to go back, right to go forward"
        />
      </div>
      <div className="brochure-flip-book-controls">
        <div className="brochure-zoom-controls">
          <button
            type="button"
            className="brochure-btn brochure-btn-zoom"
            onClick={handleZoomOut}
            disabled={zoom <= ZOOM_MIN}
            title="Zoom out"
            aria-label="Zoom out"
          >
            −
          </button>
          <span className="brochure-zoom-value">{Math.round(zoom * 100)}%</span>
          <button
            type="button"
            className="brochure-btn brochure-btn-zoom"
            onClick={handleZoomIn}
            disabled={zoom >= ZOOM_MAX}
            title="Zoom in"
            aria-label="Zoom in"
          >
            +
          </button>
          {zoom !== 1 && (
            <button
              type="button"
              className="brochure-btn brochure-btn-reset"
              onClick={handleZoomReset}
              title="Reset zoom"
            >
              Reset
            </button>
          )}
        </div>
        <div className="brochure-page-controls">
          <button type="button" className="brochure-btn brochure-btn-prev" onClick={handlePrev}>
            ← Prev
          </button>
          <button type="button" className="brochure-btn brochure-btn-next" onClick={handleNext}>
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
