import React, { useState, useEffect } from 'react';
import { ENDPOINTS } from '../config/api';

const OracleInsights = () => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOracleInsights();
  }, []);

  const fetchOracleInsights = async () => {
    try {
      setLoading(true);
      const response = await fetch(ENDPOINTS.AI_UNIFIED_INSIGHTS);
      
      if (!response.ok) {
        throw new Error('Failed to fetch oracle insights');
      }
      
      const data = await response.json();
      setInsights(data);
      setError(null);
    } catch (err) {
      console.error('Oracle insights error:', err);
      setError(err.message);
      // Fallback data for demo purposes
      setInsights({
        oracle_type: "unified_insights",
        status: "demo",
        prediction: {
          overall_farm_health: "Good",
          priority_actions: [
            "Monitor tomato plants for early blight",
            "Optimal time for wheat planting",
            "Soil pH adjustment recommended"
          ],
          market_opportunities: [
            "Banana prices expected to rise 15% next month",
            "High demand for organic vegetables"
          ],
          weather_alerts: [
            "Moderate rainfall expected in 3 days"
          ]
        },
        confidence: 0.80,
        hackathon: "Africa Blockchain Festival 2025"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-green-50 to-yellow-50 p-6 rounded-xl shadow-lg">
        <div className="animate-pulse">
          <div className="h-6 bg-green-200 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-green-100 rounded"></div>
            <div className="h-4 bg-green-100 rounded w-3/4"></div>
            <div className="h-4 bg-green-100 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !insights) {
    return (
      <div className="bg-red-50 border border-red-200 p-6 rounded-xl">
        <h3 className="text-red-800 font-semibold mb-2">Oracle Insights Unavailable</h3>
        <p className="text-red-600 text-sm">Unable to fetch insights: {error}</p>
        <button 
          onClick={fetchOracleInsights}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const { prediction } = insights || {};

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900 flex items-center">
          <div className="w-6 h-6 bg-black rounded-lg mr-3 flex items-center justify-center">
            <div className="w-3 h-3 bg-white rounded-sm"></div>
          </div>
          Oracle Insights
          {error && (
            <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full border border-gray-200">
              Demo Mode
            </span>
          )}
        </h3>
        <div className="text-sm text-gray-700 font-medium">
          Farm Health: {prediction?.overall_farm_health || 'Unknown'}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {/* Priority Actions */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Priority Actions
          </h4>
          <ul className="space-y-1">
            {prediction?.priority_actions?.map((action, index) => (
              <li key={index} className="text-sm text-gray-700 flex items-start">
                <span className="text-green-500 mr-2">•</span>
                {action}
              </li>
            )) || (
              <li className="text-sm text-gray-500">No actions needed</li>
            )}
          </ul>
        </div>

        {/* Market Opportunities */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
            Market Opportunities
          </h4>
          <ul className="space-y-1">
            {prediction?.market_opportunities?.map((opportunity, index) => (
              <li key={index} className="text-sm text-gray-700 flex items-start">
                <span className="text-yellow-500 mr-2">•</span>
                {opportunity}
              </li>
            )) || (
              <li className="text-sm text-gray-500">No opportunities detected</li>
            )}
          </ul>
        </div>

        {/* Weather Alerts */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
            </svg>
            Weather Alerts
          </h4>
          <ul className="space-y-1">
            {prediction?.weather_alerts?.length > 0 ? (
              prediction.weather_alerts.map((alert, index) => (
                <li key={index} className="text-sm text-gray-700 flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  {alert}
                </li>
              ))
            ) : (
              <li className="text-sm text-green-600 flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                No weather alerts
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* Confidence and Hackathon Badge */}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Confidence: {Math.round((insights?.confidence || 0.8) * 100)}%
        </div>
        <div className="text-xs text-gray-700 bg-gray-100 px-2 py-1 rounded-full flex items-center border border-gray-200">
          <div className="w-2 h-2 bg-black rounded-full mr-1"></div>
          {insights?.hackathon || 'Africa Blockchain Festival 2025'}
        </div>
      </div>

      {/* Refresh Button */}
      <button
        onClick={fetchOracleInsights}
        className="mt-3 w-full py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium flex items-center justify-center"
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Refresh Insights
      </button>
    </div>
  );
};

export default OracleInsights;