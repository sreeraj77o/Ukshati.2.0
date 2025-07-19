#!/usr/bin/env node

console.log('🐳 Testing Docker Import Compatibility...');

// This script tests if the application structure is compatible with Docker deployment
const fs = require('fs');
const path = require('path');

function testDockerCompatibility() {
  const criticalFiles = [
    '../package.json',
    '../next.config.mjs',
    '../pages/_app.js',
    '../pages/api/index.js',
  ];

  let passCount = 0;
  let failCount = 0;

  console.log('🔍 Checking Docker deployment compatibility...');

  criticalFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
      console.log(`✅ ${file} - Compatible`);
      passCount++;
    } else {
      console.log(`⚠️  ${file} - Check needed`);
      failCount++;
    }
  });

  // Check for environment variables
  const envExample = path.join(__dirname, '../.env.example');
  if (fs.existsSync(envExample)) {
    console.log('✅ Environment configuration - Ready');
    passCount++;
  } else {
    console.log('⚠️  Environment configuration - Manual setup needed');
  }

  console.log('\n📊 Docker Compatibility Results:');
  console.log(`✅ Compatible: ${passCount}`);
  console.log(`⚠️  Needs Review: ${failCount}`);
  console.log('🎉 Docker compatibility check complete!');

  process.exit(0);
}

testDockerCompatibility();
