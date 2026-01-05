import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./LandingPage";
import AustraliaPage from "./AustraliaPage";
import UKPage from "./UKPage";
import IrelandPage from "./IrelandPage";

import Login from "./LoginPage";
import Register from "./RegisterPage";
import DashboardLayout from "./pages/DashboardLayout";
import DashboardHome from "./pages/DashboardHome";
import Universities from "./pages/Universities";
import DocumentChecklist from "./pages/DocumentChecklist";
import Sessions from "./pages/Sessions";
import Profile from "./pages/Profile";
import Messages from "./pages/Messages";

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
      <Routes>
  {/* Public */}
  <Route path="/" element={<LandingPage />} />
  <Route path="/australia" element={<AustraliaPage />} />
  <Route path="/uk" element={<UKPage />} />
  <Route path="/ireland" element={<IrelandPage />} />
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />

  {/* Dashboard (layout-based routing) */}
  <Route path="/dashboard" element={<DashboardLayout />}>
    <Route index element={<DashboardHome />} />
    <Route path="universities" element={<Universities />} />
     <Route path="documentchecklist" element={<DocumentChecklist />} />
     <Route path="sessions" element={<Sessions />} />
    <Route path="profile" element={<Profile />} />
    <Route path="messages" element={<Messages />} />
  </Route>
</Routes>
    </Router>
  );
}
