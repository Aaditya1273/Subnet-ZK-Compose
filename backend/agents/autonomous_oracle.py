"""
FarmOracle Autonomous Agent System
Built with LangChain for 24/7 crop monitoring and blockchain automation
"""

import os
import json
import logging
from datetime import datetime
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, asdict
import asyncio

# LangChain imports
from langchain.agents import Tool, AgentExecutor, create_react_agent
from langchain.memory import ConversationBufferMemory
from langchain.prompts import PromptTemplate
from langchain_core.language_models.llms import LLM
from langchain_core.callbacks.manager import CallbackManagerForLLMRun

# Local imports
import sys
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@dataclass
class CropMonitoringResult:
    """Result from crop monitoring"""
    crop_id: str
    health_status: str
    disease_detected: bool
    disease_name: Optional[str]
    confidence: float
    action_required: str
    timestamp: str
    blockchain_action: Optional[str] = None


@dataclass
class MarketAlert:
    """Market price alert"""
    crop_type: str
    current_price: float
    predicted_price: float
    price_change_percent: float
    recommendation: str
    timestamp: str


class LocalLLM(LLM):
    """Simple rule-based LLM for autonomous decision making without API keys"""
    
    @property
    def _llm_type(self) -> str:
        return "local_farm_oracle"
    
    def _call(
        self,
        prompt: str,
        stop: Optional[List[str]] = None,
        run_manager: Optional[CallbackManagerForLLMRun] = None,
        **kwargs: Any,
    ) -> str:
        """Execute autonomous farming logic based on prompt"""
        prompt_lower = prompt.lower()
        
        # Disease detection logic
        if "disease" in prompt_lower and "detected" in prompt_lower:
            if "blight" in prompt_lower or "rot" in prompt_lower:
                return "CRITICAL: Disease detected. Action: Immediate harvest recommended within 48 hours. Blockchain: Mint disease-alert NFT. SMS: Alert farmer immediately."
            else:
                return "WARNING: Potential disease. Action: Monitor closely for 24 hours. Blockchain: Update crop health status."
        
        # Price prediction logic
        if "price" in prompt_lower and ("predict" in prompt_lower or "forecast" in prompt_lower):
            if "increase" in prompt_lower or "rising" in prompt_lower:
                return "OPPORTUNITY: Price increase predicted. Action: Hold crop for 5-7 days for maximum profit. Blockchain: Lock crop listing."
            elif "decrease" in prompt_lower or "falling" in prompt_lower:
                return "URGENT: Price drop predicted. Action: List crop immediately on marketplace. Blockchain: Auto-list at current market price."
        
        # Weather alert logic
        if "weather" in prompt_lower:
            if "rain" in prompt_lower or "storm" in prompt_lower:
                return "ALERT: Adverse weather predicted. Action: Harvest ready crops within 24 hours. Blockchain: Update crop status to 'weather-risk'."
            elif "drought" in prompt_lower or "dry" in prompt_lower:
                return "ADVISORY: Dry conditions predicted. Action: Increase irrigation. Blockchain: Log water usage for sustainability NFT."
        
        # Soil health logic
        if "soil" in prompt_lower:
            if "poor" in prompt_lower or "degraded" in prompt_lower:
                return "RECOMMENDATION: Soil quality declining. Action: Apply organic fertilizer. Blockchain: Mint soil-improvement NFT for carbon credits."
            else:
                return "HEALTHY: Soil conditions optimal. Action: Continue current practices. Blockchain: Update soil health score."
        
        # Default autonomous response
        return "MONITORING: All systems normal. Action: Continue automated monitoring. Blockchain: Log health check."


