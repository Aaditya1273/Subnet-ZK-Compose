'use client';

import React from 'react';
import Header from '../../src/pages/Header';
import MarketPrediction from '../../src/pages/MarketPrediction';

export default function MarketPredictionPage() {
  return (
    <div className="App">
      <div className="header-container">
        <Header />
      </div>
      <div className="content-container pt-20">
        <MarketPrediction />
      </div>
    </div>
  );
}