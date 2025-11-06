'use client';

import React, { useEffect, useState } from 'react';
import Header from '../src/pages/Header';
import HeroSection from '../src/pages/HeroSection';
import FarmInfo from '../src/pages/OrganicFarmUI';
import Dashboard from '../src/pages/AgriDashboard';
import News from '../src/pages/AgriNewsSection';

export default function HomePage() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
    
    const checkVisibility = () => {
      const sections = document.querySelectorAll('.scroll-reveal');
      const windowHeight = window.innerHeight;
      
      sections.forEach(section => {
        const boundingRect = section.getBoundingClientRect();
        if (boundingRect.top < windowHeight * 0.85) {
          section.classList.add('visible');
        }
      });
    };
    
    setTimeout(checkVisibility, 100);
    
    let scrollTimeout: NodeJS.Timeout;
    const handleScroll = () => {
      if (!scrollTimeout) {
        scrollTimeout = setTimeout(() => {
          checkVisibility();
        }, 10);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeout) clearTimeout(scrollTimeout);
    };
  }, []);

  return (
    <div className={`App ${loaded ? 'app-loaded' : ''}`}>
      <div className="header-container">
        <Header />
      </div>
      
      <div className="content-container">
        <div className="scroll-reveal">
          <HeroSection />
        </div>
        <div className="scroll-reveal">
          <FarmInfo />
        </div>
        <div className="scroll-reveal">
          <Dashboard />
        </div>
        <div className="scroll-reveal">
          <News />
        </div>
      </div>
    </div>
  );
}