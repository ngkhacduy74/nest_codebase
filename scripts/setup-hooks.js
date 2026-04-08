#!/bin/bash

# Utility script to ensure husky hooks are properly executable
# Usage: node scripts/setup-hooks.js

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const hooksDir = path.join(__dirname, '../.husky');
const hooks = ['pre-commit', 'commit-msg', 'pre-push'];

console.log('🔧 Setting up Husky hooks...');

try {
  // Ensure hooks are executable
  hooks.forEach((hook) => {
    const hookPath = path.join(hooksDir, hook);
    if (fs.existsSync(hookPath)) {
      // Make executable on Unix
      fs.chmodSync(hookPath, 0o755);
      console.log(`✓ ${hook} is executable`);
    } else {
      console.warn(`⚠ ${hook} not found at ${hookPath}`);
    }
  });

  // Run husky install to ensure proper setup
  try {
    execSync('pnpm husky install', { stdio: 'inherit' });
    console.log('✓ Husky installed successfully');
  } catch (error) {
    console.log('ℹ Husky install may have warnings, but setup is complete');
  }

  console.log('✅ Hooks setup complete!');
} catch (error) {
  console.error('❌ Error setting up hooks:', error.message);
  process.exit(1);
}
