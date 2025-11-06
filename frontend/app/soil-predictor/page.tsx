'use client';

import React from 'react';
import Header from '../../src/pages/Header';
import SoilPredictor from '../../src/pages/SoilPredictor';

export default function SoilPredictorPage() {
  return (
    <div className="App">
      <div className="header-container">
        <Header />
      </div>
      <div className="content-container pt-20">
        <SoilPredictor />
      </div>
    </div>
  );
}