"""
Agent Scheduler for 24/7 Autonomous Operations
Runs monitoring cycles and blockchain feedback loops continuously
"""

import logging
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from datetime import datetime
import asyncio
from typing import List, Dict, Any

from autonomous_oracle import autonomous_agent
from blockchain_listener import feedback_loop

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class AgentScheduler:
    """
    Manages 24/7 autonomous agent operations
    Schedules monitoring cycles and learning loops
    """
    
    def __init__(self):
        self.scheduler = AsyncIOScheduler()
        self.active_crops = []
        self.is_running = False
        
        logger.info("⏰ Agent Scheduler initialized")
    
    def start_autonomous_operations(self, crop_ids: List[str]):
        """
        Start 24/7 autonomous operations
        """
        try:
            self.active_crops = crop_ids
            
            # Schedule crop monitoring every 5 minutes
            self.scheduler.add_job(
                self._monitoring_cycle,
                trigger=IntervalTrigger(minutes=5),
                id='crop_monitoring',
                name='Autonomous Crop Monitoring',
                replace_existing=True
            )
            
            # Schedule blockchain feedback loop every 10 minutes
            self.scheduler.add_job(
                self._learning_cycle,
                trigger=IntervalTrigger(minutes=10),
                id='blockchain_learning',
                name='Blockchain Feedback Learning',
                replace_existing=True
            )
            
            # Schedule market analysis every 30 minutes
            self.scheduler.add_job(
                self._market_analysis_cycle,
                trigger=IntervalTrigger(minutes=30),
                id='market_analysis',
                name='Market Price Analysis',
                replace_existing=True
            )
            
            # Start the scheduler
            self.scheduler.start()
            self.is_running = True
            
            autonomous_agent.start_monitoring(crop_ids)
            feedback_loop.start_learning()
            
            logger.info(f"🚀 Started 24/7 autonomous operations for {len(crop_ids)} crops")
            
            return {
                "status": "started",
                "crops_monitored": len(crop_ids),
                "monitoring_interval": "5 minutes",
                "learning_interval": "10 minutes",
                "market_analysis_interval": "30 minutes",
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error starting autonomous operations: {e}")
            return {"status": "error", "message": str(e)}
    
    async def _monitoring_cycle(self):
        """Execute monitoring cycle for all active crops"""
        try:
            logger.info(f"🔄 Running monitoring cycle for {len(self.active_crops)} crops")
            
            for crop_id in self.active_crops:
                result = await autonomous_agent.autonomous_monitoring_cycle(crop_id)
                logger.info(f"✅ Monitored {crop_id}: {result.get('status')}")
            
        except Exception as e:
            logger.error(f"Error in monitoring cycle: {e}")
    
    async def _learning_cycle(self):
        """Execute blockchain learning cycle"""
        try:
            logger.info("🧠 Running blockchain learning cycle")
            
            # Listen to blockchain events
            sales = await feedback_loop.listen_to_crop_sales()
            outcomes = await feedback_loop.listen_to_disease_outcomes()
            
            logger.info(f"✅ Processed {len(sales)} sales and {len(outcomes)} outcomes")
            
        except Exception as e:
            logger.error(f"Error in learning cycle: {e}")
    
    async def _market_analysis_cycle(self):
        """Execute market price analysis"""
        try:
            logger.info("💰 Running market analysis cycle")
            
            # Analyze prices for all crop types
            crop_types = ["tomato", "wheat", "banana", "onion", "carrot"]
            
            for crop_type in crop_types:
                result = autonomous_agent._predict_market_price(crop_type)
                logger.info(f"✅ Analyzed {crop_type} market")
            
        except Exception as e:
            logger.error(f"Error in market analysis: {e}")
    
    def stop_autonomous_operations(self):
        """Stop all autonomous operations"""
        try:
            self.scheduler.shutdown()
            self.is_running = False
            
            autonomous_agent.stop_monitoring()
            feedback_loop.stop_learning()
            
            logger.info("⏸️ Stopped autonomous operations")
            
            return {
                "status": "stopped",
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error stopping operations: {e}")
            return {"status": "error", "message": str(e)}
    
    def get_scheduler_status(self) -> Dict[str, Any]:
        """Get current scheduler status"""
        jobs = self.scheduler.get_jobs() if self.is_running else []
        
        return {
            "running": self.is_running,
            "active_crops": len(self.active_crops),
            "scheduled_jobs": len(jobs),
            "jobs": [
                {
                    "id": job.id,
                    "name": job.name,
                    "next_run": job.next_run_time.isoformat() if job.next_run_time else None
                }
                for job in jobs
            ],
            "agent_status": autonomous_agent.get_agent_status(),
            "learning_status": feedback_loop.get_feedback_summary(),
            "timestamp": datetime.now().isoformat()
        }


# Global scheduler instance
agent_scheduler = AgentScheduler()


if __name__ == "__main__":
    # Test the scheduler
    scheduler = AgentScheduler()
    
    print("\n⏰ Testing Agent Scheduler\n")
    
    # Start operations
    result = scheduler.start_autonomous_operations(["CROP_001", "CROP_002", "CROP_003"])
    print(f"✅ Started: {result}")
    
    # Get status
    status = scheduler.get_scheduler_status()
    print(f"\n📊 Status: {status}")
    
    # Keep running for a bit
    import time
    print("\n⏳ Running for 30 seconds...")
    time.sleep(30)
    
    # Stop operations
    stop_result = scheduler.stop_autonomous_operations()
    print(f"\n⏸️ Stopped: {stop_result}")
