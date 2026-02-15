import React from 'react';
import './PartnerLogos.css';

// 1. Import your images from the assets folder
import ul from '../assets/Limerick.png';
import dbs from '../assets/DBS.png';
import gc from '../assets/griff.jpg';
import dkit from '../assets/dkit.png';
import galway from '../assets/galway.png';
import ucc from '../assets/ucc.png';

import setu from '../assets/setu logo.png';
import tus from '../assets/TUS.jpg';
import atu from '../assets/atulogo.jpg';
import dcuLogo from '../assets/dcu logo.png';
import tud from '../assets/TUD.png';
import ucd from '../assets/ucd.jpg';

const LogoRow = ({ logos, direction, speed = '30s' }) => {
  return (
    <div className="logo-row">
      {/* Container duplicated for seamless looping */}
      <div 
        className={`logo-track ${direction === 'left' ? 'animate-left' : 'animate-right'}`}
        style={{ animationDuration: speed }}
      >
        {logos.map((logo, index) => (
          <div className="logo-card" key={index}>
            <img src={logo.url} alt={logo.name} />
          </div>
        ))}
      </div>
      {/* Second copy for the infinite effect */}
      <div 
        className={`logo-track ${direction === 'left' ? 'animate-left' : 'animate-right'}`}
        style={{ animationDuration: speed }}
      >
        {logos.map((logo, index) => (
          <div className="logo-card" key={`dup-${index}`}>
            <img src={logo.url} alt={logo.name} />
          </div>
        ))}
      </div>
    </div>
  );
};

const PartnerLogos = () => {
  // 2. Use the imported variables in your arrays
  const row1 = [
    { name: 'UL', url: ul },
    { name: 'DBS', url: dbs },
    { name: 'Griffith College', url: gc },
    { name: 'DKIT', url: dkit },
    { name: 'Galway', url: galway },
    { name: 'UCC', url: ucc },
  ];

  const row2 = [
    { name: 'SETU', url: setu },
    { name: 'TUS', url: tus },
    { name: 'ATU', url: atu },
    { name: 'DCU', url: dcuLogo },
    { name: 'TUD', url: tud },
    { name: 'UCD', url: ucd },
  ];

   const row3 = [
    { name: 'UL', url: ul },
    { name: 'DBS', url: dbs },
    { name: 'Griffith College', url: gc },
    { name: 'DKIT', url: dkit },
    { name: 'Galway', url: galway },
    { name: 'UCC', url: ucc },
  ];

  

  return (
    <section className="partners-section">
        <div className="partners-caption">
  <h2 className="animated-caption">
    Our Partner Universities
  </h2>
</div>

      <div className="logos-container">
        {/* Row 1: Left to Right (CSS "left" animation moves content to the left) */}
        <LogoRow logos={row1} direction="left" speed="40s" />
        
        {/* Row 2: Right to Left */}
        <LogoRow logos={row2} direction="right" speed="35s" />
<LogoRow logos={row3} direction="left" speed="20s" />

        
      </div>
    </section>
  );
};

export default PartnerLogos;