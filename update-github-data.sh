#!/bin/bash

# Simple script to update GitHub contributions data
# This is meant to be run manually when you want to refresh the data

echo "📡 Updating GitHub contributions data..."

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed."
    exit 1
fi

# Check if the script exists
SCRIPT_PATH="scripts/fetch-github-data.js"
if [ ! -f "$SCRIPT_PATH" ]; then
    echo "❌ GitHub data fetcher script not found at $SCRIPT_PATH"
    exit 1
fi

# Run the data collection script
echo "🔄 Running data collection script..."
if node "$SCRIPT_PATH"; then
    echo "✅ GitHub contributions data updated successfully!"
    echo "📂 Data saved to github-contributions.json"
    
    # Show file size and modification date
    if [ -f "github-contributions.json" ]; then
        FILE_SIZE=$(du -h "github-contributions.json" | cut -f1)
        FILE_DATE=$(date -r "github-contributions.json" '+%Y-%m-%d %H:%M:%S')
        echo "📊 File size: $FILE_SIZE"
        echo "📅 Last updated: $FILE_DATE"
    fi
else
    echo "❌ Failed to update GitHub contributions data"
    exit 1
fi

echo ""
echo "💡 To update the data regularly, you can:"
echo "   1. Run this script manually: ./update-github-data.sh"
echo "   2. Set up a GitHub Action to run it on a schedule"
echo "   3. Run it before deploying your site"