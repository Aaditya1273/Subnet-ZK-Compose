// FarmOracle API Configuration
// Africa's Autonomous AI Farming Oracle on the Blockchain
const API_CONFIG = {
  // Get the current API URL based on environment
  getApiUrl: () => {
    // Use backend API URL from environment variable or default to localhost:8000
    if (typeof window !== 'undefined') {
      return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    }
    // For server-side rendering
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  }
};

// Export the API URL
export const API_URL = API_CONFIG.getApiUrl();

// Export individual endpoints - Now using Next.js API routes
export const ENDPOINTS = {
  // Health check endpoints
  HEALTH_CHECK: `${API_URL}/api/health`,
  
  // AI Oracle endpoints
  AI_ORACLE_STATUS: `${API_URL}/api/ai/oracle/status`,
  AI_DISEASE_ORACLE: `${API_URL}/api/ai/oracle/disease`,
  AI_MARKET_ORACLE: `${API_URL}/api/ai/oracle/market`,
  AI_SOIL_ORACLE: `${API_URL}/api/ai/oracle/soil`,
  AI_WEATHER_ORACLE: `${API_URL}/api/ai/oracle/weather`,
  AI_UNIFIED_INSIGHTS: `${API_URL}/api/ai/oracle/insights`,
  
  // Validation endpoints
  VALIDATE_PLANT_IMAGE: `${API_URL}/api/ai/validate/plant-image`,
  
  // Legacy endpoints (for backward compatibility)
  PREDICT_DISEASE: `${API_URL}/api/ai/oracle/disease`,
  PREDICT_SOIL: `${API_URL}/api/ai/oracle/soil`,
  MARKET_PREDICTIONS: `${API_URL}/api/ai/oracle/market`,
  WEATHER_FORECAST: `${API_URL}/api/ai/oracle/weather`,
  DETAILED_HEALTH: `${API_URL}/api/health`
};

// FarmOracle branding
export const FARMORACLE_CONFIG = {
  name: "FarmOracle",
  tagline: "Africa's Autonomous AI Farming Oracle on the Blockchain",
  hackathon: "Africa Blockchain Festival 2025",
  version: "1.0.0"
};

export default API_CONFIG;
