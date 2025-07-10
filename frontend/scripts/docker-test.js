/**
 * Docker Test Script
 * Test APIs from within Docker container
 */

const API_BASE = 'http://localhost:3000';

class DockerAPITester {
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

  async runBasicTests() {
    console.log('🚀 Starting Docker API Tests...\n');

    // Test basic endpoints
    await this.test('Health Check', async () => {
      const response = await fetch(`${API_BASE}/api/categories`);
      if (!response.ok) {
        throw new Error('Server not responding');
      }
    });

    await this.test('Categories API', async () => {
      const data = await this.fetch('/api/categories');
      if (!Array.isArray(data)) {
        throw new Error('Invalid response format');
      }
    });

    await this.test('Stocks API', async () => {
      const data = await this.fetch('/api/stocks?limit=5');
      if (!data.success || !Array.isArray(data.data)) {
        throw new Error('Invalid response format');
      }
    });

    await this.test('Customers API', async () => {
      const data = await this.fetch('/api/customers?limit=5');
      if (!data.success || !Array.isArray(data.data)) {
        throw new Error('Invalid response format');
      }
    });

    await this.test('Projects API', async () => {
      const data = await this.fetch('/api/projects?limit=5');
      if (!data.success || !Array.isArray(data.data)) {
        throw new Error('Invalid response format');
      }
    });

    await this.test('Employees API', async () => {
      const data = await this.fetch('/api/employees');
      if (!data.success || !Array.isArray(data.data)) {
        throw new Error('Invalid response format');
      }
    });

    this.printResults();
  }

  printResults() {
    console.log('\n📊 Docker Test Results Summary:');
    console.log('================================');
    console.log(`✅ Passed: ${this.passed}`);
    console.log(`❌ Failed: ${this.failed}`);
    console.log(`📈 Success Rate: ${((this.passed / (this.passed + this.failed)) * 100).toFixed(1)}%`);

    if (this.failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.results
        .filter(r => r.status === 'FAIL')
        .forEach(r => console.log(`   - ${r.name}: ${r.error}`));
    }

    console.log('\n🎯 Status:');
    if (this.failed === 0) {
      console.log('   ✅ All APIs working in Docker environment!');
      console.log('   ✅ Ready to test frontend components');
    } else {
      console.log('   ⚠️  Some APIs need attention');
      console.log('   ⚠️  Check Docker container logs');
    }
  }
}

// Run tests if called directly
if (require.main === module) {
  const tester = new DockerAPITester();
  tester.runBasicTests().catch(console.error);
}

module.exports = DockerAPITester;
