'use client';

import React from 'react';
import Header from '../../src/pages/Header';
import WeatherForecast from '../../src/pages/WeatherForecast';

export default function WeatherPredictionPage() {
  return (
    <div className="App">
      <div className="header-container">
        <Header />
      </div>
      <div className="content-container pt-20">
        <WeatherForecast />
      </div>
    </div>
  );
}
