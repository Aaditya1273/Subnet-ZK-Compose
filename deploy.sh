#!/bin/bash

# FarmOracle Deployment Script
# Africa's Autonomous AI Farming Oracle on the Blockchain
# Built for Africa Blockchain Festival 2025

echo "🌍 Deploying FarmOracle - Africa's Autonomous AI Farming Oracle"
echo "🏆 Built for Africa Blockchain Festival 2025"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if .env exists
if [ ! -f .env ]; then
    print_warning "No .env file found. Creating from template..."
    cp .env.example .env
    print_warning "Please edit .env file with your actual values before deploying!"
    exit 1
fi

print_status "Environment file found"

# Backend deployment
echo ""
echo "🔧 Preparing Backend Deployment..."

cd backend

# Install Python dependencies
print_status "Installing Python dependencies..."
pip install -r requirements.txt

# Run tests (if they exist)
if [ -f "test_main.py" ]; then
    print_status "Running backend tests..."
    python -m pytest test_main.py -v
fi

print_status "Backend ready for deployment"

cd ..

# Frontend deployment
echo ""
echo "🎨 Preparing Frontend Deployment..."

cd frontend

# Install Node dependencies
print_status "Installing Node.js dependencies..."
npm install

# Build the frontend
print_status "Building frontend for production..."
npm run build

print_status "Frontend build complete"

# Smart contract deployment (if truffle is available)
if command -v truffle &> /dev/null; then
    echo ""
    echo "⛓️  Preparing Smart Contract Deployment..."
    
    # Check if .env has required blockchain variables
    if grep -q "PRIVATE_KEY=your_wallet_private_key" ../.env; then
        print_warning "Please set your PRIVATE_KEY in .env file for blockchain deployment"
    else
        print_status "Deploying to Polygon Amoy Testnet..."
        truffle migrate --network amoy
        print_status "Smart contract deployed"
    fi
else
    print_warning "Truffle not found. Skipping smart contract deployment."
fi

cd ..

# Final deployment instructions
echo ""
echo "🚀 Deployment Instructions:"
echo ""
echo "Backend (Render):"
echo "1. Connect your GitHub repo to Render"
echo "2. Use render.yaml configuration"
echo "3. Set environment variables in Render dashboard"
echo ""
echo "Frontend (Vercel/Netlify):"
echo "1. Deploy the frontend/build directory"
echo "2. Set REACT_APP_API_URL to your backend URL"
echo ""
echo "Blockchain:"
echo "1. Ensure you have MATIC tokens in your wallet"
echo "2. Add Polygon Amoy network to MetaMask"
echo "3. Update CONTRACT_ADDRESS in .env after deployment"
echo ""

print_status "FarmOracle deployment preparation complete!"
echo "🌍 Ready to empower African farmers with AI & blockchain technology!"
echo "🏆 Good luck at Africa Blockchain Festival 2025!"