/**
 * API Testing Script
 * Comprehensive testing of all consolidated APIs
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || process.env.API_BASE || 'http://localhost:3000';

class APITester {
  constructor() {
    this.results = [];
    this.passed = 0;
    this.failed = 0;
  }

  async test(name, testFn) {
    try {
      console.log(`🧪 Testing: ${name}`);
      await testFn();
      this.results.push({ name, status: 'PASS', error: null });
      this.passed++;
      console.log(`✅ ${name} - PASSED`);
    } catch (error) {
      this.results.push({ name, status: 'FAIL', error: error.message });
      this.failed++;
      console.log(`❌ ${name} - FAILED: ${error.message}`);
    }
  }

  async fetch(url, options = {}) {
    const response = await fetch(`${API_BASE}${url}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  async runAllTests() {
    console.log('🚀 Starting API Tests...\n');

    // Test consolidated expenses API
    await this.test('Expenses API - GET', async () => {
      const data = await this.fetch('/api/expenses');
      if (!data.success || !Array.isArray(data.data)) {
        throw new Error('Invalid response format');
      }
    });

    await this.test('Expenses API - GET with filters', async () => {
      const data = await this.fetch('/api/expenses?limit=5&status=Pending');
      if (!data.success || !Array.isArray(data.data)) {
        throw new Error('Invalid response format');
      }
    });

    // Test consolidated projects API
    await this.test('Projects API - GET', async () => {
      const data = await this.fetch('/api/projects');
      if (!data.success || !Array.isArray(data.data)) {
        throw new Error('Invalid response format');
      }
    });

    await this.test('Projects API - GET with count', async () => {
      const data = await this.fetch('/api/projects?count=true');
      if (!data.success || typeof data.count !== 'number') {
        throw new Error('Invalid count response');
      }
    });

    await this.test('Projects API - GET with filters', async () => {
      const data = await this.fetch('/api/projects?status=Pending&limit=10');
      if (!data.success || !Array.isArray(data.data)) {
        throw new Error('Invalid response format');
      }
    });

    // Test enhanced stocks API
    await this.test('Stocks API - GET', async () => {
      const data = await this.fetch('/api/stocks');
      if (!data.success || !Array.isArray(data.data)) {
        throw new Error('Invalid response format');
      }
    });

    await this.test('Stocks API - GET with count', async () => {
      const data = await this.fetch('/api/stocks?count=true');
      if (typeof data.count !== 'number') {
        throw new Error('Invalid count response');
      }
    });

    await this.test('Stocks API - GET with search', async () => {
      const data = await this.fetch('/api/stocks?search=test&limit=5');
      if (!data.success || !Array.isArray(data.data)) {
        throw new Error('Invalid response format');
      }
    });

    await this.test('Stocks API - GET low stock', async () => {
      const data = await this.fetch('/api/stocks?low_stock=true&low_stock_threshold=10');
      if (!data.success || !Array.isArray(data.data)) {
        throw new Error('Invalid response format');
      }
    });

    // Test enhanced customers API
    await this.test('Customers API - GET', async () => {
      const data = await this.fetch('/api/customers');
      if (!data.success || !Array.isArray(data.data)) {
        throw new Error('Invalid response format');
      }
    });

    await this.test('Customers API - GET with count', async () => {
      const data = await this.fetch('/api/customers?count=true');
      if (typeof data.count !== 'number') {
        throw new Error('Invalid count response');
      }
    });

    await this.test('Customers API - GET with search', async () => {
      const data = await this.fetch('/api/customers?search=test&limit=5');
      if (!data.success || !Array.isArray(data.data)) {
        throw new Error('Invalid response format');
      }
    });

    // Test enhanced employees API
    await this.test('Employees API - GET', async () => {
      const data = await this.fetch('/api/employees');
      if (!data.success || !Array.isArray(data.data)) {
        throw new Error('Invalid response format');
      }
    });

    // Test enhanced inventory spent API
    await this.test('Inventory Spent API - GET', async () => {
      const data = await this.fetch('/api/inventory_spent');
      if (!data.success || !Array.isArray(data.data)) {
        throw new Error('Invalid response format');
      }
    });

    await this.test('Inventory Spent API - GET with filters', async () => {
      const data = await this.fetch('/api/inventory_spent?limit=5');
      if (!data.success || !Array.isArray(data.data)) {
        throw new Error('Invalid response format');
      }
    });

    // Test status-based projects API
    await this.test('Status Projects API - Pending', async () => {
      const data = await this.fetch('/api/Pending');
      if (!data.success || !Array.isArray(data.data)) {
        throw new Error('Invalid response format');
      }
    });

    await this.test('Status Projects API - Completed', async () => {
      const data = await this.fetch('/api/Completed');
      if (!data.success || !Array.isArray(data.data)) {
        throw new Error('Invalid response format');
      }
    });

    // Test individual project API
    await this.test('Individual Project API', async () => {
      // First get a project ID
      const projects = await this.fetch('/api/projects?limit=1');
      if (projects.success && projects.data.length > 0) {
        const projectId = projects.data[0].pid;
        const data = await this.fetch(`/api/projects/${projectId}`);
        if (!data.success || !data.data) {
          throw new Error('Invalid project response');
        }
      }
    });

    this.printResults();
  }

  printResults() {
    console.log('\n📊 Test Results Summary:');
    console.log('========================');
    console.log(`✅ Passed: ${this.passed}`);
    console.log(`❌ Failed: ${this.failed}`);
    console.log(`📈 Success Rate: ${((this.passed / (this.passed + this.failed)) * 100).toFixed(1)}%`);

    if (this.failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.results
        .filter(r => r.status === 'FAIL')
        .forEach(r => console.log(`   - ${r.name}: ${r.error}`));
    }

    console.log('\n🎯 Recommendations:');
    if (this.failed === 0) {
      console.log('   ✅ All APIs are working correctly!');
      console.log('   ✅ Ready for production deployment');
    } else {
      console.log('   ⚠️  Fix failing APIs before deployment');
      console.log('   ⚠️  Check database connections and data integrity');
    }
  }
}

// Run tests if called directly
if (require.main === module) {
  const tester = new APITester();
  tester.runAllTests().catch(console.error);
}

module.exports = APITester;
