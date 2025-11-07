import React, { useState, useEffect } from 'react';
import { Cloud, Sun, Sunrise, Sunset, Moon, Wind, Droplets, ThermometerSun, Umbrella, CloudRain, CloudLightning, CloudSnow, MapPin } from 'lucide-react';
import axios from 'axios';
import { ENDPOINTS } from '../config/api';

const staticWeatherData = [
  {
    date: "2025-03-08",
    temperature: 17.5,
    details: {
      morning: "16.0°C",
      afternoon: "18.5°C",
      evening: "17.2°C",
      night: "15.8°C"
    },
    humidity: "65%",
    wind: "12 km/h",
    precipitation: "10%",
    description: "Partly cloudy with mild temperatures throughout the day.",
    condition: "partly-cloudy"
  },
  {
    date: "2025-03-09",
    temperature: 17.57,
    details: {
      morning: "16.2°C",
      afternoon: "18.6°C",
      evening: "17.1°C",
      night: "16.0°C"
    },
    humidity: "68%",
    wind: "10 km/h",
    precipitation: "15%",
    description: "Mostly sunny with scattered clouds in the afternoon.",
    condition: "mostly-sunny"
  },
  {
    date: "2025-03-10",
    temperature: 17.58,
    details: {
      morning: "16.4°C",
      afternoon: "18.4°C",
      evening: "17.3°C",
      night: "16.1°C"
    },
    humidity: "70%",
    wind: "8 km/h",
    precipitation: "20%",
    description: "Pleasant day with light breeze and increasing clouds by evening.",
    condition: "cloudy"
  },
  {
    date: "2025-03-11",
    temperature: 17.76,
    details: {
      morning: "16.6°C",
      afternoon: "18.8°C",
      evening: "17.5°C",
      night: "16.3°C"
    },
    humidity: "67%",
    wind: "14 km/h",
    precipitation: "25%",
    description: "Mild with gentle winds and possible light showers.",
    condition: "light-rain"
  },
  {
    date: "2025-03-12",
    temperature: 17.97,
    details: {
      morning: "17.0°C",
      afternoon: "19.0°C",
      evening: "17.8°C",
      night: "16.7°C"
    },
    humidity: "65%",
    wind: "11 km/h",
    precipitation: "15%",
    description: "Pleasant temperatures with partly cloudy skies.",
    condition: "partly-cloudy"
  },
  {
    date: "2025-03-13",
    temperature: 18.5,
    details: {
      morning: "17.5°C",
      afternoon: "19.5°C",
      evening: "18.2°C",
      night: "17.0°C"
    },
    humidity: "62%",
    wind: "9 km/h",
    precipitation: "5%",
    description: "Warm and sunny throughout the day with clear evening.",
    condition: "sunny"
  },
  {
    date: "2025-03-14",
    temperature: 18.5,
    details: {
      morning: "17.6°C",
      afternoon: "19.4°C",
      evening: "18.1°C",
      night: "17.2°C"
    },
    humidity: "63%",
    wind: "10 km/h",
    precipitation: "10%",
    description: "Pleasant with gentle breezes and scattered clouds.",
    condition: "mostly-sunny"
  }
];

