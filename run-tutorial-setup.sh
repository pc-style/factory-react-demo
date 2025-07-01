#!/bin/bash
set -e

# Define colors for better output
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}--- Starting Factory React Demo Setup ---${NC}"

# --- Step 1: Install dependencies ---
echo -e "${YELLOW}📦 Installing dependencies (this may take a moment)...${NC}"
npm install --silent
echo -e "${GREEN}✅ Dependencies installed.${NC}"

# --- Step 2: Launch the demo (Vite + Electron) ---
echo -e "${YELLOW}🚀 Launching Factory React Demo (Vite + Electron)...${NC}"

# Start the app in the background using the 'start' script defined in package.json
# This script uses 'concurrently' to manage Vite and Electron
npm run start &

# Wait for Vite server to be ready (port 5173)
echo -e "${YELLOW}⏳ Waiting for the demo application to become responsive...${NC}"
TIMEOUT=30 # seconds
for i in $(seq 1 $TIMEOUT); do
  if curl -s http://localhost:5173 > /dev/null; then
    echo -e "${GREEN}🌐 Demo application is responsive!${NC}"
    break
  fi
  sleep 1
  if [ $i -eq $TIMEOUT ]; then
    echo -e "${RED}❌ Demo application did not become responsive within ${TIMEOUT} seconds.${NC}"
    exit 1
  fi
done

echo -e "${GREEN}✅ Factory React Demo is now running!${NC}"
echo -e "${YELLOW}💡 An Electron window should now be visible. Enjoy the demo!${NC}"

# Give some time for Electron to fully render and for visual confirmation
sleep 5

echo -e "${GREEN}--- Factory React Demo is running in the background ---${NC}"
echo -e "${YELLOW}To stop the demo, you can close the Electron window or run: pkill -f \"vite|electron\"${NC}"
