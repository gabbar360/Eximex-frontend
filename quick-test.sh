#!/bin/bash

echo "⚡ Quick CI/CD Test"
echo "=================="

# Quick checks
echo "🔍 TypeScript..." && npx tsc --noEmit
echo "🏗️ Build..." && npm run build
echo "✅ Done! Build size: $(du -sh dist | cut -f1)"