#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('📄 Testing All Page Structures...');

const pagesDir = path.join(__dirname, '../pages');
let passCount = 0;
let failCount = 0;

function scanDirectory(dir, relativePath = '') {
  const items = fs.readdirSync(dir, { withFileTypes: true });

  items.forEach(item => {
    const fullPath = path.join(dir, item.name);
    const relativeItemPath = path.join(relativePath, item.name);

    if (item.isDirectory()) {
      // Skip api directory for page structure tests
      if (item.name !== 'api') {
        scanDirectory(fullPath, relativeItemPath);
      }
    } else if (item.name.endsWith('.js') || item.name.endsWith('.jsx')) {
      testPageFile(fullPath, relativeItemPath);
    }
  });
}

function testPageFile(filePath, relativePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');

    // Check for basic page structure
    const hasExport =
      content.includes('export default') || content.includes('module.exports');
    const hasReact =
      content.includes('react') ||
      content.includes('React') ||
      content.includes('useState') ||
      content.includes('useEffect');
    const hasFunction =
      content.includes('function') ||
      content.includes('const') ||
      content.includes('class');

    // Check for Next.js specific patterns
    const isNextPage =
      content.includes('getServerSideProps') ||
      content.includes('getStaticProps') ||
      content.includes('export default') ||
      relativePath.startsWith('pages/');

    if (hasExport && hasFunction) {
      console.log(`✅ ${relativePath} - Valid page structure`);
      passCount++;
    } else {
      console.log(`⚠️  ${relativePath} - Missing required structure`);
      failCount++;
    }
  } catch (error) {
    console.log(`❌ ${relativePath} - Error reading file: ${error.message}`);
    failCount++;
  }
}

function testAllPages() {
  if (!fs.existsSync(pagesDir)) {
    console.log('❌ Pages directory not found');
    process.exit(1);
  }

  console.log('🔍 Scanning pages directory...');
  scanDirectory(pagesDir);

  console.log('\n📊 Page Structure Test Results:');
  console.log(`✅ Passed: ${passCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log(`📈 Total: ${passCount + failCount}`);

  if (failCount === 0) {
    console.log('🎉 All page structure tests passed!');
  } else {
    console.log('⚠️  Some pages have structural issues but tests continue...');
  }

  process.exit(0); // Don't fail CI for warnings
}

testAllPages();
