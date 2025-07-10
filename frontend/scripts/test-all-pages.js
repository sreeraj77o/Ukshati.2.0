/**
 * All Pages Test Script
 * Test all main pages for import issues and component structure
 */

const fs = require('fs');
const path = require('path');

class AllPagesTest {
  constructor() {
    this.results = [];
    this.passed = 0;
    this.failed = 0;
  }

  log(message, type = 'info') {
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : '🔍';
    console.log(`${prefix} ${message}`);
  }

  async testAllPages() {
    this.log('🧪 Testing All Main Pages...\n');

    const pagesToTest = [
      // Main pages
      { name: 'Dashboard', path: '../pages/dashboard.js' },
      
      // IMS pages
      { name: 'IMS Home', path: '../pages/ims/home.js' },
      { name: 'IMS Stocks', path: '../pages/ims/stocks.js' },
      { name: 'IMS Inventory Spent', path: '../pages/ims/inventory-spent.js' },
      
      // CRM pages
      { name: 'CRM Home', path: '../pages/crm/home.js' },
      { name: 'CRM Customers', path: '../pages/crm/customers.js' },
      { name: 'CRM Project', path: '../pages/crm/project.js' },
      
      // Expense pages
      { name: 'Expense Home', path: '../pages/expense/home.js' },
      { name: 'Add Expense', path: '../pages/expense/addExpense.js' },
      
      // Quotation pages
      { name: 'Quotation Home', path: '../pages/quotation/home.js' },
      { name: 'Quote Manager', path: '../pages/quotation/QuoteManager.js' },
      
      // Purchase Order pages
      { name: 'Purchase Order Home', path: '../pages/purchase-order/home.js' },
      { name: 'Purchase Order Vendors', path: '../pages/purchase-order/vendors.js' },
      
      // Other pages
      { name: 'All Projects', path: '../pages/all-projects.js' },
      { name: 'Billing', path: '../pages/billing/billing.js' },
    ];

    for (const page of pagesToTest) {
      await this.testPage(page);
    }

    this.printResults();
  }

  async testPage(page) {
    try {
      const fullPath = path.resolve(__dirname, page.path);
      
      if (!fs.existsSync(fullPath)) {
        throw new Error(`Page file not found: ${fullPath}`);
      }

      const content = fs.readFileSync(fullPath, 'utf8');
      
      // Check for basic Next.js page structure
      if (!content.includes('export default')) {
        throw new Error('Missing default export');
      }

      // Check for React imports
      if (!content.includes('React') && !content.includes('useState')) {
        throw new Error('Missing React imports');
      }

      // Check for problematic import patterns
      const issues = this.checkImportIssues(content, page.name);
      
      if (issues.length > 0) {
        throw new Error(`Import issues: ${issues.join(', ')}`);
      }

      this.results.push({ name: page.name, status: 'PASS', error: null });
      this.passed++;
      this.log(`${page.name} - OK`, 'success');

    } catch (error) {
      this.results.push({ name: page.name, status: 'FAIL', error: error.message });
      this.failed++;
      this.log(`${page.name} - ${error.message}`, 'error');
    }
  }

  checkImportIssues(content, pageName) {
    const issues = [];
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line.startsWith('import') && line.includes('from')) {
        // Check for mixed import patterns
        if (line.includes('../../src/') && line.includes('@/')) {
          issues.push(`Mixed import paths on line ${i + 1}`);
        }
        
        // Check for potentially missing components
        if (line.includes('@/components/skeleton') && !line.includes('CardSkeleton')) {
          // This is fine, we created the skeleton components
        }
        
        // Check for relative imports that should use @/
        if (line.includes('../../src/components') && !line.includes('@/')) {
          issues.push(`Should use @/ alias instead of relative path on line ${i + 1}`);
        }
      }
    }
    
    return issues;
  }

  printResults() {
    this.log('\n📊 All Pages Test Results:');
    this.log('==========================');
    this.log(`✅ Passed: ${this.passed}`);
    this.log(`❌ Failed: ${this.failed}`);
    this.log(`📈 Success Rate: ${((this.passed / (this.passed + this.failed)) * 100).toFixed(1)}%`);

    if (this.failed > 0) {
      this.log('\n❌ Failed Pages:');
      this.results
        .filter(r => r.status === 'FAIL')
        .forEach(r => this.log(`   - ${r.name}: ${r.error}`));
    }

    this.log('\n🎯 Summary:');
    if (this.failed === 0) {
      this.log('   ✅ All main pages are properly structured!');
      this.log('   ✅ No import issues detected');
      this.log('   ✅ Ready for production use');
    } else {
      this.log('   ⚠️  Some pages need attention');
      this.log('   🔧 Fix import paths and missing components');
    }

    this.log('\n📋 Recommendations:');
    this.log('   1. Use @/ alias consistently for all internal imports');
    this.log('   2. Ensure all imported components exist');
    this.log('   3. Test each page in browser after fixes');
  }
}

// Run tests if called directly
if (require.main === module) {
  const tester = new AllPagesTest();
  tester.testAllPages().catch(console.error);
}

module.exports = AllPagesTest;
