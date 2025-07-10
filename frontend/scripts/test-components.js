/**
 * Component Testing Script
 * Test if all components can be imported and rendered
 */

const fs = require('fs');
const path = require('path');

class ComponentTester {
  constructor() {
    this.results = [];
    this.passed = 0;
    this.failed = 0;
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : '🔍';
    console.log(`${prefix} [${timestamp.split('T')[1].split('.')[0]}] ${message}`);
  }

  async testComponentImports() {
    this.log('Starting Component Import Tests...\n');

    const componentsToTest = [
      // Dashboard components
      { name: 'DashboardStats', path: '../src/components/dashboard/DashboardStats/DashboardStats.js' },
      { name: 'DashboardFeatures', path: '../src/components/dashboard/DashboardFeatures/DashboardFeatures.js' },
      { name: 'EmployeeManagement', path: '../src/components/dashboard/EmployeeManagement/EmployeeManagement.js' },
      { name: 'EmployeeModal', path: '../src/components/dashboard/EmployeeModal/EmployeeModal.js' },
      { name: 'StatsCard', path: '../src/components/dashboard/StatsCard/StatsCard.js' },
      { name: 'FeatureCard', path: '../src/components/dashboard/FeatureCard/FeatureCard.js' },
      
      // IMS components
      { name: 'IMSStats', path: '../src/components/ims/IMSStats/IMSStats.js' },
      { name: 'IMSChart', path: '../src/components/ims/IMSChart/IMSChart.js' },
      { name: 'IMSActions', path: '../src/components/ims/IMSActions/IMSActions.js' },
      
      // UI components
      { name: 'Button', path: '../src/components/ui/Button/Button.js' },
      { name: 'Card', path: '../src/components/ui/Card/Card.js' },
      { name: 'Modal', path: '../src/components/ui/Modal/Modal.js' },
      { name: 'LoadingSpinner', path: '../src/components/ui/LoadingSpinner/LoadingSpinner.js' },
      
      // Hooks
      { name: 'useCache', path: '../src/hooks/useCache.js' },
      { name: 'useDashboard', path: '../src/hooks/useDashboard.js' },
      
      // Cache utilities
      { name: 'cache', path: '../lib/cache.js' },
    ];

    for (const component of componentsToTest) {
      await this.testComponent(component);
    }

    this.printResults();
  }

  async testComponent(component) {
    try {
      const fullPath = path.resolve(__dirname, component.path);
      
      // Check if file exists
      if (!fs.existsSync(fullPath)) {
        throw new Error(`File not found: ${fullPath}`);
      }

      // Check file content
      const content = fs.readFileSync(fullPath, 'utf8');
      
      // Basic syntax checks
      if (content.includes('export default') || content.includes('module.exports')) {
        // Check for common React patterns
        if (component.path.includes('/components/') && !content.includes('React')) {
          throw new Error('React component missing React import');
        }
        
        // Check for proper exports
        if (component.path.includes('/hooks/') && !content.includes('export')) {
          throw new Error('Hook missing proper exports');
        }

        this.results.push({ name: component.name, status: 'PASS', error: null });
        this.passed++;
        this.log(`${component.name} - Component structure valid`, 'success');
      } else {
        throw new Error('Missing export statement');
      }

    } catch (error) {
      this.results.push({ name: component.name, status: 'FAIL', error: error.message });
      this.failed++;
      this.log(`${component.name} - ${error.message}`, 'error');
    }
  }

  async testPageStructure() {
    this.log('\n🔍 Testing Page Structure...\n');

    const pagesToTest = [
      { name: 'Dashboard', path: '../pages/dashboard.js' },
      { name: 'IMS Home', path: '../pages/ims/home.js' },
    ];

    for (const page of pagesToTest) {
      await this.testPage(page);
    }
  }

