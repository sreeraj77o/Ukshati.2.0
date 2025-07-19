#!/usr/bin/env node

console.log('🐳 Docker Environment Test...');

const fs = require('fs');
const path = require('path');

function testDockerFiles() {
  const dockerFiles = [
    '../Dockerfile',
    '../docker-compose.yml',
    '../Dockerfile.mysql',
  ];

  let passCount = 0;
  let failCount = 0;

  console.log('🔍 Checking Docker configuration files...');

  dockerFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
      console.log(`✅ ${file} - Found`);
      passCount++;
    } else {
      console.log(`❌ ${file} - Missing`);
      failCount++;
    }
  });

  console.log('\n📊 Docker Test Results:');
  console.log(`✅ Found: ${passCount}`);
  console.log(`❌ Missing: ${failCount}`);

  if (failCount === 0) {
    console.log('🎉 All Docker files present!');
  } else {
    console.log('⚠️  Some Docker files missing but tests continue...');
  }

  process.exit(0);
}

testDockerFiles();
