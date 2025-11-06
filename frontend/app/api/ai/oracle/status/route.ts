import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: "healthy",
    message: "FarmOracle AI System Online",
    tagline: "Africa's Autonomous AI Farming Oracle on the Blockchain",
    oracles: {
      disease_oracle: {
        name: "Disease Detection Oracle",
        description: "AI-powered crop disease identification",
        model: "EfficientNetB4",
        accuracy: "94.2%",
        status: "active"
      },
      market_oracle: {
        name: "Market Price Oracle", 
        description: "ML-based crop price predictions",
        models: "Random Forest + XGBoost",
        forecast_range: "5 weeks",
        status: "active"
      },
      soil_oracle: {
        name: "Soil Analysis Oracle",
        description: "Soil type classification and recommendations", 
        model: "Multi-class CNN",
        soil_types: 4,
        status: "active"
      },
      weather_oracle: {
        name: "Weather Forecast Oracle",
        description: "Climate prediction for farming",
        model: "LSTM Time Series",
        forecast_range: "14 days", 
        status: "active"
      }
    },
    hackathon: "Africa Blockchain Festival 2025"
  });
}