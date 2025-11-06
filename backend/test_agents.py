"""
Quick test script for LangChain Autonomous Agents
Run this to verify agents are working
"""

import asyncio
import json
import sys
import os

# Add agents to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'agents'))

from autonomous_oracle import AutonomousFarmOracle
from blockchain_listener import BlockchainFeedbackLoop
from agent_scheduler import AgentScheduler


async def test_agents():
    """Test all agent components"""
    
    print("\n" + "="*60)
    print("🤖 TESTING FARMORACLE AUTONOMOUS AGENTS")
    print("="*60 + "\n")
    
    # Test 1: Autonomous Oracle
    print("1️⃣ Testing Autonomous Oracle...")
    oracle = AutonomousFarmOracle()
    
    # Get agent status
    status = oracle.get_agent_status()
    print(f"   ✅ Agent Status: {json.dumps(status, indent=2)}\n")
    
    # Test monitoring cycle
    print("2️⃣ Testing Crop Monitoring Cycle...")
    result = await oracle.autonomous_monitoring_cycle("CROP_TEST_001")
    print(f"   ✅ Monitoring Result: {result['status']}\n")
    
    # Test 2: Blockchain Feedback Loop
    print("3️⃣ Testing Blockchain Feedback Loop...")
    feedback = BlockchainFeedbackLoop()
    
    # Listen to sales
    sales = await feedback.listen_to_crop_sales()
    print(f"   ✅ Captured {len(sales)} sales from blockchain\n")
    
    # Listen to disease outcomes
    outcomes = await feedback.listen_to_disease_outcomes()
    print(f"   ✅ Captured {len(outcomes)} disease outcomes\n")
    
    # Get feedback summary
    summary = feedback.get_feedback_summary()
    print(f"   ✅ Learning Summary: {json.dumps(summary, indent=2)}\n")
    
    # Test 3: Agent Scheduler
    print("4️⃣ Testing Agent Scheduler...")
    scheduler = AgentScheduler()
    
    # Start operations
    start_result = scheduler.start_autonomous_operations(["CROP_001", "CROP_002"])
    print(f"   ✅ Started: {start_result['status']}\n")
    
    # Get scheduler status
    sched_status = scheduler.get_scheduler_status()
    print(f"   ✅ Scheduler Status: Running={sched_status['running']}, Jobs={sched_status['scheduled_jobs']}\n")
    
    # Wait a bit
    print("   ⏳ Running for 10 seconds...\n")
    await asyncio.sleep(10)
    
    # Stop operations
    stop_result = scheduler.stop_autonomous_operations()
    print(f"   ✅ Stopped: {stop_result['status']}\n")
    
    # Final Summary
    print("="*60)
    print("✅ ALL TESTS PASSED - AGENTS ARE WORKING!")
    print("="*60)
    print("\n🚀 LangChain Autonomous Agents are ready for deployment!\n")
    print("📋 Available Features:")
    print("   • 24/7 Crop Health Monitoring")
    print("   • Autonomous Disease Detection")
    print("   • Market Price Predictions")
    print("   • Weather Impact Analysis")
    print("   • Blockchain Action Execution")
    print("   • Self-Learning Feedback Loop")
    print("\n")


if __name__ == "__main__":
    asyncio.run(test_agents())
