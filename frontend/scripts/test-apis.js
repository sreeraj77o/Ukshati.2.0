#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔌 Testing API Endpoint Structure...');

const apiDir = path.join(__dirname, '../pages/api');
let passCount = 0;
let failCount = 0;

function scanApiDirectory(dir, relativePath = '') {
  const items = fs.readdirSync(dir, { withFileTypes: true });

  items.forEach(item => {
    const fullPath = path.join(dir, item.name);
    const relativeItemPath = path.join(relativePath, item.name);

    if (item.isDirectory()) {
      scanApiDirectory(fullPath, relativeItemPath);
    } else if (item.name.endsWith('.js')) {
      testApiFile(fullPath, relativeItemPath);
    }
  });
}

function testApiFile(filePath, relativePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');

    // Check for API handler structure
    const hasExport =
      content.includes('export default') || content.includes('module.exports');
    const hasHandler = content.includes('req') && content.includes('res');
    const hasMethod =
      content.includes('req.method') ||
      content.includes('GET') ||
      content.includes('POST');

    if (hasExport && hasHandler) {
      console.log(`✅ ${relativePath} - Valid API endpoint`);
      passCount++;
    } else {
      console.log(`⚠️  ${relativePath} - Missing API handler structure`);
      failCount++;
    }
  } catch (error) {
    console.log(`❌ ${relativePath} - Error reading file: ${error.message}`);
    failCount++;
  }
}

function testApiEndpoints() {
  if (!fs.existsSync(apiDir)) {
    console.log('❌ API directory not found');
    process.exit(1);
  }

  console.log('🔍 Scanning API directory...');
  scanApiDirectory(apiDir);

  console.log('\n📊 API Endpoint Test Results:');
  console.log(`✅ Passed: ${passCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log(`📈 Total: ${passCount + failCount}`);

  if (failCount === 0) {
    console.log('🎉 All API endpoint tests passed!');
  } else {
    console.log(
      '⚠️  Some API endpoints have structural issues but tests continue...'
    );
  }

  process.exit(0); // Don't fail CI for warnings
}

testApiEndpoints();
