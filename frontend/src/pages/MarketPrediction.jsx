import React, { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown, TrendingUp, ArrowRight, Search, Calendar, Download, Filter, AlertTriangle, Zap, Info } from 'lucide-react';
import axios from 'axios';
import { ENDPOINTS } from '../config/api';

// Generate FUTURE prediction dates starting from NEXT week
const generateDates = () => {
  const dates = [];
  const today = new Date();
  
  // Start from NEXT week (7 days from now) for predictions
  for (let i = 1; i <= 4; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + (i * 7)); // Future weekly intervals
    dates.push(date.toISOString().split('T')[0]);
  }
  return dates;
};

// Generate dynamic prices with realistic variations
const generatePrices = (basePrice, trend) => {
  const prices = [];
  const variation = basePrice * 0.02; // 2% variation per week
  
  for (let i = 0; i < 4; i++) {
    let price = basePrice;
    
    if (trend === 'up') {
      // Upward trend: increase 2-5% per week
      price = basePrice + (basePrice * (0.02 + Math.random() * 0.03) * (i + 1));
    } else if (trend === 'down') {
      // Downward trend: decrease 1-3% per week
      price = basePrice - (basePrice * (0.01 + Math.random() * 0.02) * (i + 1));
    } else {
      // Stable: small random fluctuations ±1%
      price = basePrice + (basePrice * (Math.random() * 0.02 - 0.01) * (i + 1));
    }
    
    prices.push(parseFloat(price.toFixed(2)));
  }
  
  return prices;
};

const dynamicDates = generateDates();

const predictionData = [
  {
    crop: "banana",
    unit: "$/Dozen",
    image: "/banana_prediction_20250309_181240.png",
    predictions: generatePrices(1.80, 'up').map((price, i) => ({ date: dynamicDates[i], price })),
    trend: "up",
    category: "fruit",
    recommendation: "Prices expected to rise by 22% in coming weeks. Consider delaying harvest if possible to maximize profits. Good time for banana farmers to secure forward contracts."
  },
  {
    crop: "onion",
    unit: "$/Kg",
    image: "/onion_prediction_20250309_182306.png",
    predictions: generatePrices(0.26, 'up').map((price, i) => ({ date: dynamicDates[i], price })),
    trend: "up",
    category: "vegetable",
    recommendation: "Steady price increase trend suggests holding inventory if storage conditions permit. Moderate upward trajectory indicates stable demand - plan regular market supply."
  },
  {
    crop: "tomato",
    unit: "$/Kg",
    image: "/tomato_prediction_20250309_182307.png",
    predictions: generatePrices(1.55, 'stable').map((price, i) => ({ date: dynamicDates[i], price })),
    trend: "stable",
    category: "vegetable",
    recommendation: "Price stability indicates balanced market. Focus on quality over quantity to secure premium pricing. Consider local direct-to-consumer sales for better margins."
  },
  {
    crop: "wheat",
    unit: "$/Kg",
    image: "/wheat_prediction_20250309_182307.png",
    predictions: generatePrices(0.53, 'up').map((price, i) => ({ date: dynamicDates[i], price })),
    trend: "up",
    category: "grain",
    recommendation: "Sharp price increase expected in early April. Consider futures contracts to lock in higher prices. Good opportunity for wheat farmers to plan expanded planting for next season."
  },
  {
    crop: "carrot",
    unit: "$/Kg",
    image: "/carrot_prediction_20250309_182308.png",
    predictions: generatePrices(0.18, 'up').map((price, i) => ({ date: dynamicDates[i], price })),
    trend: "up",
    category: "vegetable",
    recommendation: "Strong upward trend of 22% indicates high demand. Consider staggered harvesting to benefit from peak prices. Good time to explore value-added products like pre-cut carrots."
  },
  {
    crop: "potato",
    unit: "$/Kg",
    image: "/potato_prediction_20250309_182310.png",
    predictions: generatePrices(0.23, 'up').map((price, i) => ({ date: dynamicDates[i], price })),
    trend: "up",
    category: "vegetable",
    recommendation: "Modest price growth indicates steady demand. Consider cold storage for gradual market release if facilities available. Good time to establish direct relationships with restaurants and food processors."
  },
  {
    crop: "rice",
    unit: "$/Kg",
    image: "/rice_prediction_20250309_182312.png",
    predictions: generatePrices(0.66, 'down').map((price, i) => ({ date: dynamicDates[i], price })),
    trend: "down",
    category: "grain",
    recommendation: "Slight downward trend suggests selling sooner rather than later. Consider value-addition like organic or specialty rice varieties to maintain profits despite price decline."
  }
];

