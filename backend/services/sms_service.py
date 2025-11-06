"""
FarmOracle SMS Alert Service
Sends SMS notifications to farmers via Twilio
For low-connectivity environments
"""

import os
import logging
from datetime import datetime
from typing import Dict, List, Optional
import phonenumbers
from phonenumbers import NumberParseException

# Twilio imports
try:
    from twilio.rest import Client
    from twilio.base.exceptions import TwilioRestException
    TWILIO_AVAILABLE = True
except ImportError:
    TWILIO_AVAILABLE = False
    logging.warning("Twilio not installed. SMS features will use mock mode.")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class SMSAlertService:
    """
    SMS Alert Service for FarmOracle
    Sends critical farming alerts via SMS for low-connectivity farmers
    """
    
    def __init__(self):
        self.account_sid = os.getenv('TWILIO_ACCOUNT_SID')
        self.auth_token = os.getenv('TWILIO_AUTH_TOKEN')
        self.from_number = os.getenv('TWILIO_PHONE_NUMBER', '+1234567890')
        self.mock_mode = not TWILIO_AVAILABLE or not self.account_sid
        
        if self.mock_mode:
            logger.warning("⚠️ SMS Service running in MOCK MODE")
            self.client = None
        else:
            try:
                self.client = Client(self.account_sid, self.auth_token)
                logger.info("✅ Twilio SMS Service initialized")
            except Exception as e:
                logger.error(f"Failed to initialize Twilio: {e}")
                self.mock_mode = True
                self.client = None
        
        # SMS history for tracking
        self.sms_history = []
        self.total_sent = 0
        self.total_failed = 0
    
    def validate_phone_number(self, phone_number: str, country_code: str = "KE") -> Optional[str]:
        """
        Validate and format phone number
        Default country: Kenya (KE) - can be changed for other African countries
        """
        try:
            parsed = phonenumbers.parse(phone_number, country_code)
            if phonenumbers.is_valid_number(parsed):
                formatted = phonenumbers.format_number(
                    parsed, 
                    phonenumbers.PhoneNumberFormat.E164
                )
                return formatted
            else:
                logger.warning(f"Invalid phone number: {phone_number}")
                return None
        except NumberParseException as e:
            logger.error(f"Error parsing phone number {phone_number}: {e}")
            return None
    
    def send_sms(self, to_number: str, message: str, alert_type: str = "general") -> Dict:
        """
        Send SMS to farmer
        """
        try:
            # Validate phone number
            validated_number = self.validate_phone_number(to_number)
            if not validated_number:
                return {
                    "success": False,
                    "error": "Invalid phone number",
                    "to": to_number
                }
            
            if self.mock_mode:
                # Mock mode for demo/testing
                result = self._send_mock_sms(validated_number, message, alert_type)
            else:
                # Real Twilio SMS
                result = self._send_real_sms(validated_number, message, alert_type)
            
            # Log to history
            self._log_sms(validated_number, message, alert_type, result["success"])
            
            return result
            
        except Exception as e:
            logger.error(f"Error sending SMS: {e}")
            self.total_failed += 1
            return {
                "success": False,
                "error": str(e),
                "to": to_number
            }
    
    def _send_real_sms(self, to_number: str, message: str, alert_type: str) -> Dict:
        """Send real SMS via Twilio"""
        try:
            sms = self.client.messages.create(
                body=message,
                from_=self.from_number,
                to=to_number
            )
            
            self.total_sent += 1
            logger.info(f"✅ SMS sent to {to_number}: {sms.sid}")
            
            return {
                "success": True,
                "sid": sms.sid,
                "to": to_number,
                "status": sms.status,
                "message": message,
                "alert_type": alert_type,
                "timestamp": datetime.now().isoformat()
            }
            
        except TwilioRestException as e:
            logger.error(f"Twilio error: {e}")
            self.total_failed += 1
            return {
                "success": False,
                "error": str(e),
                "to": to_number
            }
    
    def _send_mock_sms(self, to_number: str, message: str, alert_type: str) -> Dict:
        """Send mock SMS for demo/testing"""
        self.total_sent += 1
        logger.info(f"📱 [MOCK SMS] To: {to_number}")
        logger.info(f"   Message: {message}")
        
        return {
            "success": True,
            "sid": f"MOCK_{datetime.now().timestamp()}",
            "to": to_number,
            "status": "sent",
            "message": message,
            "alert_type": alert_type,
            "timestamp": datetime.now().isoformat(),
            "mock": True
        }
    
    def _log_sms(self, to_number: str, message: str, alert_type: str, success: bool):
        """Log SMS to history"""
        self.sms_history.append({
            "to": to_number,
            "message": message,
            "alert_type": alert_type,
            "success": success,
            "timestamp": datetime.now().isoformat()
        })
        
        # Keep only last 100 messages
        if len(self.sms_history) > 100:
            self.sms_history = self.sms_history[-100:]
    
    # ========================================
    # FARMING ALERT TEMPLATES
    # ========================================
    
    def send_disease_alert(self, to_number: str, crop_type: str, disease_name: str, confidence: float) -> Dict:
        """Send disease detection alert"""
        message = (
            f"⚠️ FARMORACLE ALERT\n"
            f"Disease detected in your {crop_type}!\n"
            f"Disease: {disease_name}\n"
            f"Confidence: {confidence:.0%}\n"
            f"Action: Harvest within 48 hours to minimize loss.\n"
            f"Contact extension officer immediately."
        )
        return self.send_sms(to_number, message, "disease_alert")
    
    def send_price_alert(self, to_number: str, crop_type: str, current_price: float, predicted_price: float, recommendation: str) -> Dict:
        """Send market price alert"""
        change = ((predicted_price - current_price) / current_price) * 100
        
        message = (
            f"💰 FARMORACLE PRICE ALERT\n"
            f"Crop: {crop_type}\n"
            f"Current: ${current_price:.2f}\n"
            f"Predicted: ${predicted_price:.2f} ({change:+.1f}%)\n"
            f"Recommendation: {recommendation}\n"
            f"Act within 7 days for best returns."
        )
        return self.send_sms(to_number, message, "price_alert")
    
    def send_weather_alert(self, to_number: str, weather_condition: str, action_required: str) -> Dict:
        """Send weather alert"""
        message = (
            f"🌦️ FARMORACLE WEATHER ALERT\n"
            f"Condition: {weather_condition}\n"
            f"Action: {action_required}\n"
            f"Protect your crops immediately.\n"
            f"Check app for detailed forecast."
        )
        return self.send_sms(to_number, message, "weather_alert")
    
    def send_harvest_reminder(self, to_number: str, crop_type: str, days_until_harvest: int) -> Dict:
        """Send harvest reminder"""
        message = (
            f"🌾 FARMORACLE REMINDER\n"
            f"Your {crop_type} is ready for harvest in {days_until_harvest} days.\n"
            f"Prepare equipment and labor.\n"
            f"Check market prices before harvesting."
        )
        return self.send_sms(to_number, message, "harvest_reminder")
    
    def send_soil_recommendation(self, to_number: str, soil_type: str, recommended_crops: List[str]) -> Dict:
        """Send soil-based crop recommendation"""
        crops_list = ", ".join(recommended_crops[:3])
        
        message = (
            f"🌍 FARMORACLE SOIL ANALYSIS\n"
            f"Soil Type: {soil_type}\n"
            f"Best crops: {crops_list}\n"
            f"Apply organic fertilizer for optimal yield.\n"
            f"Login to app for full report."
        )
        return self.send_sms(to_number, message, "soil_recommendation")
    
    def send_nft_minted_alert(self, to_number: str, nft_type: str, token_id: str) -> Dict:
        """Send NFT minted notification"""
        message = (
            f"🎨 FARMORACLE NFT MINTED\n"
            f"Type: {nft_type}\n"
            f"Token ID: {token_id}\n"
            f"Your crop is now tokenized on blockchain!\n"
            f"View in app to stake and earn rewards."
        )
        return self.send_sms(to_number, message, "nft_alert")
    
    def send_staking_reward_alert(self, to_number: str, reward_amount: float, crop_type: str) -> Dict:
        """Send staking reward notification"""
        message = (
            f"💎 FARMORACLE REWARDS\n"
            f"You earned ${reward_amount:.2f} from staking your {crop_type} NFT!\n"
            f"Claim rewards in app.\n"
            f"Keep staking to earn more."
        )
        return self.send_sms(to_number, message, "reward_alert")
    
    def send_marketplace_sale_alert(self, to_number: str, crop_type: str, quantity: int, sale_price: float) -> Dict:
        """Send marketplace sale notification"""
        message = (
            f"✅ FARMORACLE SALE\n"
            f"Your {crop_type} sold!\n"
            f"Quantity: {quantity} units\n"
            f"Price: ${sale_price:.2f}\n"
            f"Payment processing. Check app for details."
        )
        return self.send_sms(to_number, message, "sale_alert")
    
    # ========================================
    # BULK SMS
    # ========================================
    
    def send_bulk_sms(self, phone_numbers: List[str], message: str, alert_type: str = "bulk") -> Dict:
        """Send SMS to multiple farmers"""
        results = {
            "total": len(phone_numbers),
            "sent": 0,
            "failed": 0,
            "details": []
        }
        
        for number in phone_numbers:
            result = self.send_sms(number, message, alert_type)
            if result["success"]:
                results["sent"] += 1
            else:
                results["failed"] += 1
            results["details"].append(result)
        
        logger.info(f"📱 Bulk SMS: {results['sent']}/{results['total']} sent successfully")
        return results
    
    # ========================================
    # STATISTICS
    # ========================================
    
    def get_statistics(self) -> Dict:
        """Get SMS service statistics"""
        return {
            "total_sent": self.total_sent,
            "total_failed": self.total_failed,
            "success_rate": (self.total_sent / (self.total_sent + self.total_failed) * 100) if (self.total_sent + self.total_failed) > 0 else 0,
            "recent_messages": len(self.sms_history),
            "mock_mode": self.mock_mode,
            "twilio_available": TWILIO_AVAILABLE
        }
    
    def get_recent_sms(self, limit: int = 10) -> List[Dict]:
        """Get recent SMS history"""
        return self.sms_history[-limit:]


# Global SMS service instance
sms_service = SMSAlertService()


if __name__ == "__main__":
    # Test SMS service
    print("\n📱 Testing FarmOracle SMS Service\n")
    
    service = SMSAlertService()
    
    # Test disease alert
    result = service.send_disease_alert(
        "+254712345678",  # Kenya number format
        "Tomato",
        "Late Blight",
        0.94
    )
    print(f"Disease Alert: {result['success']}")
    
    # Test price alert
    result = service.send_price_alert(
        "+254712345678",
        "Wheat",
        100.0,
        120.0,
        "HOLD - Price increasing"
    )
    print(f"Price Alert: {result['success']}")
    
    # Get statistics
    stats = service.get_statistics()
    print(f"\n📊 Statistics: {stats}")
    
    print("\n✅ SMS Service test complete!")
