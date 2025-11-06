'use client';

import React from 'react';
import Header from '../../src/pages/Header';
import PlantDiseaseDetection from '../../src/pages/PlantDiseaseDetection';

export default function DiseaseDetectionPage() {
  return (
    <div className="App">
      <div className="header-container">
        <Header />
      </div>
      <div className="content-container pt-20">
        <PlantDiseaseDetection />
      </div>
    </div>
  );
}