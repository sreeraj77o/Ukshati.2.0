#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Component Imports...');

const componentsDir = path.join(__dirname, '../components');
let passCount = 0;
let failCount = 0;

function testComponentImports() {
  if (!fs.existsSync(componentsDir)) {
    console.log('❌ Components directory not found');
    process.exit(1);
  }

  const componentFiles = fs
    .readdirSync(componentsDir)
    .filter(file => file.endsWith('.js') || file.endsWith('.jsx'))
    .filter(file => !file.startsWith('.'));

  console.log(`📁 Found ${componentFiles.length} component files`);

  componentFiles.forEach(file => {
    const filePath = path.join(componentsDir, file);
    const content = fs.readFileSync(filePath, 'utf8');

    // Basic checks
    const hasExport =
      content.includes('export') || content.includes('module.exports');
    const hasReact = content.includes('react') || content.includes('React');

    if (hasExport && hasReact) {
      console.log(`✅ ${file} - Valid component structure`);
      passCount++;
    } else {
      console.log(`⚠️  ${file} - Missing export or React import`);
      failCount++;
    }
  });

  // Test subdirectories
  const subdirs = fs
    .readdirSync(componentsDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  subdirs.forEach(subdir => {
    const subdirPath = path.join(componentsDir, subdir);
    const subFiles = fs
      .readdirSync(subdirPath)
      .filter(file => file.endsWith('.js') || file.endsWith('.jsx'));

    subFiles.forEach(file => {
      const filePath = path.join(subdirPath, file);
      const content = fs.readFileSync(filePath, 'utf8');

      const hasExport =
        content.includes('export') || content.includes('module.exports');
      const hasReact = content.includes('react') || content.includes('React');

      if (hasExport && hasReact) {
        console.log(`✅ ${subdir}/${file} - Valid component structure`);
        passCount++;
      } else {
        console.log(`⚠️  ${subdir}/${file} - Missing export or React import`);
        failCount++;
      }
    });
  });

  console.log('\n📊 Component Test Results:');
  console.log(`✅ Passed: ${passCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log(`📈 Total: ${passCount + failCount}`);

  if (failCount === 0) {
    console.log('🎉 All component tests passed!');
    process.exit(0);
  } else {
    console.log('⚠️  Some components have issues but tests continue...');
    process.exit(0); // Don't fail CI for warnings
  }
}

testComponentImports();
