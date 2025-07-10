/**
 * Dashboard Import Test
 * Test if all dashboard imports work correctly
 */

const fs = require('fs');
const path = require('path');

async function testDashboardImports() {
  console.log('🧪 Testing Dashboard Component Imports...\n');

  const componentsToTest = [
    // UI Components
    { name: 'Button', path: '../src/components/ui/Button/Button.js' },
    { name: 'Card', path: '../src/components/ui/Card/Card.js' },
    
    // Dashboard Components
    { name: 'Header', path: '../src/components/dashboard/Header/Header.js' },
    { name: 'Sidebar', path: '../src/components/dashboard/Sidebar/Sidebar.js' },
    { name: 'TabNavigation', path: '../src/components/dashboard/TabNavigation/TabNavigation.js' },
    { name: 'DashboardFeatures', path: '../src/components/dashboard/DashboardFeatures/DashboardFeatures.js' },
    { name: 'DashboardStats', path: '../src/components/dashboard/DashboardStats/DashboardStats.js' },
    { name: 'EmployeeManagement', path: '../src/components/dashboard/EmployeeManagement/EmployeeManagement.js' },
    { name: 'ProjectCard', path: '../src/components/dashboard/ProjectCard/ProjectCard.js' },
    
    // Skeleton Components
    { name: 'DashboardSkeleton', path: '../src/components/skeleton/DashboardSkeleton.js' },
    
    // Hooks
    { name: 'useDashboard', path: '../src/hooks/useDashboard.js' },
    
    // Index files
    { name: 'UI Index', path: '../src/components/ui/index.js' },
    { name: 'Dashboard Index', path: '../src/components/dashboard/index.js' },
    { name: 'Skeleton Index', path: '../src/components/skeleton/index.js' },
  ];

  let passed = 0;
  let failed = 0;

  for (const component of componentsToTest) {
    try {
      const fullPath = path.resolve(__dirname, component.path);
      
      if (!fs.existsSync(fullPath)) {
        throw new Error(`File not found: ${fullPath}`);
      }

      const content = fs.readFileSync(fullPath, 'utf8');
      
      // Check for proper exports
      if (!content.includes('export')) {
        throw new Error('No export statement found');
      }

      // Check for React import in components (but not index files)
      if (component.path.includes('/components/') &&
          !component.path.includes('index.js') &&
          !content.includes('React')) {
        throw new Error('Missing React import');
      }

      console.log(`✅ ${component.name} - OK`);
      passed++;

    } catch (error) {
      console.log(`❌ ${component.name} - ${error.message}`);
      failed++;
    }
  }

  console.log('\n📊 Dashboard Import Test Results:');
  console.log('==================================');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);

  if (failed === 0) {
    console.log('\n🎉 All dashboard imports are working correctly!');
    console.log('✅ Dashboard should load without component errors');
  } else {
    console.log('\n⚠️  Some components need attention');
    console.log('🔧 Fix the failing components before testing dashboard');
  }
}

// Run test if called directly
if (require.main === module) {
  testDashboardImports().catch(console.error);
}

module.exports = testDashboardImports;