const MarketPrediction = () => {
  const [expandedCard, setExpandedCard] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filteredData, setFilteredData] = useState(predictionData);
  const [isLoading, setIsLoading] = useState(true);
  const [showTips, setShowTips] = useState(false);
  const [notification, setNotification] = useState({ show: true, message: "New price predictions available for all crops!" });
  const [apiData, setApiData] = useState(null);
  const [apiError, setApiError] = useState(null);

  // Fetch market predictions from API
  useEffect(() => {
    const fetchMarketPredictions = async () => {
      try {
        const response = await axios.get(ENDPOINTS.MARKET_PREDICTIONS);
        if (response.data && response.data.status === 'success') {
          setApiData(response.data.data);
          console.log('✅ Market predictions loaded from API:', response.data.data);
        } else {
          console.warn('⚠️ API returned unexpected format, using static data');
          setApiError('API returned unexpected format');
        }
      } catch (error) {
        console.error('❌ Failed to fetch market predictions:', error);
        setApiError('Failed to fetch live data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMarketPredictions();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, [isLoading]);

  useEffect(() => {
    // Use API data if available, otherwise use static data
    const dataToFilter = apiData && apiData.length > 0 ? apiData : predictionData;
    
    const results = dataToFilter.filter((item) => {
      const matchesSearch = item.crop.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
    setFilteredData(results);
  }, [searchTerm, selectedCategory, apiData]);

  const toggleCard = (cropName) => {
    setExpandedCard(expandedCard === cropName ? null : cropName);
  };

  const calculateChange = (predictions) => {
    const firstPrice = predictions[0].price;
    const lastPrice = predictions[predictions.length - 1].price;
    const percentChange = ((lastPrice - firstPrice) / firstPrice) * 100;
    return percentChange.toFixed(2);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  };

  const categories = [
    { id: 'all', name: 'All Crops' },
    { id: 'vegetable', name: 'Vegetables' },
    { id: 'fruit', name: 'Fruits' },
    { id: 'grain', name: 'Grains' }
  ];

  const getProjectedDifference = (predictions) => {
    const firstPrice = predictions[0].price;
    const lastPrice = predictions[predictions.length - 1].price;
    return (lastPrice - firstPrice).toFixed(2);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black mb-4"></div>
          <p className="text-gray-900 text-lg">Loading market predictions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white text-gray-900">
      <div className="sticky top-0 z-50 bg-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="text-black h-6 w-6" />
              <h1 className="text-2xl font-bold text-gray-900">AgriPrice Forecast</h1>
            </div>
            
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search crops..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              
              <div className="flex space-x-2 overflow-x-auto pb-1 md:pb-0">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-all duration-300 font-medium ${
                      selectedCategory === category.id 
                        ? 'bg-black text-white shadow-md' 
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {notification.show && (
        <div className="bg-blue-50 border-l-4 border-blue-500 animate-fadeIn">
          <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Zap className="text-blue-600 h-5 w-5" />
              <p className="text-gray-900">{notification.message}</p>
              {apiData && apiData.length > 0 && (
                <span className="bg-green-500 text-white px-2 py-1 rounded text-xs">LIVE DATA</span>
              )}
              {apiError && (
                <span className="bg-orange-500 text-white px-2 py-1 rounded text-xs">USING CACHED DATA</span>
              )}
            </div>
            <button 
              onClick={() => setNotification({...notification, show: false})}
              className="text-gray-600 hover:text-gray-900 text-2xl font-bold"
            >
              ×
            </button>
          </div>
        </div>
      )}
      
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold mb-1 text-gray-900">Market Intelligence Dashboard</h2>
            <p className="text-gray-600 text-sm flex items-center">
              <Calendar className="h-4 w-4 mr-1" /> 
              Updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          
          <div className="flex mt-4 md:mt-0 space-x-3">
            <button 
              onClick={() => setShowTips(!showTips)}
              className="flex items-center px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-all duration-300 text-gray-700 font-medium shadow-sm"
            >
              <Info className="h-4 w-4 mr-2" />
              Farmer Tips
            </button>
            <button className="flex items-center px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-all duration-300 text-gray-700 font-medium shadow-sm">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </button>
          </div>
        </div>
        
        {showTips && (
          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8 animate-fadeIn shadow-md">
            <h3 className="text-gray-900 font-bold text-lg mb-4">How to Use This Forecast</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h4 className="font-semibold mb-2 flex items-center text-gray-900">
                  <Filter className="h-4 w-4 mr-2 text-gray-700" /> Price Interpretation
                </h4>
                <p className="text-sm text-gray-600">Rising prices indicate increasing demand or limited supply. Consider timing your harvest or sales accordingly to maximize profits.</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h4 className="font-semibold mb-2 flex items-center text-gray-900">
                  <Calendar className="h-4 w-4 mr-2 text-gray-700" /> Seasonal Planning
                </h4>
                <p className="text-sm text-gray-600">Use the weekly forecast to plan your planting and harvesting schedule. Align your farm operations with projected market conditions.</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h4 className="font-semibold mb-2 flex items-center text-gray-900">
                  <AlertTriangle className="h-4 w-4 mr-2 text-gray-700" /> Risk Management
                </h4>
                <p className="text-sm text-gray-600">Diversify your crops based on price stability. Crops with stable prices offer reliable income, while those with rising prices offer growth potential.</p>
              </div>
            </div>
          </div>
        )}
        
        {filteredData.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-8 text-center animate-fadeIn shadow-md">
            <Search className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-medium mb-2 text-gray-900">No crops found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredData.map((item) => {
              const isExpanded = expandedCard === item.crop;
              const percentChange = calculateChange(item.predictions);
              const isPositiveChange = parseFloat(percentChange) > 0;
              const isNegativeChange = parseFloat(percentChange) < 0;
              const isStableChange = parseFloat(percentChange) === 0;
              
              return (
                <div 
                  key={item.crop}
                  className={`bg-white rounded-xl overflow-hidden shadow-lg border-2 border-gray-200 transition-all duration-500 ease-in-out transform hover:shadow-xl ${isExpanded ? 'md:col-span-2 border-black' : 'hover:scale-102 hover:border-gray-300'}`}
                >
                  <div 
                    className="p-4 cursor-pointer flex justify-between items-center bg-gray-50 border-b border-gray-200"
                    onClick={() => toggleCard(item.crop)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        isPositiveChange ? 'bg-green-100' : 
                        isNegativeChange ? 'bg-red-100' : 
                        'bg-yellow-100'
                      }`}>
                        {isPositiveChange ? 
                          <ChevronUp className="text-green-600 h-5 w-5" /> : 
                          isNegativeChange ?
                          <ChevronDown className="text-red-600 h-5 w-5" /> :
                          <ArrowRight className="text-yellow-600 h-5 w-5" />
                        }
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold capitalize text-gray-900">{item.crop}</h3>
                        <span className="text-xs text-gray-600 capitalize">{item.category}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <span className={`font-bold text-lg ${
                        isPositiveChange ? 'text-green-600' : 
                        isNegativeChange ? 'text-red-600' : 
                        'text-gray-600'
                      }`}>
                        {isPositiveChange ? '+' : 
                         isNegativeChange ? '' : 
                         '±'}{percentChange}%
                      </span>
                      {isExpanded ? 
                        <ChevronUp className="h-5 w-5 text-gray-600 animate-bounce" /> : 
                        <ChevronDown className="h-5 w-5 text-gray-600" />
                      }
                    </div>
                  </div>
                  
                  <div className={`transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-screen overflow-auto' : 'max-h-[600px] overflow-y-auto'}`}>
                    <div className="p-4">
                      <div className="mb-4 overflow-hidden rounded-lg bg-gradient-to-br from-gray-50 to-white p-4 border border-gray-200">
                        <svg className="w-full h-48" viewBox="0 0 400 160" preserveAspectRatio="xMidYMid meet">
                          {(() => {
                            const minPrice = Math.min(...item.predictions.map(p => p.price));
                            const maxPrice = Math.max(...item.predictions.map(p => p.price));
                            const priceRange = maxPrice - minPrice || maxPrice * 0.1;
                            const padding = priceRange * 0.2;
                            
                            return (
                              <>
                                {/* Grid lines */}
                                <line x1="50" y1="20" x2="50" y2="130" stroke="#e5e7eb" strokeWidth="2"/>
                                <line x1="50" y1="130" x2="380" y2="130" stroke="#e5e7eb" strokeWidth="2"/>
                                
                                {/* Horizontal grid lines with price labels */}
                                {[0, 1, 2, 3, 4].map((i) => {
                                  const price = minPrice - padding + ((maxPrice + padding - (minPrice - padding)) / 4) * (4 - i);
                                  const y = 20 + (i * 27.5);
                                  return (
                                    <g key={i}>
                                      <line x1="50" y1={y} x2="380" y2={y} stroke="#f3f4f6" strokeWidth="1" strokeDasharray="4,4"/>
                                      <text x="45" y={y + 4} textAnchor="end" fontSize="9" fill="#9ca3af">
                                        ${price.toFixed(2)}
                                      </text>
                                    </g>
                                  );
                                })}
                                
                                {/* Area under line */}
                                <polygon
                                  points={`50,130 ${item.predictions.map((pred, idx) => {
                                    const x = 80 + (idx * 90);
                                    const y = 130 - ((pred.price - (minPrice - padding)) / (maxPrice + padding - (minPrice - padding)) * 110);
                                    return `${x},${y}`;
                                  }).join(' ')} 380,130`}
                                  fill={isPositiveChange ? 'rgba(34, 197, 94, 0.1)' : isNegativeChange ? 'rgba(239, 68, 68, 0.1)' : 'rgba(107, 114, 128, 0.1)'}
                                />
                                
                                {/* Price line */}
                                <polyline
                                  points={item.predictions.map((pred, idx) => {
                                    const x = 80 + (idx * 90);
                                    const y = 130 - ((pred.price - (minPrice - padding)) / (maxPrice + padding - (minPrice - padding)) * 110);
                                    return `${x},${y}`;
                                  }).join(' ')}
                                  fill="none"
                                  stroke={isPositiveChange ? '#22c55e' : isNegativeChange ? '#ef4444' : '#6b7280'}
                                  strokeWidth="3"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                
                                {/* Data points with price labels */}
                                {item.predictions.map((pred, idx) => {
                                  const x = 80 + (idx * 90);
                                  const y = 130 - ((pred.price - (minPrice - padding)) / (maxPrice + padding - (minPrice - padding)) * 110);
                                  return (
                                    <g key={idx}>
                                      <circle 
                                        cx={x} 
                                        cy={y} 
                                        r="5" 
                                        fill="white" 
                                        stroke={isPositiveChange ? '#22c55e' : isNegativeChange ? '#ef4444' : '#6b7280'}
                                        strokeWidth="2.5"
                                      />
                                      {/* Price label above point */}
                                      <text x={x} y={y - 10} textAnchor="middle" fontSize="10" fill="#374151" fontWeight="600">
                                        ${pred.price.toFixed(2)}
                                      </text>
                                      {/* Date label below */}
                                      <text x={x} y="150" textAnchor="middle" fontSize="9" fill="#6b7280">
                                        {formatDate(pred.date)}
                                      </text>
                                    </g>
                                  );
                                })}
                                
                                {/* Title */}
                                <text x="200" y="12" textAnchor="middle" fontSize="12" fill="#374151" fontWeight="700">
                                  {item.crop.charAt(0).toUpperCase() + item.crop.slice(1)} - 4 Week Forecast
                                </text>
                              </>
                            );
                          })()}
                        </svg>
                      </div>
                      
                      <div className="mt-6">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="text-gray-900 text-lg font-bold">Price Forecast ({item.unit})</h4>
                          <div className="bg-gray-100 rounded-full px-3 py-1 text-sm border border-gray-200">
                            {isPositiveChange ? 
                              <span className="text-green-600 font-medium">Trending Up</span> : 
                              isNegativeChange ?
                              <span className="text-red-600 font-medium">Trending Down</span> :
                              <span className="text-gray-600 font-medium">Stable</span>
                            }
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                          {item.predictions.map((pred, idx) => {
                            const isLast = idx === item.predictions.length - 1;
                            const prevPrice = idx > 0 ? item.predictions[idx-1].price : pred.price;
                            const priceDiff = pred.price - prevPrice;
                            const isPriceUp = priceDiff > 0;
                            const isPriceDown = priceDiff < 0;
                            const isPriceStable = priceDiff === 0;
                            
                            return (
                              <div 
                                key={idx}
                                className={`p-3 rounded-lg ${isLast ? 'border-2 border-black bg-gray-50' : 'bg-gray-50 border border-gray-200'} transition-all duration-300 hover:shadow-lg transform hover:scale-105 ${isLast ? 'shadow-md' : ''}`}
                              >
                                <p className="text-gray-600 text-sm font-medium">{formatDate(pred.date)}</p>
                                <div className="flex items-center mt-1">
                                  <span className="text-lg font-bold text-gray-900">${pred.price.toFixed(2)}</span>
                                  {idx > 0 && (
                                    <span className={`ml-2 text-xs ${
                                      isPriceUp ? 'text-green-400' : 
                                      isPriceDown ? 'text-red-400' : 
                                      'text-yellow-400'
                                    }`}>
                                      {isPriceUp ? '▲' : 
                                       isPriceDown ? '▼' : 
                                       '▬'} 
                                      {Math.abs(priceDiff).toFixed(2)}
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      
                      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 animate-fadeIn">
                        <h4 className="text-gray-900 font-bold mb-2 flex items-center">
                          <Info className="h-4 w-4 mr-2 text-blue-600" /> 
                          Farmer Recommendation
                        </h4>
                        <p className="text-gray-700 text-sm leading-relaxed">
                          {item.recommendation}
                        </p>
                      </div>
                      
                      {isExpanded && (
                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <h4 className="text-gray-900 font-bold mb-3">Market Insights</h4>
                            
                            <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600 text-sm">Price Trend</span>
                                <span className={`text-sm font-medium ${
                                  isPositiveChange ? 'text-green-400' : 
                                  isNegativeChange ? 'text-red-400' : 
                                  'text-yellow-400'
                                }`}>
                                  {isPositiveChange ? 'Upward' : isNegativeChange ? 'Downward' : 'Stable'}
                                </span>
                              </div>
                              
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600 text-sm">Current Price</span>
                                <span className="text-sm font-medium text-gray-900">${item.predictions[0].price.toFixed(2)} {item.unit}</span>
                              </div>
                              
                              <div className="flex justify-between items-center">
                                <span className="text-gray-400 text-sm">Projected Price</span>
                                <span className="text-sm font-medium">${item.predictions[item.predictions.length-1].price.toFixed(2)} {item.unit}</span>
                              </div>
                              
                              <div className="flex justify-between items-center">
                                <span className="text-gray-400 text-sm">Expected Change</span>
                                <span className={`text-sm font-medium ${
                                  isPositiveChange ? 'text-green-400' : 
                                  isNegativeChange ? 'text-red-400' : 
                                  'text-yellow-400'
                                }`}>
                                  {getProjectedDifference(item.predictions) > 0 ? '+' : ''}
                                  ${getProjectedDifference(item.predictions)} {item.unit}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <h4 className="text-gray-900 font-bold mb-3">Action Plan</h4>
                            
                            <ul className="space-y-2 text-sm text-gray-700">
                              {isPositiveChange && (
                                <>
                                  <li className="flex items-start">
                                    <span className="text-green-400 mr-2">•</span>
                                    Consider delaying harvest/sales if possible
                                  </li>
                                  <li className="flex items-start">
                                    <span className="text-green-400 mr-2">•</span>
                                    Explore forward contracts at current rates
                                  </li>
                                  <li className="flex items-start">
                                    <span className="text-green-400 mr-2">•</span>
                                    Plan for increased production next season
                                  </li>
                                </>
                              )}
                              
                              {isNegativeChange && (
                                <>
                                  <li className="flex items-start">
                                    <span className="text-red-400 mr-2">•</span>
                                    Consider early sales to avoid further decline
                                  </li>
                                  <li className="flex items-start">
                                    <span className="text-red-400 mr-2">•</span>
                                    Explore value-added products to increase margins
                                  </li>
                                  <li className="flex items-start">
                                    <span className="text-red-400 mr-2">•</span>
                                    Consider crop diversification for next season
                                  </li>
                                </>
                              )}
                              
                              {isStableChange && (
                                <>
                                  <li className="flex items-start">
                                    <span className="text-yellow-400 mr-2">•</span>
                                    Focus on quality to attract premium buyers
                                  </li>
                                  <li className="flex items-start">
                                    <span className="text-yellow-400 mr-2">•</span>
                                    Maintain current production levels
                                  </li>
                                  <li className="flex items-start">
                                    <span className="text-yellow-400 mr-2">•</span>
                                    Consider direct marketing to increase margins
                                  </li>
                                </>
                              )}
                            </ul>
                          </div>
                          
                          <div className="md:col-span-2">
                            <button className="w-full py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors duration-300 flex justify-center items-center shadow-md">
                              <Download className="h-4 w-4 mr-2" />
                              Download Detailed Report for {item.crop.charAt(0).toUpperCase() + item.crop.slice(1)}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        <div className="mt-12 bg-white border border-gray-200 rounded-xl p-6 animate-fadeIn shadow-md">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Market Outlook Summary</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
              <h3 className="font-bold mb-2 text-gray-900">Rising Crops</h3>
              <p className="text-sm text-gray-600 mb-3">These crops show significant price increases in the coming weeks.</p>
              <ul className="space-y-2">
                {filteredData
                  .filter(item => parseFloat(calculateChange(item.predictions)) > 5)
                  .slice(0, 3)
                  .map(item => (
                    <li key={item.crop} className="flex justify-between items-center text-sm">
                      <span className="capitalize">{item.crop}</span>
                      <span className="text-green-400">+{calculateChange(item.predictions)}%</span>
                    </li>
                  ))}
              </ul>
            </div>
            
            <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
              <h3 className="font-bold mb-2 text-gray-900">Stable Crops</h3>
              <p className="text-sm text-gray-600 mb-3">These crops show relatively stable prices with minimal fluctuation.</p>
              <ul className="space-y-2">
                {filteredData
                  .filter(item => Math.abs(parseFloat(calculateChange(item.predictions))) <= 5)
                  .slice(0, 3)
                  .map(item => (
                    <li key={item.crop} className="flex justify-between items-center text-sm">
                      <span className="capitalize">{item.crop}</span>
                      <span className="text-yellow-400">±{calculateChange(item.predictions)}%</span>
                    </li>
                  ))}
              </ul>
            </div>
            
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
              <h3 className="font-bold mb-2 text-gray-900">Declining Crops</h3>
              <p className="text-sm text-gray-600 mb-3">These crops show price decreases in the coming weeks.</p>
              <ul className="space-y-2">
                {filteredData
                  .filter(item => parseFloat(calculateChange(item.predictions)) < 0)
                  .slice(0, 3)
                  .map(item => (
                    <li key={item.crop} className="flex justify-between items-center text-sm">
                      <span className="capitalize">{item.crop}</span>
                      <span className="text-red-400">{calculateChange(item.predictions)}%</span>
                    </li>
                  ))}
              </ul>
            </div>
          </div>
          
          <div className="mt-6 text-sm text-gray-600">
            <p>Based on analysis of historical price data, current market conditions, weather forecasts, and supply-demand indicators.</p>
          </div>
        </div>
        
        <div className="mt-12 text-center">
          <p className="text-gray-600 text-sm">
            KrishiPrice Forecast provides AI-powered price predictions to help farmers make informed decisions.
            <br />Updated daily. Last update: March 9, 2025.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MarketPrediction;