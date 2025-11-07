#!/bin/bash

# Pre-push validation script for TaskFeed
# Run this before pushing to GitHub to catch deployment errors

set -e  # Exit on any error

echo "🔍 Running pre-push validation checks..."
echo "========================================"

# 1. TypeScript Check
echo "📝 Checking TypeScript..."
npx tsc --noEmit
echo "✅ TypeScript check passed"

# 2. ESLint Check (warnings allowed, only errors fail)
echo "📝 Running ESLint..."
if ! npm run lint -- --max-warnings=999; then
    echo "❌ ESLint found errors that must be fixed"
    exit 1
fi
echo "✅ ESLint check passed (warnings allowed)"

# 3. Production Build
echo "📝 Building for production..."
npm run build
echo "✅ Production build successful"

# 4. Check for common issues
echo "📝 Checking for common deployment issues..."

# Check for console.log statements (optional warning)
if grep -r "console\." src/ --exclude-dir=node_modules > /dev/null 2>&1; then
    echo "⚠️  Warning: console statements found in code"
    grep -r "console\." src/ --exclude-dir=node_modules | head -5
    echo "   (This won't break deployment but should be removed for production)"
fi

# Check for TODO comments
if grep -r "TODO\|FIXME" src/ --exclude-dir=node_modules > /dev/null 2>&1; then
    echo "⚠️  Warning: TODO/FIXME comments found:"
    grep -r "TODO\|FIXME" src/ --exclude-dir=node_modules | head -5
fi

echo ""
echo "🎉 All checks passed! Safe to push to GitHub."
echo "   Your deployment should succeed on Vercel."