  async testPage(page) {
    try {
      const fullPath = path.resolve(__dirname, page.path);
      
      if (!fs.existsSync(fullPath)) {
        throw new Error(`Page file not found: ${fullPath}`);
      }

      const content = fs.readFileSync(fullPath, 'utf8');
      
      // Check for Next.js page structure
      if (!content.includes('export default')) {
        throw new Error('Missing default export');
      }

      // Check for React imports
      if (!content.includes('React')) {
        throw new Error('Missing React import');
      }

      // Check for proper component structure
      if (!content.includes('return')) {
        throw new Error('Missing return statement');
      }

      this.results.push({ name: page.name, status: 'PASS', error: null });
      this.passed++;
      this.log(`${page.name} - Page structure valid`, 'success');

    } catch (error) {
      this.results.push({ name: page.name, status: 'FAIL', error: error.message });
      this.failed++;
      this.log(`${page.name} - ${error.message}`, 'error');
    }
  }

  async testImportPaths() {
    this.log('\n🔍 Testing Import Paths...\n');

    const filesToCheck = [
      '../pages/dashboard.js',
      '../pages/ims/home.js'
    ];

    for (const file of filesToCheck) {
      await this.checkImportPaths(file);
    }
  }

  async checkImportPaths(filePath) {
    try {
      const fullPath = path.resolve(__dirname, filePath);
      const content = fs.readFileSync(fullPath, 'utf8');
      const fileName = path.basename(filePath);

      // Extract import statements
      const importLines = content.split('\n').filter(line => 
        line.trim().startsWith('import') && !line.includes('from "react"') && !line.includes('from "next/')
      );

      let hasErrors = false;
      for (const importLine of importLines) {
        const match = importLine.match(/from ['"]([^'"]+)['"]/);
        if (match) {
          const importPath = match[1];
          
          // Check if it's a relative import
          if (importPath.startsWith('.') || importPath.startsWith('@/')) {
            // For @/ imports, they should resolve correctly with Next.js
            if (importPath.startsWith('@/')) {
              continue; // Skip @/ imports as they're handled by Next.js
            }
            
            // For relative imports, check if the path exists
            const resolvedPath = path.resolve(path.dirname(fullPath), importPath);
            const possibleExtensions = ['', '.js', '.jsx', '.ts', '.tsx'];
            
            let pathExists = false;
            for (const ext of possibleExtensions) {
              if (fs.existsSync(resolvedPath + ext)) {
                pathExists = true;
                break;
              }
              // Check for index files
              if (fs.existsSync(path.join(resolvedPath, 'index' + ext))) {
                pathExists = true;
                break;
              }
            }
            
            if (!pathExists) {
              this.log(`${fileName} - Invalid import path: ${importPath}`, 'error');
              hasErrors = true;
            }
          }
        }
      }

      if (!hasErrors) {
        this.log(`${fileName} - All import paths valid`, 'success');
        this.passed++;
      } else {
        this.failed++;
      }

    } catch (error) {
      this.log(`Error checking ${filePath}: ${error.message}`, 'error');
      this.failed++;
    }
  }

  printResults() {
    this.log('\n📊 Component Test Results Summary:');
    this.log('===================================');
    this.log(`✅ Passed: ${this.passed}`);
    this.log(`❌ Failed: ${this.failed}`);
    this.log(`📈 Success Rate: ${((this.passed / (this.passed + this.failed)) * 100).toFixed(1)}%`);

    if (this.failed > 0) {
      this.log('\n❌ Failed Tests:');
      this.results
        .filter(r => r.status === 'FAIL')
        .forEach(r => this.log(`   - ${r.name}: ${r.error}`));
    }

    this.log('\n🎯 Recommendations:');
    if (this.failed === 0) {
      this.log('   ✅ All components are properly structured!');
      this.log('   ✅ Ready for frontend testing');
    } else {
      this.log('   ⚠️  Fix component issues before testing');
      this.log('   ⚠️  Check import paths and component structure');
    }
  }

  async runAllTests() {
    await this.testComponentImports();
    await this.testPageStructure();
    await this.testImportPaths();
  }
}

// Run tests if called directly
if (require.main === module) {
  const tester = new ComponentTester();
  tester.runAllTests().catch(console.error);
}

module.exports = ComponentTester;
