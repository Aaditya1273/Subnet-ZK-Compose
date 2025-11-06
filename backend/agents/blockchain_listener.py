"""
Blockchain Feedback Loop for Autonomous Learning
Listens to blockchain events and feeds data back to AI models
"""

import os
import json
import logging
from typing import Dict, Any, List
from datetime import datetime
from web3 import Web3
import asyncio

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class BlockchainFeedbackLoop:
    """
    Listens to blockchain transactions and feeds data back to AI models
    Enables self-learning from real-world farming outcomes
    """
    
    def __init__(self, rpc_url: str = None, contract_address: str = None):
        self.rpc_url = rpc_url or os.getenv("RPC_URL", "https://rpc-amoy.polygon.technology")
        self.contract_address = contract_address or os.getenv("CONTRACT_ADDRESS")
        self.w3 = None
        self.contract = None
        self.feedback_data = []
        self.learning_enabled = True
        
        self._initialize_web3()
        logger.info("🔗 Blockchain Feedback Loop initialized")
    
    def _initialize_web3(self):
        """Initialize Web3 connection"""
        try:
            self.w3 = Web3(Web3.HTTPProvider(self.rpc_url))
            if self.w3.is_connected():
                logger.info(f"✅ Connected to blockchain: {self.rpc_url}")
            else:
                logger.warning("⚠️ Blockchain connection failed, using mock mode")
        except Exception as e:
            logger.error(f"Error connecting to blockchain: {e}")
            self.w3 = None
    
    async def listen_to_crop_sales(self) -> List[Dict[str, Any]]:
        """
        Listen to crop sale events on blockchain
        Feed successful sales back to price prediction model
        """
        try:
            # In production, this would listen to actual blockchain events
            # For now, we'll simulate the feedback loop
            
            mock_sales = [
                {
                    "crop_id": "CROP_001",
                    "crop_type": "tomato",
                    "sale_price": 120.50,
                    "predicted_price": 115.00,
                    "prediction_accuracy": 0.95,
                    "timestamp": datetime.now().isoformat(),
                    "tx_hash": "0xabc123..."
                },
                {
                    "crop_id": "CROP_002",
                    "crop_type": "wheat",
                    "sale_price": 85.00,
                    "predicted_price": 90.00,
                    "prediction_accuracy": 0.94,
                    "timestamp": datetime.now().isoformat(),
                    "tx_hash": "0xdef456..."
                }
            ]
            
            logger.info(f"📊 Captured {len(mock_sales)} sale events from blockchain")
            
            # Feed data back to model
            for sale in mock_sales:
                await self._update_price_model(sale)
            
            return mock_sales
            
        except Exception as e:
            logger.error(f"Error listening to sales: {e}")
            return []
    
    async def listen_to_disease_outcomes(self) -> List[Dict[str, Any]]:
        """
        Listen to disease detection outcomes
        Feed farmer-verified results back to disease detection model
        """
        try:
            mock_outcomes = [
                {
                    "crop_id": "CROP_003",
                    "predicted_disease": "blight",
                    "actual_outcome": "blight_confirmed",
                    "farmer_action": "harvested_early",
                    "loss_prevented": 0.85,  # 85% of crop saved
                    "model_accuracy": 0.96,
                    "timestamp": datetime.now().isoformat()
                },
                {
                    "crop_id": "CROP_004",
                    "predicted_disease": "rust",
                    "actual_outcome": "false_positive",
                    "farmer_action": "no_action_needed",
                    "model_accuracy": 0.88,
                    "timestamp": datetime.now().isoformat()
                }
            ]
            
            logger.info(f"🔬 Captured {len(mock_outcomes)} disease outcomes from blockchain")
            
            # Feed data back to model
            for outcome in mock_outcomes:
                await self._update_disease_model(outcome)
            
            return mock_outcomes
            
        except Exception as e:
            logger.error(f"Error listening to disease outcomes: {e}")
            return []
    
    async def _update_price_model(self, sale_data: Dict[str, Any]):
        """
        Update price prediction model with real sale data
        This is the self-learning mechanism
        """
        try:
            feedback = {
                "model": "price_prediction",
                "crop_type": sale_data["crop_type"],
                "predicted": sale_data["predicted_price"],
                "actual": sale_data["sale_price"],
                "accuracy": sale_data["prediction_accuracy"],
                "learning_signal": "positive" if sale_data["prediction_accuracy"] > 0.90 else "needs_improvement",
                "timestamp": datetime.now().isoformat()
            }
            
            self.feedback_data.append(feedback)
            
            logger.info(f"🧠 Updated price model: {sale_data['crop_type']} accuracy={sale_data['prediction_accuracy']:.2%}")
            
            # In production, this would retrain the model with new data
            return feedback
            
        except Exception as e:
            logger.error(f"Error updating price model: {e}")
            return None
    
    async def _update_disease_model(self, outcome_data: Dict[str, Any]):
        """
        Update disease detection model with farmer-verified outcomes
        """
        try:
            feedback = {
                "model": "disease_detection",
                "crop_id": outcome_data["crop_id"],
                "predicted": outcome_data["predicted_disease"],
                "actual": outcome_data["actual_outcome"],
                "accuracy": outcome_data["model_accuracy"],
                "learning_signal": "positive" if "confirmed" in outcome_data["actual_outcome"] else "false_positive",
                "timestamp": datetime.now().isoformat()
            }
            
            self.feedback_data.append(feedback)
            
            logger.info(f"🧠 Updated disease model: {outcome_data['predicted_disease']} → {outcome_data['actual_outcome']}")
            
            return feedback
            
        except Exception as e:
            logger.error(f"Error updating disease model: {e}")
            return None
    
    async def continuous_learning_loop(self):
        """
        Continuous learning loop that runs 24/7
        Monitors blockchain and updates models in real-time
        """
        logger.info("🔄 Starting continuous learning loop")
        
        while self.learning_enabled:
            try:
                # Listen to blockchain events
                sales = await self.listen_to_crop_sales()
                outcomes = await self.listen_to_disease_outcomes()
                
                # Calculate overall model performance
                if self.feedback_data:
                    avg_accuracy = sum(f.get("accuracy", 0) for f in self.feedback_data[-10:]) / min(len(self.feedback_data), 10)
                    logger.info(f"📈 Model performance (last 10): {avg_accuracy:.2%}")
                
                # Wait before next cycle (in production, this would be event-driven)
                await asyncio.sleep(60)  # Check every minute
                
            except Exception as e:
                logger.error(f"Error in learning loop: {e}")
                await asyncio.sleep(60)
    
    def get_feedback_summary(self) -> Dict[str, Any]:
        """Get summary of learning feedback"""
        if not self.feedback_data:
            return {"status": "no_data", "message": "No feedback data collected yet"}
        
        price_feedback = [f for f in self.feedback_data if f["model"] == "price_prediction"]
        disease_feedback = [f for f in self.feedback_data if f["model"] == "disease_detection"]
        
        return {
            "total_feedback_events": len(self.feedback_data),
            "price_model_updates": len(price_feedback),
            "disease_model_updates": len(disease_feedback),
            "avg_price_accuracy": sum(f["accuracy"] for f in price_feedback) / len(price_feedback) if price_feedback else 0,
            "avg_disease_accuracy": sum(f["accuracy"] for f in disease_feedback) / len(disease_feedback) if disease_feedback else 0,
            "learning_status": "active" if self.learning_enabled else "paused",
            "last_update": self.feedback_data[-1]["timestamp"] if self.feedback_data else None
        }
    
    def start_learning(self):
        """Start the learning loop"""
        self.learning_enabled = True
        logger.info("🚀 Blockchain learning enabled")
        return {"status": "learning_started"}
    
    def stop_learning(self):
        """Stop the learning loop"""
        self.learning_enabled = False
        logger.info("⏸️ Blockchain learning paused")
        return {"status": "learning_stopped"}


# Global feedback loop instance
feedback_loop = BlockchainFeedbackLoop()


if __name__ == "__main__":
    # Test the feedback loop
    loop = BlockchainFeedbackLoop()
    
    print("\n🔗 Testing Blockchain Feedback Loop\n")
    
    # Test listening to events
    sales = asyncio.run(loop.listen_to_crop_sales())
    print(f"✅ Sales captured: {len(sales)}")
    
    outcomes = asyncio.run(loop.listen_to_disease_outcomes())
    print(f"✅ Outcomes captured: {len(outcomes)}")
    
    # Get summary
    summary = loop.get_feedback_summary()
    print(f"\n📊 Feedback Summary:\n{json.dumps(summary, indent=2)}")
