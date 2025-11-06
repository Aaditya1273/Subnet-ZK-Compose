from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
import shutil
import uuid
from PIL import Image
from fastapi.responses import JSONResponse
import io
import numpy as np
import json
import traceback
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global variables for lazy loading
soil_model = None
class_names = None
plantdoc_predict_func = None
price_predict_func = None

# LangChain Autonomous Agent imports
try:
    import sys
    sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'agents'))
    from autonomous_oracle import autonomous_agent
    from blockchain_listener import feedback_loop
    from agent_scheduler import agent_scheduler
    AGENTS_AVAILABLE = True
    logger.info("✅ LangChain Autonomous Agents loaded successfully")
except Exception as e:
    AGENTS_AVAILABLE = False
    logger.warning(f"⚠️ Autonomous agents not available: {e}")

# SMS Service imports
try:
    sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'services'))
    from sms_service import sms_service
    SMS_AVAILABLE = True
    logger.info("✅ SMS Alert Service loaded successfully")
except Exception as e:
    SMS_AVAILABLE = False
    logger.warning(f"⚠️ SMS service not available: {e}")


app = FastAPI()

# ✅ CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://superb-patience-production.up.railway.app",  # Your deployed frontend
        "http://localhost:5173",  # For local development
        "http://localhost:3000",   # Alternative local dev port
        "*"  # For testing - remove in production
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Lazy loading functions
def load_soil_model():
    """Load soil classification model lazily"""
    global soil_model, class_names
    if soil_model is None:
        try:
            from tensorflow.keras.models import load_model
            MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "models", "soil_classifier.keras")
            LABELS_PATH = os.path.join(os.path.dirname(__file__), "..", "models", "class_names.json")
            
            logger.info(f"Loading soil model from: {MODEL_PATH}")
            soil_model = load_model(MODEL_PATH)
            
            with open(LABELS_PATH, "r") as f:
                class_names = json.load(f)
            
            logger.info(f"Loaded soil model with classes: {class_names}")
            
        except Exception as e:
            logger.error(f"Failed to load soil model: {str(e)}")
            raise e
    
    return soil_model, class_names

def load_plantdoc_predictor():
    """Load plant disease predictor lazily"""
    global plantdoc_predict_func
    if plantdoc_predict_func is None:
        try:
            from scripts.predict_plantdoc import predict_disease
            plantdoc_predict_func = predict_disease
            logger.info("Loaded plant disease predictor")
        except Exception as e:
            logger.error(f"Failed to load plant disease predictor: {str(e)}")
            raise e
    
    return plantdoc_predict_func

def load_price_predictor():
    """Load price predictor lazily"""
    global price_predict_func
    if price_predict_func is None:
        try:
            from scripts.predict_with_graph import get_price_predictions
            price_predict_func = get_price_predictions
            logger.info("Loaded price predictor")
        except Exception as e:
            logger.error(f"Failed to load price predictor: {str(e)}")
            raise e
    
    return price_predict_func

# ✅ Mount graph images folder
GRAPH_DIR = os.path.join(os.path.dirname(__file__), "predicted_graphs")
os.makedirs(GRAPH_DIR, exist_ok=True)
app.mount("/graphs", StaticFiles(directory=GRAPH_DIR), name="graphs")

# ✅ Health check route
@app.get("/health")
def health_check():
    return {"status": "API is running"}

# ✅ Health Check Endpoint
@app.get("/healthz")
def health_check_detailed():
    """Detailed health check with model status"""
    status = {
        "status": "healthy",
        "message": "AgriSync API is running",
        "models": {
            "soil_model": soil_model is not None,
            "plantdoc_predictor": plantdoc_predict_func is not None,
            "price_predictor": price_predict_func is not None
        }
    }
    return status

