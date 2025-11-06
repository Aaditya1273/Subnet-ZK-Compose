"""
Vercel Serverless Function for FarmOracle Backend
Optimized for fast execution with Gemini AI fallback
"""
import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import google.generativeai as genai
from PIL import Image
import io
from dotenv import load_dotenv

load_dotenv()

# Initialize FastAPI
app = FastAPI(title="FarmOracle API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

@app.get("/")
async def root():
    return {"message": "FarmOracle API - Powered by Gemini AI", "status": "active"}

@app.post("/api/ai/oracle/disease")
async def detect_disease(file: UploadFile = File(...)):
    """Disease detection using Gemini AI"""
    try:
        # Read image
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        
        # Use Gemini for detection (fast and reliable)
        model = genai.GenerativeModel('gemini-2.0-flash-exp')
        
        prompt = """Analyze this plant image and provide disease detection:
        
        Return ONLY a JSON object with this exact structure:
        {
            "disease": "disease name or 'Healthy'",
            "confidence": 0.95,
            "severity": "low/medium/high",
            "treatment": "treatment recommendation",
            "prevention": "prevention tips"
        }"""
        
        response = model.generate_content([prompt, image])
        
        # Parse response
        import json
        result = json.loads(response.text.strip().replace('```json', '').replace('```', ''))
        
        return JSONResponse(content={
            "success": True,
            "prediction": result["disease"],
            "confidence": result["confidence"],
            "severity": result.get("severity", "medium"),
            "treatment": result.get("treatment", "Consult agricultural expert"),
            "prevention": result.get("prevention", "Regular monitoring recommended"),
            "model_used": "Gemini 2.0 Flash"
        })
        
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": str(e)}
        )

@app.post("/api/ai/oracle/soil")
async def analyze_soil(file: UploadFile = File(...)):
    """Soil analysis using Gemini AI"""
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        
        model = genai.GenerativeModel('gemini-2.0-flash-exp')
        
        prompt = """Analyze this soil image and provide detailed analysis:
        
        Return ONLY a JSON object:
        {
            "soil_type": "type",
            "ph_level": 6.5,
            "texture": "loamy/sandy/clay",
            "water_retention": "high/medium/low",
            "organic_matter": "high/medium/low",
            "recommended_crops": ["crop1", "crop2", "crop3"],
            "fertilizer_needs": "recommendation"
        }"""
        
        response = model.generate_content([prompt, image])
        
        import json
        result = json.loads(response.text.strip().replace('```json', '').replace('```', ''))
        
        return JSONResponse(content={
            "success": True,
            "soil_type": result["soil_type"],
            "ph_level": result["ph_level"],
            "texture": result["texture"],
            "water_retention": result["water_retention"],
            "organic_matter": result.get("organic_matter", "medium"),
            "recommended_crops": result.get("recommended_crops", []),
            "fertilizer_needs": result.get("fertilizer_needs", "Standard NPK"),
            "model_used": "Gemini 2.0 Flash"
        })
        
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": str(e)}
        )

@app.get("/api/ai/oracle/weather")
async def get_weather(location: str = "Nairobi"):
    """Weather forecast using WeatherAPI"""
    try:
        import requests
        
        WEATHER_API_KEY = os.getenv("WEATHER_API_KEY", "3dd41f0b214e431584985419250611")
        url = f"http://api.weatherapi.com/v1/forecast.json?key={WEATHER_API_KEY}&q={location}&days=7"
        
        response = requests.get(url, timeout=5)
        data = response.json()
        
        return JSONResponse(content={
            "success": True,
            "location": data["location"]["name"],
            "current": data["current"],
            "forecast": data["forecast"]["forecastday"]
        })
        
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": str(e)}
        )

@app.get("/api/ai/oracle/market")
async def market_predictions():
    """Market price predictions"""
    try:
        # Simplified market data for demo
        crops = ["Maize", "Wheat", "Rice", "Tomato", "Onion"]
        predictions = []
        
        for crop in crops:
            predictions.append({
                "crop": crop,
                "current_price": 50 + (hash(crop) % 50),
                "predicted_price": 55 + (hash(crop) % 50),
                "trend": "up" if hash(crop) % 2 == 0 else "stable",
                "confidence": 0.85 + (hash(crop) % 10) / 100
            })
        
        return JSONResponse(content={
            "success": True,
            "predictions": predictions
        })
        
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": str(e)}
        )

# Vercel serverless handler
handler = app
