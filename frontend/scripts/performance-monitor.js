/**
 * Performance Monitoring Script
 * Monitor API response times and database performance
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || process.env.API_BASE || 'http://localhost:3000';

class PerformanceMonitor {
  constructor() {
    this.metrics = [];
    this.thresholds = {
      fast: 200,    // < 200ms
      medium: 500,  // 200-500ms
      slow: 1000,   // 500-1000ms
      // > 1000ms is very slow
    };
  }

  async measureAPI(name, url, options = {}) {
    const startTime = performance.now();
    
    try {
      const response = await fetch(`${API_BASE}${url}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });

      const endTime = performance.now();
      const duration = endTime - startTime;
      
      const data = await response.json();
      const dataSize = JSON.stringify(data).length;

      this.metrics.push({
        name,
        url,
        duration: Math.round(duration),
        status: response.status,
        success: response.ok,
        dataSize,
        timestamp: new Date().toISOString()
      });

      return { duration, success: response.ok, data };
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;

      this.metrics.push({
        name,
        url,
        duration: Math.round(duration),
        status: 0,
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });

      throw error;
    }
  }

  categorizePerformance(duration) {
    if (duration < this.thresholds.fast) return 'fast';
    if (duration < this.thresholds.medium) return 'medium';
    if (duration < this.thresholds.slow) return 'slow';
    return 'very-slow';
  }

  getPerformanceEmoji(category) {
    const emojis = {
      'fast': '🚀',
      'medium': '⚡',
      'slow': '🐌',
      'very-slow': '🔥'
    };
    return emojis[category] || '❓';
  }

  async runPerformanceTests() {
    console.log('🔍 Starting Performance Tests...\n');

    const tests = [
      { name: 'Dashboard Data', url: '/api/projects?count=true' },
      { name: 'Stocks List', url: '/api/stocks?limit=50' },
      { name: 'Stocks Count', url: '/api/stocks?count=true' },
      { name: 'Categories', url: '/api/categories' },
      { name: 'Customers List', url: '/api/customers?limit=50' },
      { name: 'Customers Count', url: '/api/customers?count=true' },
      { name: 'Projects List', url: '/api/projects?limit=50' },
      { name: 'Projects Count', url: '/api/projects?count=true' },
      { name: 'Expenses List', url: '/api/expenses?limit=50' },
      { name: 'Employees List', url: '/api/employees' },
      { name: 'Inventory Spent', url: '/api/inventory_spent?limit=20' },
      { name: 'Pending Projects', url: '/api/Pending?limit=20' },
      { name: 'Completed Projects', url: '/api/Completed?limit=20' },
    ];

    // Run each test multiple times for average
    for (const test of tests) {
      const runs = [];
      
      for (let i = 0; i < 3; i++) {
        try {
          const result = await this.measureAPI(test.name, test.url);
          runs.push(result.duration);
          
          // Small delay between runs
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.log(`❌ ${test.name} failed: ${error.message}`);
        }
      }

      if (runs.length > 0) {
        const avgDuration = Math.round(runs.reduce((a, b) => a + b, 0) / runs.length);
        const category = this.categorizePerformance(avgDuration);
        const emoji = this.getPerformanceEmoji(category);
        
        console.log(`${emoji} ${test.name}: ${avgDuration}ms (${category})`);
      }
    }

    this.generateReport();
  }

  generateReport() {
    console.log('\n📊 Performance Report');
    console.log('=====================');

    const successfulMetrics = this.metrics.filter(m => m.success);
    const failedMetrics = this.metrics.filter(m => !m.success);

    if (successfulMetrics.length === 0) {
      console.log('❌ No successful API calls to analyze');
      return;
    }

    // Calculate statistics
    const durations = successfulMetrics.map(m => m.duration);
    const avgDuration = Math.round(durations.reduce((a, b) => a + b, 0) / durations.length);
    const minDuration = Math.min(...durations);
    const maxDuration = Math.max(...durations);
    const medianDuration = Math.round(durations.sort((a, b) => a - b)[Math.floor(durations.length / 2)]);

    // Performance categories
    const fast = successfulMetrics.filter(m => m.duration < this.thresholds.fast).length;
    const medium = successfulMetrics.filter(m => 
      m.duration >= this.thresholds.fast && m.duration < this.thresholds.medium
    ).length;
    const slow = successfulMetrics.filter(m => 
      m.duration >= this.thresholds.medium && m.duration < this.thresholds.slow
    ).length;
    const verySlow = successfulMetrics.filter(m => m.duration >= this.thresholds.slow).length;

    console.log(`📈 Average Response Time: ${avgDuration}ms`);
    console.log(`⚡ Fastest: ${minDuration}ms`);
    console.log(`🐌 Slowest: ${maxDuration}ms`);
    console.log(`📊 Median: ${medianDuration}ms`);
    console.log(`✅ Success Rate: ${((successfulMetrics.length / this.metrics.length) * 100).toFixed(1)}%`);

    console.log('\n🎯 Performance Distribution:');
    console.log(`🚀 Fast (<${this.thresholds.fast}ms): ${fast} APIs`);
    console.log(`⚡ Medium (${this.thresholds.fast}-${this.thresholds.medium}ms): ${medium} APIs`);
    console.log(`🐌 Slow (${this.thresholds.medium}-${this.thresholds.slow}ms): ${slow} APIs`);
    console.log(`🔥 Very Slow (>${this.thresholds.slow}ms): ${verySlow} APIs`);

    if (failedMetrics.length > 0) {
      console.log(`\n❌ Failed APIs: ${failedMetrics.length}`);
      failedMetrics.forEach(m => {
        console.log(`   - ${m.name}: ${m.error || 'Unknown error'}`);
      });
    }

    // Recommendations
    console.log('\n💡 Recommendations:');
    if (avgDuration < this.thresholds.fast) {
      console.log('   ✅ Excellent performance! All APIs are fast.');
    } else if (avgDuration < this.thresholds.medium) {
      console.log('   ⚡ Good performance. Consider optimizing slower endpoints.');
    } else if (avgDuration < this.thresholds.slow) {
      console.log('   ⚠️  Performance needs improvement. Focus on database optimization.');
    } else {
      console.log('   🚨 Poor performance! Immediate optimization required.');
      console.log('   🔧 Check database connections, queries, and server resources.');
    }

    if (verySlow > 0) {
      console.log('   🎯 Priority: Optimize very slow APIs first');
      console.log('   💾 Consider implementing caching for slow endpoints');
    }

    if (slow + verySlow > successfulMetrics.length * 0.3) {
      console.log('   📊 Consider database indexing and query optimization');
      console.log('   🔄 Implement connection pooling if not already done');
    }

    // Data size analysis
    const totalDataSize = successfulMetrics.reduce((sum, m) => sum + (m.dataSize || 0), 0);
    const avgDataSize = Math.round(totalDataSize / successfulMetrics.length);
    
    console.log(`\n📦 Data Transfer:`);
    console.log(`   Average Response Size: ${(avgDataSize / 1024).toFixed(1)}KB`);
    
    if (avgDataSize > 50000) { // 50KB
      console.log('   ⚠️  Large response sizes detected. Consider pagination.');
    }
  }
}

// Run performance tests if called directly
if (require.main === module) {
  const monitor = new PerformanceMonitor();
  monitor.runPerformanceTests().catch(console.error);
}

module.exports = PerformanceMonitor;