# ✅ Plant Disease Prediction
@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    try:
        # Load predictor on first use
        predict_func = load_plantdoc_predictor()
        
        temp_dir = "temp_uploads"
        os.makedirs(temp_dir, exist_ok=True)

        file_path = os.path.join(temp_dir, file.filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        result = predict_func(file_path)
        
        # Clean up
        if os.path.exists(file_path):
            os.remove(file_path)
            
        return result
    except Exception as e:
        logger.error(f"Plant disease prediction error: {str(e)}")
        logger.error(traceback.format_exc())
        return {
            "error": f"Plant disease prediction failed: {str(e)}",
            "prediction": "Unable to predict",
            "confidence": 0.0
        }

# ✅ Market Price Prediction
@app.get("/market-predictions")
def get_predictions_for_graph():
    try:
        # Load predictor on first use
        predict_func = load_price_predictor()
        results = predict_func()
        return {"status": "success", "data": results}
    except Exception as e:
        logger.error(f"Market prediction error: {str(e)}")
        logger.error(traceback.format_exc())
        return {
            "status": "error", 
            "message": f"Market prediction failed: {str(e)}",
            "data": []
        }

# ✅ Soil Type Prediction
IMG_SIZE = (180, 180)

soil_info = {
    "Clay soil": {
        "notes": "Clay soil retains water and is rich in nutrients but can be dense.",
        "crops": ["Rice", "Broccoli", "Cabbage"],
        "care": ["Improve drainage", "Avoid overwatering", "Add compost"],
    },
    "Sandy soil": {
        "notes": "Sandy soil has large particles and drains quickly.",
        "crops": ["Carrots", "Peanuts", "Watermelon"],
        "care": ["Add organic matter", "Mulch frequently", "Fertilize regularly"],
    },
    "Loamy soil": {
        "notes": "Loamy soil is ideal for most plants, with a balanced texture and nutrients.",
        "crops": ["Tomatoes", "Wheat", "Sugarcane"],
        "care": ["Maintain pH level", "Use organic fertilizers", "Avoid compaction"],
    },
    # Add more if needed
}

@app.post("/predict-soil")
async def predict_soil(file: UploadFile = File(...)):
    try:
        # Load model on first use
        model, class_names = load_soil_model()
        
        image = Image.open(file.file).convert("RGB")
        image = image.resize(IMG_SIZE)
        image_array = np.expand_dims(np.array(image) / 255.0, axis=0)
        logger.info(f"Processed image shape: {image_array.shape}")

        prediction = model.predict(image_array)[0]
        logger.info(f"Raw prediction probabilities: {prediction}")
        predicted_index = np.argmax(prediction)
        predicted_class = class_names[predicted_index]
        confidence = float(prediction[predicted_index]) * 100

        # 🔍 Debugging log
        logger.info(f"Predicted index: {predicted_index}")
        logger.info(f"Predicted class: {predicted_class}")
        logger.info(f"Confidence: {confidence}")

        info = soil_info.get(predicted_class, {
            "notes": "No additional info available.",
            "crops": [],
            "care": [],
        })

        return {
            "prediction": predicted_class,
            "confidence": confidence,
            "notes": info["notes"],
            "crops": info["crops"],
            "care": info["care"]
        }

    except Exception as e:
        logger.error(f"Soil prediction error: {str(e)}")
        logger.error(traceback.format_exc())
        return {
            "error": f"Soil prediction failed: {str(e)}",
            "prediction": "Unable to predict",
            "confidence": 0.0,
            "notes": "Error occurred during prediction",
            "crops": [],
            "care": []
        }

# ✅ Print all registered routes
@app.on_event("startup")
async def list_routes():
    logger.info("\n📋 Registered Routes:")
    for route in app.routes:
        logger.info(f"➡️  {route.path}")
    
    # Try to load models on startup (optional - will load on first use if this fails)
    try:
        logger.info("🔄 Attempting to pre-load models...")
        
        # Try to load soil model
        try:
            load_soil_model()
            logger.info("✅ Soil model loaded successfully")
        except Exception as e:
            logger.warning(f"⚠️ Could not pre-load soil model: {e}")
        
        # Try to load plant disease predictor
        try:
            load_plantdoc_predictor()
            logger.info("✅ Plant disease predictor loaded successfully")
        except Exception as e:
            logger.warning(f"⚠️ Could not pre-load plant disease predictor: {e}")
        
        # Try to load price predictor
        try:
            load_price_predictor()
            logger.info("✅ Price predictor loaded successfully")
        except Exception as e:
            logger.warning(f"⚠️ Could not pre-load price predictor: {e}")
            
    except Exception as e:
        logger.warning(f"⚠️ Model pre-loading failed: {e}")
        logger.info("📝 Models will be loaded on first use")


# ========================================
# 🤖 LANGCHAIN AUTONOMOUS AGENT ENDPOINTS
# ========================================

@app.post("/agent/start-monitoring")
async def start_autonomous_monitoring(crop_ids: list = None):
    """
    Start 24/7 autonomous crop monitoring with LangChain agents
    """
    if not AGENTS_AVAILABLE:
        return {"error": "Autonomous agents not available", "status": "disabled"}
    
    try:
        if not crop_ids:
            crop_ids = ["CROP_001", "CROP_002", "CROP_003"]  # Default crops
        
        result = agent_scheduler.start_autonomous_operations(crop_ids)
        return {
            "status": "success",
            "message": "🤖 Autonomous monitoring started",
            "data": result
        }
    except Exception as e:
        logger.error(f"Error starting autonomous monitoring: {e}")
        return {"error": str(e), "status": "failed"}


@app.post("/agent/stop-monitoring")
async def stop_autonomous_monitoring():
    """
    Stop autonomous monitoring
    """
    if not AGENTS_AVAILABLE:
        return {"error": "Autonomous agents not available", "status": "disabled"}
    
    try:
        result = agent_scheduler.stop_autonomous_operations()
        return {
            "status": "success",
            "message": "⏸️ Autonomous monitoring stopped",
            "data": result
        }
    except Exception as e:
        logger.error(f"Error stopping autonomous monitoring: {e}")
        return {"error": str(e), "status": "failed"}


@app.get("/agent/status")
async def get_agent_status():
    """
    Get current status of autonomous agents
    """
    if not AGENTS_AVAILABLE:
        return {
            "status": "disabled",
            "message": "Autonomous agents not available",
            "agents_available": False
        }
    
    try:
        status = agent_scheduler.get_scheduler_status()
        return {
            "status": "success",
            "agents_available": True,
            "data": status
        }
    except Exception as e:
        logger.error(f"Error getting agent status: {e}")
        return {"error": str(e), "status": "failed"}


@app.post("/agent/monitor-crop/{crop_id}")
async def monitor_single_crop(crop_id: str):
    """
    Run autonomous monitoring cycle for a single crop
    """
    if not AGENTS_AVAILABLE:
        return {"error": "Autonomous agents not available", "status": "disabled"}
    
    try:
        result = await autonomous_agent.autonomous_monitoring_cycle(crop_id)
        return {
            "status": "success",
            "message": f"✅ Monitored crop {crop_id}",
            "data": result
        }
    except Exception as e:
        logger.error(f"Error monitoring crop: {e}")
        return {"error": str(e), "status": "failed"}


@app.get("/agent/learning-feedback")
async def get_learning_feedback():
    """
    Get blockchain feedback loop learning data
    """
    if not AGENTS_AVAILABLE:
        return {"error": "Autonomous agents not available", "status": "disabled"}
    
    try:
        summary = feedback_loop.get_feedback_summary()
        return {
            "status": "success",
            "message": "📊 Learning feedback retrieved",
            "data": summary
        }
    except Exception as e:
        logger.error(f"Error getting learning feedback: {e}")
        return {"error": str(e), "status": "failed"}


@app.post("/agent/trigger-learning")
async def trigger_learning_cycle():
    """
    Manually trigger a blockchain learning cycle
    """
    if not AGENTS_AVAILABLE:
        return {"error": "Autonomous agents not available", "status": "disabled"}
    
    try:
        sales = await feedback_loop.listen_to_crop_sales()
        outcomes = await feedback_loop.listen_to_disease_outcomes()
        
        return {
            "status": "success",
            "message": "🧠 Learning cycle completed",
            "data": {
                "sales_processed": len(sales),
                "outcomes_processed": len(outcomes),
                "sales": sales,
                "outcomes": outcomes
            }
        }
    except Exception as e:
        logger.error(f"Error triggering learning cycle: {e}")
        return {"error": str(e), "status": "failed"}


# ========================================
# 📱 SMS ALERT ENDPOINTS
# ========================================

@app.post("/sms/send")
async def send_sms_alert(phone_number: str, message: str, alert_type: str = "general"):
    """
    Send SMS alert to farmer
    """
    if not SMS_AVAILABLE:
        return {"error": "SMS service not available", "status": "disabled"}
    
    try:
        result = sms_service.send_sms(phone_number, message, alert_type)
        return {
            "status": "success" if result["success"] else "failed",
            "data": result
        }
    except Exception as e:
        logger.error(f"Error sending SMS: {e}")
        return {"error": str(e), "status": "failed"}


@app.post("/sms/disease-alert")
async def send_disease_alert_sms(
    phone_number: str,
    crop_type: str,
    disease_name: str,
    confidence: float
):
    """
    Send disease detection alert via SMS
    """
    if not SMS_AVAILABLE:
        return {"error": "SMS service not available", "status": "disabled"}
    
    try:
        result = sms_service.send_disease_alert(
            phone_number,
            crop_type,
            disease_name,
            confidence
        )
        return {
            "status": "success" if result["success"] else "failed",
            "message": "📱 Disease alert sent via SMS",
            "data": result
        }
    except Exception as e:
        logger.error(f"Error sending disease alert: {e}")
        return {"error": str(e), "status": "failed"}


@app.post("/sms/price-alert")
async def send_price_alert_sms(
    phone_number: str,
    crop_type: str,
    current_price: float,
    predicted_price: float,
    recommendation: str
):
    """
    Send market price alert via SMS
    """
    if not SMS_AVAILABLE:
        return {"error": "SMS service not available", "status": "disabled"}
    
    try:
        result = sms_service.send_price_alert(
            phone_number,
            crop_type,
            current_price,
            predicted_price,
            recommendation
        )
        return {
            "status": "success" if result["success"] else "failed",
            "message": "💰 Price alert sent via SMS",
            "data": result
        }
    except Exception as e:
        logger.error(f"Error sending price alert: {e}")
        return {"error": str(e), "status": "failed"}


@app.post("/sms/weather-alert")
async def send_weather_alert_sms(
    phone_number: str,
    weather_condition: str,
    action_required: str
):
    """
    Send weather alert via SMS
    """
    if not SMS_AVAILABLE:
        return {"error": "SMS service not available", "status": "disabled"}
    
    try:
        result = sms_service.send_weather_alert(
            phone_number,
            weather_condition,
            action_required
        )
        return {
            "status": "success" if result["success"] else "failed",
            "message": "🌦️ Weather alert sent via SMS",
            "data": result
        }
    except Exception as e:
        logger.error(f"Error sending weather alert: {e}")
        return {"error": str(e), "status": "failed"}


@app.post("/sms/nft-alert")
async def send_nft_minted_alert_sms(
    phone_number: str,
    nft_type: str,
    token_id: str
):
    """
    Send NFT minted notification via SMS
    """
    if not SMS_AVAILABLE:
        return {"error": "SMS service not available", "status": "disabled"}
    
    try:
        result = sms_service.send_nft_minted_alert(
            phone_number,
            nft_type,
            token_id
        )
        return {
            "status": "success" if result["success"] else "failed",
            "message": "🎨 NFT alert sent via SMS",
            "data": result
        }
    except Exception as e:
        logger.error(f"Error sending NFT alert: {e}")
        return {"error": str(e), "status": "failed"}


@app.post("/sms/bulk")
async def send_bulk_sms(phone_numbers: list, message: str, alert_type: str = "bulk"):
    """
    Send bulk SMS to multiple farmers
    """
    if not SMS_AVAILABLE:
        return {"error": "SMS service not available", "status": "disabled"}
    
    try:
        result = sms_service.send_bulk_sms(phone_numbers, message, alert_type)
        return {
            "status": "success",
            "message": f"📱 Bulk SMS sent: {result['sent']}/{result['total']}",
            "data": result
        }
    except Exception as e:
        logger.error(f"Error sending bulk SMS: {e}")
        return {"error": str(e), "status": "failed"}


@app.get("/sms/statistics")
async def get_sms_statistics():
    """
    Get SMS service statistics
    """
    if not SMS_AVAILABLE:
        return {"error": "SMS service not available", "status": "disabled"}
    
    try:
        stats = sms_service.get_statistics()
        return {
            "status": "success",
            "data": stats
        }
    except Exception as e:
        logger.error(f"Error getting SMS statistics: {e}")
        return {"error": str(e), "status": "failed"}


@app.get("/sms/recent")
async def get_recent_sms(limit: int = 10):
    """
    Get recent SMS history
    """
    if not SMS_AVAILABLE:
        return {"error": "SMS service not available", "status": "disabled"}
    
    try:
        recent = sms_service.get_recent_sms(limit)
        return {
            "status": "success",
            "data": recent
        }
    except Exception as e:
        logger.error(f"Error getting recent SMS: {e}")
        return {"error": str(e), "status": "failed"}
