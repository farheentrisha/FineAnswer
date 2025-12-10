import React from "react";
import "./CountrySlider.css";
import ukImg from "../images/uk.jpg";
import irelandImg from "../images/ireland.jpg";
import ausImg from "../images/aus.jpg";



import { useNavigate } from "react-router-dom";

const CountrySlider = () => {
  const navigate = useNavigate();

const countries = [
  {
    name: "United Kingdom",
    desc: "We support leading organizations across the UK with consulting, training, and business solutions.",
    img: ukImg,
    link: "/country/uk",
  },
  {
    name: "Ireland",
    desc: "Providing strategic support and digital transformation solutions across Ireland.",
    img: irelandImg,
    link: "/country/ireland",
  },
  {
    name: "Australia",
    desc: "Helping Australian businesses grow with modern consulting and innovative services.",
    img: ausImg,
    link: "/country/australia",
  },
];

  return (
    <section className="countries-section">
      <h2>Countries We Are Operating In</h2>

      <div className="countries-grid">
        {countries.map((c, i) => (
          <div className="country-card" key={i}>
            <img src={c.img} alt={c.name} />
            <div className="card-content">
              <h3>{c.name}</h3>
              <p>{c.desc}</p>
              <button onClick={() => navigate(c.link)}>
                Read More <span>+</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CountrySlider;