class AutonomousFarmOracle:
    """
    Autonomous AI Oracle for 24/7 farm monitoring
    Uses LangChain agents to make intelligent decisions
    """
    
    def __init__(self):
        self.llm = LocalLLM()
        self.memory = ConversationBufferMemory(memory_key="chat_history")
        self.monitoring_active = False
        self.agent_executor = None
        self._initialize_agent()
        
        logger.info("🤖 Autonomous FarmOracle Agent initialized")
    
    def _initialize_agent(self):
        """Initialize LangChain agent with farming tools"""
        
        tools = [
            Tool(
                name="CropHealthMonitor",
                func=self._monitor_crop_health,
                description="Monitor crop health status and detect diseases. Input: crop_id"
            ),
            Tool(
                name="PricePredictor",
                func=self._predict_market_price,
                description="Predict market prices for crops. Input: crop_type"
            ),
            Tool(
                name="WeatherAnalyzer",
                func=self._analyze_weather,
                description="Analyze weather conditions and farming impact. Input: location"
            ),
            Tool(
                name="BlockchainExecutor",
                func=self._execute_blockchain_action,
                description="Execute blockchain actions (mint NFT, list crop, update status). Input: action_type, data"
            ),
            Tool(
                name="AlertDispatcher",
                func=self._dispatch_alert,
                description="Send alerts to farmers via SMS/notification. Input: alert_type, message"
            )
        ]
        
        # Create agent prompt
        template = """You are an autonomous AI farming oracle monitoring crops 24/7.
        
Your mission: Protect farmers from losses and maximize their profits through intelligent automation.

You have access to these tools:
{tools}

Tool Names: {tool_names}

Current situation: {input}

Previous actions: {chat_history}

Think step by step:
1. What is the farming situation?
2. What action will help the farmer most?
3. What blockchain action should be triggered?

Your response:
{agent_scratchpad}"""

        prompt = PromptTemplate(
            template=template,
            input_variables=["input", "chat_history", "agent_scratchpad", "tools", "tool_names"]
        )
        
        # Create agent
        agent = create_react_agent(
            llm=self.llm,
            tools=tools,
            prompt=prompt
        )
        
        self.agent_executor = AgentExecutor(
            agent=agent,
            tools=tools,
            memory=self.memory,
            verbose=True,
            max_iterations=3,
            handle_parsing_errors=True
        )
    
    def _monitor_crop_health(self, crop_id: str) -> str:
        """Monitor individual crop health"""
        try:
            # Simulate disease detection (in production, call actual ML model)
            import random
            
            diseases = ["healthy", "blight", "rust", "mildew", "rot"]
            status = random.choice(diseases)
            confidence = random.uniform(0.75, 0.98)
            
            result = CropMonitoringResult(
                crop_id=crop_id,
                health_status=status,
                disease_detected=(status != "healthy"),
                disease_name=status if status != "healthy" else None,
                confidence=confidence,
                action_required="immediate_harvest" if status in ["blight", "rot"] else "monitor",
                timestamp=datetime.now().isoformat(),
                blockchain_action="mint_alert_nft" if status != "healthy" else None
            )
            
            logger.info(f"🌱 Crop {crop_id} health: {status} (confidence: {confidence:.2%})")
            return json.dumps(asdict(result))
            
        except Exception as e:
            logger.error(f"Error monitoring crop: {e}")
            return json.dumps({"error": str(e)})
    
    def _predict_market_price(self, crop_type: str) -> str:
        """Predict market prices"""
        try:
            import random
            
            current_price = random.uniform(50, 150)
            predicted_price = current_price * random.uniform(0.85, 1.25)
            change_percent = ((predicted_price - current_price) / current_price) * 100
            
            recommendation = "SELL NOW" if change_percent < -5 else "HOLD" if change_percent < 10 else "WAIT FOR PEAK"
            
            alert = MarketAlert(
                crop_type=crop_type,
                current_price=current_price,
                predicted_price=predicted_price,
                price_change_percent=change_percent,
                recommendation=recommendation,
                timestamp=datetime.now().isoformat()
            )
            
            logger.info(f"💰 {crop_type} price: ${current_price:.2f} → ${predicted_price:.2f} ({change_percent:+.1f}%)")
            return json.dumps(asdict(alert))
            
        except Exception as e:
            return json.dumps({"error": str(e)})
    
    def _analyze_weather(self, location: str) -> str:
        """Analyze weather conditions"""
        try:
            import random
            
            conditions = ["sunny", "rainy", "stormy", "drought"]
            weather = random.choice(conditions)
            
            impact = {
                "sunny": "Optimal growing conditions",
                "rainy": "Good for crops, monitor for excess water",
                "stormy": "ALERT: Harvest immediately if crops are ready",
                "drought": "ALERT: Increase irrigation immediately"
            }
            
            result = {
                "location": location,
                "condition": weather,
                "impact": impact[weather],
                "action": "harvest_now" if weather == "stormy" else "monitor",
                "timestamp": datetime.now().isoformat()
            }
            
            logger.info(f"🌦️ Weather at {location}: {weather}")
            return json.dumps(result)
            
        except Exception as e:
            return json.dumps({"error": str(e)})
    
    def _execute_blockchain_action(self, action_data: str) -> str:
        """Execute blockchain actions"""
        try:
            # Parse action
            action_type, data = action_data.split(",", 1) if "," in action_data else (action_data, "")
            
            actions = {
                "mint_nft": "✅ Minted crop health NFT on blockchain",
                "list_crop": "✅ Auto-listed crop on marketplace",
                "update_status": "✅ Updated crop status on-chain",
                "mint_alert": "✅ Minted disease alert NFT",
                "lock_listing": "✅ Locked crop listing for price optimization"
            }
            
            result = {
                "action": action_type,
                "status": "success",
                "message": actions.get(action_type, "✅ Blockchain action executed"),
                "tx_hash": f"0x{''.join([str(i) for i in range(64)])}",  # Mock tx hash
                "timestamp": datetime.now().isoformat()
            }
            
            logger.info(f"⛓️ Blockchain: {result['message']}")
            return json.dumps(result)
            
        except Exception as e:
            return json.dumps({"error": str(e)})
    
    def _dispatch_alert(self, alert_data: str) -> str:
        """Dispatch alerts to farmers via SMS and other channels"""
        try:
            alert_type, message = alert_data.split(",", 1) if "," in alert_data else (alert_data, "Alert")
            
            # Try to send SMS if service available
            sms_sent = False
            try:
                import sys
                sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'services'))
                from sms_service import sms_service
                
                # Send SMS to default test number (in production, use farmer's number)
                sms_result = sms_service.send_sms(
                    "+254712345678",  # Test number
                    message,
                    alert_type
                )
                sms_sent = sms_result.get("success", False)
            except Exception as sms_error:
                logger.warning(f"SMS dispatch failed: {sms_error}")
            
            result = {
                "alert_type": alert_type,
                "message": message,
                "channels": ["SMS", "Push Notification", "Dashboard"],
                "sms_sent": sms_sent,
                "status": "dispatched",
                "timestamp": datetime.now().isoformat()
            }
            
            logger.info(f"📱 Alert dispatched: {alert_type} (SMS: {sms_sent})")
            return json.dumps(result)
            
        except Exception as e:
            return json.dumps({"error": str(e)})
    
    async def autonomous_monitoring_cycle(self, crop_id: str) -> Dict[str, Any]:
        """
        Execute one autonomous monitoring cycle
        This is called every few minutes by the scheduler
        """
        try:
            logger.info(f"🔄 Starting autonomous monitoring cycle for crop {crop_id}")
            
            # Agent analyzes the situation and decides actions
            situation = f"Monitor crop {crop_id} for health, check market prices, analyze weather, and take autonomous actions if needed."
            
            result = self.agent_executor.invoke({"input": situation})
            
            return {
                "crop_id": crop_id,
                "cycle_result": result,
                "timestamp": datetime.now().isoformat(),
                "status": "completed"
            }
            
        except Exception as e:
            logger.error(f"Error in monitoring cycle: {e}")
            return {
                "crop_id": crop_id,
                "error": str(e),
                "timestamp": datetime.now().isoformat(),
                "status": "failed"
            }
    
    def start_monitoring(self, crop_ids: List[str]):
        """Start 24/7 autonomous monitoring"""
        self.monitoring_active = True
        logger.info(f"🚀 Started autonomous monitoring for {len(crop_ids)} crops")
        return {"status": "monitoring_started", "crops": crop_ids}
    
    def stop_monitoring(self):
        """Stop autonomous monitoring"""
        self.monitoring_active = False
        logger.info("⏸️ Stopped autonomous monitoring")
        return {"status": "monitoring_stopped"}
    
    def get_agent_status(self) -> Dict[str, Any]:
        """Get current agent status"""
        return {
            "active": self.monitoring_active,
            "agent_type": "LangChain Autonomous Oracle",
            "capabilities": [
                "24/7 Crop Health Monitoring",
                "Autonomous Disease Detection",
                "Market Price Prediction",
                "Weather Impact Analysis",
                "Blockchain Action Execution",
                "Automated Alert Dispatch"
            ],
            "memory_size": len(self.memory.chat_memory.messages) if self.memory else 0,
            "timestamp": datetime.now().isoformat()
        }


# Global agent instance
autonomous_agent = AutonomousFarmOracle()


if __name__ == "__main__":
    # Test the agent
    agent = AutonomousFarmOracle()
    
    print("\n🤖 Testing Autonomous FarmOracle Agent\n")
    
    # Test monitoring
    result = asyncio.run(agent.autonomous_monitoring_cycle("CROP_001"))
    print(f"\n✅ Monitoring Result: {json.dumps(result, indent=2)}")
    
    # Test agent status
    status = agent.get_agent_status()
    print(f"\n📊 Agent Status: {json.dumps(status, indent=2)}")
