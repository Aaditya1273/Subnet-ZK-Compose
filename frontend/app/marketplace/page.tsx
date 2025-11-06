'use client';

import React from 'react';
import Header from '../../src/pages/Header';
import Marketplace from '../../src/components/Marketplace';

export default function MarketplacePage() {
  return (
    <div className="App">
      <div className="header-container">
        <Header />
      </div>
      <div className="content-container pt-20">
        <Marketplace />
      </div>
    </div>
  );
}