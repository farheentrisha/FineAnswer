import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./LandingPage";
import AustraliaPage from "./AustraliaPage";
import UKPage from "./UKPage";
import Login from "./LoginPage";
import Register from "./RegisterPage";
import Navbar3 from "./components/navbar3";
import "./App.css";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

export default function App() {
  useEffect(() => {
    gsap.utils.toArray(".reveal").forEach((elem) => {
      gsap.from(elem, {
        opacity: 0,
        y: 50,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: elem,
          start: "top 85%",
        },
      });
    });
  }, []);

  return (
    <Router>
      <Navbar3 />

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/australia" element={<AustraliaPage />} />
        <Route path="/uk" element={<UKPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  );
}
