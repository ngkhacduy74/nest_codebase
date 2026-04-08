#!/bin/bash

# Reinitialize Husky hooks
# Run this if your git hooks are corrupted or not working

echo "🔄 Reinitializing Husky hooks..."

# Remove old hooks
rm -rf .husky/_

# Reinstall husky
npm exec husky install

# Verify hooks are in place
echo "✓ Husky reinitialized"
echo ""
echo "Checking hooks:"
ls -la .husky/
echo ""
echo "Make sure these files exist and are executable:"
echo "  - .husky/pre-commit"
echo "  - .husky/commit-msg"
echo "  - .husky/pre-push"