const WeatherForecast = () => {
  const [selectedDay, setSelectedDay] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [animateCloud, setAnimateCloud] = useState(false);
  const [weatherData, setWeatherData] = useState([]);
  const [location, setLocation] = useState("auto:ip");
  const [locationInput, setLocationInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [locationInfo, setLocationInfo] = useState(null);
  const [currentWeather, setCurrentWeather] = useState(null);
  const [animationFrame, setAnimationFrame] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [weatherDataState, setWeatherDataState] = useState([{
    date: new Date().toISOString().split('T')[0],
    temperature: 20,
    condition: 'sunny',
    conditionLabel: 'Clear Sky',
    humidity: '60%',
    wind_kph: 10,
    chance_of_rain: 0,
    details: { morning: '18°C', afternoon: '22°C', evening: '20°C', night: '17°C' }
  }]);

  const formatDate = (dateString) => {
    const options = { weekday: 'long', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Fetch real weather data
  const fetchWeather = async (loc) => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('Fetching weather from:', `${ENDPOINTS.WEATHER_FORECAST}?location=${encodeURIComponent(loc)}`);
      const response = await axios.get(`${ENDPOINTS.WEATHER_FORECAST}?location=${encodeURIComponent(loc)}`);
      console.log('Weather response:', response.data);
      
      if (response.data.status === 'success') {
        console.log('Weather forecast data:', response.data.forecast);
        setWeatherDataState(response.data.forecast);
        setLocationInfo(response.data.location);
        setCurrentWeather(response.data.current);
      } else {
        throw new Error('Invalid response status');
      }
    } catch (err) {
      console.error('Weather fetch error:', err);
      console.error('Error details:', err.response?.data || err.message);
      setError(`Failed to fetch weather data: ${err.response?.data?.detail || err.message}`);
      // Use static fallback data
      console.log('Using static fallback data');
      setWeatherDataState(staticWeatherData);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchWeather(location);
    
    const interval = setInterval(() => {
      setCurrentTime(new Date());
      setAnimateCloud(prev => !prev);
      setAnimationFrame(prev => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleLocationChange = () => {
    if (locationInput.trim()) {
      setLocation(locationInput);
      fetchWeather(locationInput);
    }
  };

  const today = (weatherDataState && weatherDataState[0]) || {
    date: new Date().toISOString().split('T')[0],
    temperature: 20,
    condition: 'sunny',
    conditionLabel: 'Clear Sky',
    humidity: '60%',
    wind: '10 km/h',
    precipitation: '0%',
    details: { morning: '18°C', afternoon: '22°C', evening: '20°C', night: '17°C' }
  }; // Today is the first item (index 0) with fallback 

  const getWeatherIcon = (condition, size = 24, animate = false) => {
    const props = { 
      size: size, 
      className: animate 
        ? `transition-all duration-700 ${animationFrame % 2 === 0 ? 'scale-105' : 'scale-100'} ${animationFrame === 3 ? 'rotate-6' : animationFrame === 1 ? 'rotate-354' : 'rotate-0'}`
        : '' 
    };
    
    switch(condition) {
      case 'sunny':
        return <Sun color="#f7c35f" {...props} />;
      case 'mostly-sunny':
        return (
          <div className="relative">
            <Sun color="#f7c35f" {...props} />
            <Cloud 
              color="#e5e7eb" 
              size={size * 0.65} 
              className={`absolute bottom-0 right-0 opacity-60 ${animate ? `transition-all duration-500 ${animateCloud ? 'translate-x-1' : 'translate-x-0'}` : ''}`} 
            />
          </div>
        );
      case 'partly-cloudy':
        return (
          <div className="relative">
            <Sun color="#f7c35f" {...props} className="opacity-90" />
            <Cloud 
              color="#9ca3af" 
              size={size * 0.8} 
              className={`absolute -bottom-1 -right-1 ${animate ? `transition-all duration-500 ${animateCloud ? 'translate-x-1' : 'translate-x-0'}` : ''}`} 
            />
          </div>
        );
      case 'cloudy':
        return <Cloud color="#9ca3af" {...props} />;
      case 'light-rain':
        return <CloudRain color="#6b7280" {...props} />;
      case 'rainy':
        return <Umbrella color="#6b7280" {...props} />;
      case 'stormy':
        return <CloudLightning color="#6b7280" {...props} />;
      case 'snowy':
        return <CloudSnow color="#e5e7eb" {...props} />;
      default:
        return <Cloud color="#9ca3af" {...props} />;
    }
  };

  return (
    <div className="min-h-screen font-sans bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="fixed inset-0 overflow-hidden -z-10">
        <div className={`absolute top-10 left-10 opacity-5 transition-all duration-3000 ease-in-out ${animateCloud ? 'translate-x-10' : 'translate-x-0'}`}>
          <Cloud size={200} color="#334b35" />
        </div>
        <div className={`absolute bottom-20 right-20 opacity-5 transition-all duration-3000 ease-in-out delay-1000 ${animateCloud ? 'translate-x-10' : 'translate-x-0'}`}>
          <Cloud size={180} color="#334b35" />
        </div>
        <div className={`absolute top-1/3 right-1/3 opacity-5 transition-all duration-3000 ease-in-out delay-500 ${animateCloud ? 'translate-y-10' : 'translate-y-0'}`}>
          <Cloud size={150} color="#334b35" />
        </div>
        <div className={`absolute top-1/2 left-1/3 opacity-5 transition-all duration-3000 ease-in-out delay-1500 ${animateCloud ? 'translate-y-8' : 'translate-y-0'}`}>
          <Sun size={120} color="#f7c35f" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-8 px-6 lg:px-8">
        <div className="bg-white rounded-lg p-4 text-gray-900 flex justify-between items-center shadow-lg border-2 border-gray-200 relative overflow-hidden mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-100 to-transparent -translate-x-full animate-shimmer"></div>
          <h1 className="text-3xl font-bold flex items-center">
            <span className="text-gray-900 mr-2">Weather</span> Forecast
            {getWeatherIcon('mostly-sunny', 36, true)}
          </h1>
          <div className="text-gray-900">
            <p className="text-lg font-medium">
              {mounted ? currentTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'}
            </p>
            <p className="text-xs">Last updated: Just now</p>
          </div>
        </div>

      
        {isLoading ? (
          <div className="bg-white shadow-lg p-12 mb-6 rounded-lg text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-smart-green mx-auto mb-4"></div>
            <p className="text-gray-600">Loading weather data...</p>
          </div>
        ) : null}

        <div className="bg-white shadow-lg p-6 mb-6 rounded-lg relative overflow-hidden transform transition-all duration-300 hover:scale-101 hover:shadow-xl">
          
          <div className="absolute inset-0 bg-gradient-to-br from-smart-yellow/5 to-smart-green/5 opacity-50"></div>
          
          <div className={`absolute top-2 right-2 opacity-10 transition-all duration-2000 ${animateCloud ? 'translate-x-4' : 'translate-x-0'}`}>
            <Cloud size={100} color="#334b35" />
          </div>
          <div className={`absolute bottom-2 left-10 opacity-10 transition-all duration-2000 delay-500 ${animateCloud ? 'translate-x-4' : 'translate-x-0'}`}>
            <Cloud size={80} color="#334b35" />
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center md:items-start relative z-10">
            <div className="mb-4 md:mb-0">
              <div className="inline-flex items-center px-3 py-1 mb-3 rounded-full bg-smart-green text-white text-sm animate-bounce-slow">
                <span className="mr-1">●</span> {locationInfo ? `${locationInfo.name}, ${locationInfo.country}` : 'Live Weather'}
              </div>
              <h2 className="text-xl font-bold text-gray-800">Today - {formatDate(today.date)}</h2>
              <div className="flex items-center mt-2">
                <div className="mr-4">
                  {getWeatherIcon(today.condition, 48, true)}
                </div>
                <div>
                  <span className="text-4xl font-bold text-smart-green">{today.temperature.toFixed(1)}°C</span>
                  <div className="flex flex-col text-sm text-gray-600 mt-2 space-y-1">
                    <div className="flex items-center">
                      <span className="font-semibold mr-2">Condition:</span>
                      <span className="capitalize">{today.conditionLabel || 'Clear Sky'}</span>
                    </div>
                    <div className="flex items-center">
                      <Sun size={14} className="mr-2 text-orange-500" />
                      <span>Feels like {(today.temperature + 0.5).toFixed(1)}°C</span>
                    </div>
                    <div className="flex items-center">
                      <Umbrella size={14} className="mr-2 text-gray-600" />
                      <span>UV Index: Moderate</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className={`text-gray-600 mt-4 max-w-md relative overflow-hidden bg-gray-50 p-3 rounded-lg border-l-4 border-smart-yellow ${animationFrame % 3 === 0 ? 'border-opacity-100' : 'border-opacity-70'}`}>
                <p>{today.description}</p>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="flex items-center p-2 rounded-lg bg-blue-50 bg-opacity-50 hover:bg-opacity-80 transition-all">
                  <Droplets className="text-blue-500 mr-2" size={18} />
                  <span className="text-sm">Humidity: {today.humidity}</span>
                </div>
                <div className="flex items-center p-2 rounded-lg bg-gray-50 bg-opacity-50 hover:bg-opacity-80 transition-all">
                  <Wind className="text-gray-500 mr-2" size={18} />
                  <span className="text-sm">Wind: {today.wind}</span>
                </div>
                <div className="flex items-center p-2 rounded-lg bg-blue-50 bg-opacity-30 hover:bg-opacity-80 transition-all">
                  <Umbrella className="text-gray-500 mr-2" size={18} />
                  <span className="text-sm">Precip: {today.precipitation}</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 p-4 rounded-lg border border-gray-100 shadow-md bg-gradient-to-br from-white to-gray-50">
              <div className="flex flex-col items-center p-3 rounded-lg transition-all duration-300 hover:bg-smart-yellow/10 hover:scale-105">
                <Sunrise className="text-smart-yellow mb-2" size={28} />
                <p className="text-xs text-gray-500">Morning</p>
                <p className="font-bold text-smart-green">{today.details.morning}</p>
              </div>
              <div className="flex flex-col items-center p-3 rounded-lg transition-all duration-300 hover:bg-smart-yellow/10 hover:scale-105">
                <Sun className="text-smart-yellow mb-2" size={28} />
                <p className="text-xs text-gray-500">Afternoon</p>
                <p className="font-bold text-smart-green">{today.details.afternoon}</p>
              </div>
              <div className="flex flex-col items-center p-3 rounded-lg transition-all duration-300 hover:bg-smart-yellow/10 hover:scale-105">
                <Sunset className="text-smart-yellow mb-2" size={28} />
                <p className="text-xs text-gray-500">Evening</p>
                <p className="font-bold text-smart-green">{today.details.evening}</p>
              </div>
              <div className="flex flex-col items-center p-3 rounded-lg transition-all duration-300 hover:bg-smart-yellow/10 hover:scale-105">
                <Moon className="text-smart-yellow mb-2" size={28} />
                <p className="text-xs text-gray-500">Night</p>
                <p className="font-bold text-smart-green">{today.details.night}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-lg overflow-hidden transform transition-all duration-300 hover:shadow-xl">
          <div className="bg-gradient-to-r from-gray-900 to-black p-4 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer"></div>
            <h2 className="font-bold text-white flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>7-Day Forecast</span>
            </h2>
          </div>
          
          <div className="overflow-x-auto px-6">
            <div className="flex py-6 gap-6">
              {(weatherDataState || []).map((day, index) => (
                <div 
                  key={index}
                  className={`min-w-[140px] border-2 rounded-lg cursor-pointer transition-all duration-300 ${
                    selectedDay === index 
                      ? 'border-black shadow-lg bg-gradient-to-b from-white to-gray-50 scale-105' 
                      : hoveredIndex === index 
                        ? 'border-gray-300 shadow-sm bg-gray-50/50' 
                        : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedDay(selectedDay === index ? null : index)}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <div className={`bg-gradient-to-r from-gray-800 to-gray-900 p-2 rounded-t-lg relative overflow-hidden ${
                    selectedDay === index ? 'from-black to-gray-800' : ''
                  }`}>
                    <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full ${
                      selectedDay === index || hoveredIndex === index ? 'animate-shimmer' : ''
                    }`}></div>
                    <p className="text-white text-center text-sm font-medium relative z-10">{formatDate(day.date).split(',')[0]}</p>
                  </div>
                  <div className="p-3 text-center">
                    <div className={`text-2xl font-bold mb-2 text-gray-900 transition-all duration-500 ${
                      selectedDay === index ? 'scale-110' : hoveredIndex === index ? 'scale-105' : ''
                    }`}>
                      {day.temperature.toFixed(1)}°C
                    </div>
                    <div className="flex justify-center mb-2">
                      {getWeatherIcon(day.condition, 32, selectedDay === index || hoveredIndex === index)}
                    </div>
                    <div className={`text-xs p-1 rounded transition-all duration-300 ${
                      selectedDay === index ? 'bg-gray-100 text-gray-900 font-medium' : 'text-gray-500'
                    }`}>
                      {day.details.morning.split('°')[0]}° / {day.details.afternoon.split('°')[0]}°
                    </div>
                    <div className={`mt-2 text-xs transition-all duration-300 overflow-hidden ${
                      selectedDay === index || hoveredIndex === index ? 'max-h-10 opacity-100' : 'max-h-0 opacity-0'
                    }`}>
                      <span className="text-gray-500">{day.precipitation} precip</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {selectedDay !== null && weatherDataState && weatherDataState[selectedDay] && (
            <div className="border-t border-gray-200 animate-fadeIn">
              <div className="bg-gradient-to-br from-white to-gray-50 p-5 relative overflow-hidden">
                <div className={`absolute top-0 right-0 w-32 h-32 opacity-5 transition-all duration-2000 ${animateCloud ? 'translate-x-4' : 'translate-x-0'}`}>
                  {getWeatherIcon(weatherDataState[selectedDay]?.condition || 'sunny', 128)}
                </div>
                
                <h3 className="font-bold text-smart-green text-xl mb-1">{formatDate(weatherDataState[selectedDay]?.date || new Date().toISOString())}</h3>
                <div className="flex items-center mb-4">
                  <div className="mr-2">
                    {getWeatherIcon(weatherDataState[selectedDay]?.condition || 'sunny', 24, true)}
                  </div>
                  <p className="text-gray-600">{weatherDataState[selectedDay]?.description || 'Loading...'}</p>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 transform transition-all duration-300 hover:scale-105 hover:bg-smart-yellow/5">
                    <div className="flex items-center mb-2">
                      <Sunrise className="text-smart-yellow mr-2" size={18} />
                      <p className="text-xs text-gray-500">Morning</p>
                    </div>
                    <p className="font-bold text-smart-green">{weatherDataState[selectedDay]?.details?.morning || 'N/A'}</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 transform transition-all duration-300 hover:scale-105 hover:bg-smart-yellow/5">
                    <div className="flex items-center mb-2">
                      <Sun className="text-smart-yellow mr-2" size={18} />
                      <p className="text-xs text-gray-500">Afternoon</p>
                    </div>
                    <p className="font-bold text-smart-green">{weatherDataState[selectedDay]?.details?.afternoon || 'N/A'}</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 transform transition-all duration-300 hover:scale-105 hover:bg-smart-yellow/5">
                    <div className="flex items-center mb-2">
                      <Sunset className="text-smart-yellow mr-2" size={18} />
                      <p className="text-xs text-gray-500">Evening</p>
                    </div>
                    <p className="font-bold text-smart-green">{weatherDataState[selectedDay]?.details?.evening || 'N/A'}</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 transform transition-all duration-300 hover:scale-105 hover:bg-smart-yellow/5">
                    <div className="flex items-center mb-2">
                      <Moon className="text-smart-yellow mr-2" size={18} />
                      <p className="text-xs text-gray-500">Night</p>
                    </div>
                    <p className="font-bold text-smart-green">{weatherDataState[selectedDay]?.details?.night || 'N/A'}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mt-5">
                  <div className="bg-blue-50 bg-opacity-40 p-3 rounded-lg flex items-center transform transition-all duration-300 hover:bg-blue-50">
                    <Droplets className="text-blue-500 mr-2" size={18} />
                    <div>
                      <p className="text-xs text-gray-500">Humidity</p>
                      <p className="font-medium text-gray-700">{weatherDataState[selectedDay]?.humidity || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="bg-green-50 bg-opacity-40 p-3 rounded-lg flex items-center transform transition-all duration-300 hover:bg-green-50">
                    <Wind className="text-green-600 mr-2" size={18} />
                    <div>
                      <p className="text-xs text-gray-500">Wind</p>
                      <p className="font-medium text-gray-700">{weatherDataState[selectedDay]?.wind_kph ? `${weatherDataState[selectedDay].wind_kph} km/h` : 'N/A'}</p>
                    </div>
                  </div>
                  <div className="bg-purple-50 bg-opacity-40 p-3 rounded-lg flex items-center transform transition-all duration-300 hover:bg-purple-50">
                    <Umbrella className="text-purple-500 mr-2" size={18} />
                    <div>
                      <p className="text-xs text-gray-500">Precipitation</p>
                      <p className="font-medium text-gray-700">{weatherDataState[selectedDay]?.chance_of_rain ? `${weatherDataState[selectedDay].chance_of_rain}%` : 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 p-3 bg-smart-green bg-opacity-5 rounded-lg border-l-2 border-smart-yellow">
                  <h4 className="text-sm font-medium text-smart-green mb-1">Weather Advisory</h4>
                  <p className="text-sm text-gray-600">
                    {(weatherDataState[selectedDay]?.chance_of_rain || 0) > 20 
                      ? "Light rain possible. Consider bringing an umbrella." 
                      : "No weather warnings. Enjoy your day!"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-6 bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-gray-900 to-black p-4 text-white">
            <h2 className="font-bold text-white">Weather Insights</h2>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 transform transition-all duration-300 hover:shadow-md hover:border-gray-400">
                <h3 className="text-gray-900 font-bold mb-2 flex items-center">
                  <ThermometerSun size={18} className="mr-2 text-orange-500" /> Temperature Trend
                </h3>
                <p className="text-sm text-gray-600">
                  Overall warming trend with temperatures rising from 17.5°C to 18.5°C over the week.
                </p>
                <div className="mt-2 h-6 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-orange-400 to-red-400 rounded-full" 
                    style={{width: '75%'}}
                  ></div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 transform transition-all duration-300 hover:shadow-md hover:border-gray-400">
                <h3 className="text-gray-900 font-bold mb-2 flex items-center">
                  <Umbrella size={18} className="mr-2 text-blue-500" /> Precipitation
                </h3>
                <p className="text-sm text-gray-600">
                  Low chance of precipitation through the week. Best chance of rain on Tuesday (25%).
                </p>
                <div className="mt-2 h-6 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-400 rounded-full" 
                    style={{width: '25%'}}
                  ></div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 transform transition-all duration-300 hover:shadow-md hover:border-gray-400">
                <h3 className="text-gray-900 font-bold mb-2 flex items-center">
                  <Wind size={18} className="mr-2 text-gray-600" /> Wind Conditions
                </h3>
                <p className="text-sm text-gray-600">
                  Gentle breeze throughout the week, ranging from 8-14 km/h. Good conditions for outdoor activities.
                </p>
                <div className="mt-2 h-6 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gray-400 rounded-full" 
                    style={{width: '35%'}}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 text-center text-gray-500 text-sm">
          <div className={`inline-block transform transition-all duration-1000 ${animateCloud ? 'rotate-1 scale-102' : 'rotate-0 scale-100'}`}>
            <p>All times local</p>
            <p className="mt-1 text-xs">Powered by WeatherWiz™</p>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-shimmer {
          animation: shimmer 3s infinite;
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s infinite;
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        .scale-101 {
          transform: scale(1.01);
        }
        .scale-102 {
          transform: scale(1.02);
        }
        .scale-105 {
          transform: scale(1.05);
        }
        .rotate-354 {
          transform: rotate(-6deg);
        }
      `}</style>
    </div>
  );
};

export default WeatherForecast;