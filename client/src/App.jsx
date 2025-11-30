import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./LandingPage";
import AustraliaPage from "./AustraliaPage"; 
import UKPage from "./UKPage";
import Login from "./LoginPage";
import Register from "./RegisterPage";
import Navbar3 from "./components/navbar3"; // import navbar
import "./App.css";

export default function App() {
  return (
    <Router>
      {/* Navbar3 always visible */}
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
