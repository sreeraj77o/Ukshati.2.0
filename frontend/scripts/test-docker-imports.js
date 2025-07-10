/**
 * Docker Import Test
 * Test if all imports work correctly in Docker environment
 */

const fs = require('fs');
const path = require('path');

class DockerImportTest {
  constructor() {
    this.results = [];
    this.passed = 0;
    this.failed = 0;
  }

  log(message, type = 'info') {
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : '🔍';
    console.log(`${prefix} ${message}`);
  }

  async testDockerImports() {
    this.log('🐳 Testing Docker Import Paths...\n');

    // Test critical component paths that were causing issues
    const pathsToTest = [
      // UI Components
      { name: 'UI Index', path: '../src/components/ui/index.js' },
      { name: 'Button Component', path: '../src/components/ui/Button/Button.js' },
      { name: 'Card Component', path: '../src/components/ui/Card/Card.js' },
      
      // Dashboard Components
      { name: 'Dashboard Index', path: '../src/components/dashboard/index.js' },
      { name: 'DashboardStats', path: '../src/components/dashboard/DashboardStats/DashboardStats.js' },
      { name: 'DashboardFeatures', path: '../src/components/dashboard/DashboardFeatures/DashboardFeatures.js' },
      
      // IMS Components
      { name: 'IMS Index', path: '../src/components/ims/index.js' },
      { name: 'IMSStats', path: '../src/components/ims/IMSStats/IMSStats.js' },
      
      // CRM Components
      { name: 'CRM Index', path: '../src/components/crm/index.js' },
      { name: 'CustomerForm', path: '../src/components/crm/CustomerForm/CustomerForm.js' },
      
      // Skeleton Components
      { name: 'Skeleton Index', path: '../src/components/skeleton/index.js' },
      { name: 'DashboardSkeleton', path: '../src/components/skeleton/DashboardSkeleton.js' },
      
      // Hooks
      { name: 'useDashboard Hook', path: '../src/hooks/useDashboard.js' },
      { name: 'useCache Hook', path: '../src/hooks/useCache.js' },
      { name: 'useCRM Hook', path: '../src/hooks/useCRM.js' },
    ];

    for (const pathTest of pathsToTest) {
      await this.testPath(pathTest);
    }

    this.printResults();
  }

  async testPath(pathTest) {
    try {
      const fullPath = path.resolve(__dirname, pathTest.path);
      
      if (!fs.existsSync(fullPath)) {
        throw new Error(`File not found: ${fullPath}`);
      }

      const content = fs.readFileSync(fullPath, 'utf8');
      
      // Check for proper exports
      if (!content.includes('export')) {
        throw new Error('No export statement found');
      }

      // Check file size (should not be empty)
      if (content.trim().length < 10) {
        throw new Error('File appears to be empty or too small');
      }

      this.results.push({ name: pathTest.name, status: 'PASS', error: null });
      this.passed++;
      this.log(`${pathTest.name} - OK`, 'success');

    } catch (error) {
      this.results.push({ name: pathTest.name, status: 'FAIL', error: error.message });
      this.failed++;
      this.log(`${pathTest.name} - ${error.message}`, 'error');
    }
  }

  printResults() {
    this.log('\n📊 Docker Import Test Results:');
    this.log('===============================');
    this.log(`✅ Passed: ${this.passed}`);
    this.log(`❌ Failed: ${this.failed}`);
    this.log(`📈 Success Rate: ${((this.passed / (this.passed + this.failed)) * 100).toFixed(1)}%`);

    if (this.failed > 0) {
      this.log('\n❌ Failed Paths:');
      this.results
        .filter(r => r.status === 'FAIL')
        .forEach(r => this.log(`   - ${r.name}: ${r.error}`));
    }

    this.log('\n🎯 Docker Status:');
    if (this.failed === 0) {
      this.log('   ✅ All import paths are accessible in Docker!');
      this.log('   ✅ Components should load correctly');
      this.log('   ✅ Ready to test in browser');
    } else {
      this.log('   ⚠️  Some paths are not accessible');
      this.log('   🔧 Check file structure and Docker volume mounts');
    }

    this.log('\n🚀 Next Steps:');
    this.log('   1. Start Docker: docker-compose up --build');
    this.log('   2. Test dashboard: http://localhost:3000/dashboard');
    this.log('   3. Check browser console for any remaining errors');
  }
}

// Run tests if called directly
if (require.main === module) {
  const tester = new DockerImportTest();
  tester.testDockerImports().catch(console.error);
}

module.exports = DockerImportTest;
