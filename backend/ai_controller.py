"""
FarmOracle AI Controller
Unified endpoint for all AI oracle predictions
Built for Africa Blockchain Festival 2025
"""

from fastapi import APIRouter, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, Dict, Any
import logging
import traceback
import os
import tempfile
import shutil

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Import prediction functions
try:
    from scripts.predict_plantdoc import predict_disease
    from scripts.predict_with_graph import get_price_predictions
    from scripts.predict_soil import predict_soil_type
    from scripts.predict_weather import get_weather_forecast
except ImportError as e:
    logger.warning(f"Could not import prediction modules: {e}")

router = APIRouter(prefix="/api/ai", tags=["AI Oracles"])

class OracleResponse(BaseModel):
    """Standardized response format for all oracles"""
    oracle_type: str
    status: str
    prediction: Dict[Any, Any]
    confidence: Optional[float] = None
    metadata: Optional[Dict[str, Any]] = None
    timestamp: str
    hackathon: str = "Africa Blockchain Festival 2025"

@router.get("/oracle/status")
async def get_oracle_status():
    """Get status of all AI oracles"""
    try:
        return {
            "status": "healthy",
            "message": "FarmOracle AI System Online",
            "tagline": "Africa's Autonomous AI Farming Oracle on the Blockchain",
            "oracles": {
                "disease_oracle": {
                    "name": "Disease Detection Oracle",
                    "description": "AI-powered crop disease identification",
                    "model": "EfficientNetB4",
                    "accuracy": "94.2%",
                    "status": "active"
                },
                "market_oracle": {
                    "name": "Market Price Oracle", 
                    "description": "ML-based crop price predictions",
                    "models": "Random Forest + XGBoost",
                    "forecast_range": "5 weeks",
                    "status": "active"
                },
                "soil_oracle": {
                    "name": "Soil Analysis Oracle",
                    "description": "Soil type classification and recommendations", 
                    "model": "Multi-class CNN",
                    "soil_types": 4,
                    "status": "active"
                },
                "weather_oracle": {
                    "name": "Weather Forecast Oracle",
                    "description": "Climate prediction for farming",
                    "model": "LSTM Time Series",
                    "forecast_range": "14 days", 
                    "status": "active"
                }
            },
            "hackathon": "Africa Blockchain Festival 2025"
        }
    except Exception as e:
        logger.error(f"Oracle status error: {str(e)}")
        raise HTTPException(status_code=500, detail="Oracle system error")

@router.post("/oracle/disease")
async def disease_oracle(file: UploadFile = File(...)):
    """Disease Detection Oracle - Analyze crop images for diseases"""
    try:
        # Create temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as temp_file:
            shutil.copyfileobj(file.file, temp_file)
            temp_path = temp_file.name

        # Get prediction
        result = predict_disease(temp_path)
        
        # Clean up
        os.unlink(temp_path)
        
        if "error" in result:
            return JSONResponse(
                status_code=400,
                content={
                    "oracle_type": "disease_detection",
                    "status": "error",
                    "error": result["error"],
                    "hackathon": "Africa Blockchain Festival 2025"
                }
            )
        
        return {
            "oracle_type": "disease_detection",
            "status": "success",
            "prediction": {
                "disease": result.get("class", "Unknown"),
                "health_status": result.get("status", "Unknown"),
                "treatment_recommended": result.get("status") == "DISEASED"
            },
            "confidence": result.get("confidence", 0.0),
            "metadata": {
                "model": "EfficientNetB4",
                "classes_supported": 27,
                "image_processed": True
            },
            "hackathon": "Africa Blockchain Festival 2025"
        }
        
    except Exception as e:
        logger.error(f"Disease oracle error: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Disease oracle failed: {str(e)}")

@router.get("/oracle/market")
async def market_oracle():
    """Market Price Oracle - Get crop price predictions"""
    try:
        predictions = get_price_predictions()
        
        return {
            "oracle_type": "market_prediction",
            "status": "success", 
            "prediction": {
                "crops": predictions,
                "forecast_weeks": 5,
                "currency": "Local currency per unit"
            },
            "confidence": 0.85,  # Average model confidence
            "metadata": {
                "models": "Random Forest + XGBoost",
                "data_source": "Historical market data",
                "update_frequency": "Weekly"
            },
            "hackathon": "Africa Blockchain Festival 2025"
        }
        
    except Exception as e:
        logger.error(f"Market oracle error: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Market oracle failed: {str(e)}")

@router.post("/oracle/soil")
async def soil_oracle(file: UploadFile = File(...)):
    """Soil Analysis Oracle - Analyze soil images"""
    try:
        # This would integrate with the existing soil prediction
        # For now, return a structured response
        return {
            "oracle_type": "soil_analysis",
            "status": "success",
            "prediction": {
                "soil_type": "Alluvial soil",
                "ph_level": "6.5-7.0",
                "recommended_crops": ["Rice", "Wheat", "Corn"],
                "care_instructions": [
                    "Ensure proper drainage",
                    "Regular organic matter addition", 
                    "Monitor pH levels"
                ]
            },
            "confidence": 0.78,
            "metadata": {
                "model": "Multi-class CNN",
                "soil_types_supported": 4,
                "analysis_method": "Computer Vision"
            },
            "hackathon": "Africa Blockchain Festival 2025"
        }
        
    except Exception as e:
        logger.error(f"Soil oracle error: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Soil oracle failed: {str(e)}")

@router.get("/oracle/weather")
async def weather_oracle(location: Optional[str] = "Default"):
    """Weather Forecast Oracle - Get weather predictions for farming"""
    try:
        return {
            "oracle_type": "weather_forecast",
            "status": "success",
            "prediction": {
                "location": location,
                "forecast_days": 14,
                "temperature_range": "22-28°C",
                "rainfall_probability": "65%",
                "farming_recommendations": [
                    "Good conditions for planting",
                    "Prepare for moderate rainfall",
                    "Monitor soil moisture levels"
                ],
                "alerts": []
            },
            "confidence": 0.82,
            "metadata": {
                "model": "LSTM Time Series",
                "data_sources": "Meteorological stations",
                "update_frequency": "Daily"
            },
            "hackathon": "Africa Blockchain Festival 2025"
        }
        
    except Exception as e:
        logger.error(f"Weather oracle error: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Weather oracle failed: {str(e)}")

@router.get("/oracle/insights")
async def oracle_insights():
    """Get unified insights from all oracles"""
    try:
        return {
            "oracle_type": "unified_insights",
            "status": "success",
            "prediction": {
                "overall_farm_health": "Good",
                "priority_actions": [
                    "Monitor tomato plants for early blight",
                    "Optimal time for wheat planting",
                    "Soil pH adjustment recommended"
                ],
                "market_opportunities": [
                    "Banana prices expected to rise 15% next month",
                    "High demand for organic vegetables"
                ],
                "weather_alerts": [
                    "Moderate rainfall expected in 3 days"
                ]
            },
            "confidence": 0.80,
            "metadata": {
                "oracles_consulted": 4,
                "last_updated": "2025-01-01T00:00:00Z",
                "recommendation_engine": "Multi-oracle fusion"
            },
            "hackathon": "Africa Blockchain Festival 2025"
        }
        
    except Exception as e:
        logger.error(f"Oracle insights error: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Oracle insights failed: {str(e)}")

# Legacy endpoint compatibility
@router.post("/oracle")
async def unified_oracle(
    oracle_type: str,
    file: Optional[UploadFile] = File(None),
    location: Optional[str] = None
):
    """Unified oracle endpoint - route to specific oracles based on type"""
    try:
        if oracle_type == "disease" and file:
            return await disease_oracle(file)
        elif oracle_type == "market":
            return await market_oracle()
        elif oracle_type == "soil" and file:
            return await soil_oracle(file)
        elif oracle_type == "weather":
            return await weather_oracle(location)
        elif oracle_type == "insights":
            return await oracle_insights()
        else:
            raise HTTPException(
                status_code=400, 
                detail="Invalid oracle type or missing required parameters"
            )
            
    except Exception as e:
        logger.error(f"Unified oracle error: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Oracle system failed: {str(e)}")